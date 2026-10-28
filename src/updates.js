'use strict';
const fs=require('node:fs'),path=require('node:path');
const {DAY,normalizeSchedule,dueAt}=require('./update-policy');

class UpdateController {
 constructor({updater,directory,source,changed=()=>{},prompt=async()=>false,clock=Date.now,setTimer=setTimeout,clearTimer=clearTimeout}){
  Object.assign(this,{updater,directory,source,changed,prompt,clock,setTimer,clearTimer});
  this.file=path.join(directory,'update-schedule.json');this.timer=null;this.busy=false;this.prompting=false;this.ready=null;this.stopped=false;
  let stored;try{if(fs.statSync(this.file).size<8192)stored=JSON.parse(fs.readFileSync(this.file,'utf8'));}catch{}
  this.schedule=normalizeSchedule(stored,this.clock());
  this.info={enabled:true,phase:'idle',message:'Checks monthly while KRYLT is open.',progress:0,version:'',lastCheck:this.schedule.lastCheck,nextCheck:dueAt(this.schedule)};
  updater.autoDownload=false;
  updater.autoInstallOnAppQuit=false; // A downloaded update must not silently close the current session.
  updater.autoRunAppAfterInstall=true;
  updater.allowPrerelease=false;
  updater.allowDowngrade=false;
  updater.disableWebInstaller=true;
  updater.setFeedURL({provider:'github',owner:source.owner,repo:source.repo,private:false});
  updater.on('update-available',info=>{this.available=info;});
  updater.on('download-progress',p=>this.setInfo({phase:'downloading',message:'Downloading update…',progress:Math.max(0,Math.min(100,Math.floor(Number(p.percent)||0)))}));
  updater.on('update-downloaded',event=>{
   this.ready=event;this.schedule.pending=true;this.persist();
   this.setInfo({phase:'ready',message:'Update downloaded. Restart to finish installing.',progress:100,version:event.version});
   void this.restart();
  });
  updater.on('error',()=>this.failed());
 }
 status(){return {...this.info,lastCheck:this.schedule.lastCheck,nextCheck:this.ready?0:dueAt(this.schedule)};}
 setInfo(value){Object.assign(this.info,value);this.changed();}
 persist(){
  try{fs.writeFileSync(this.file+'.tmp',JSON.stringify(this.schedule),{mode:0o600});fs.renameSync(this.file+'.tmp',this.file);}
  catch{this.info.storageError='The update schedule could not be saved.';}
 }
 start(){this.arm(10000);}
 stop(){this.stopped=true;this.clearTimer(this.timer);this.timer=null;}
 arm(delay){
  this.clearTimer(this.timer);
  if(this.stopped||this.ready)return;
  const timeout=delay??Math.max(1000,Math.min(DAY,dueAt(this.schedule)-this.clock()));
  this.timer=this.setTimer(()=>{void this.check(false);},timeout);
  this.timer?.unref?.();
 }
 failed(){
  this.schedule.retryAt=this.clock()+DAY;this.persist();
  this.setInfo({phase:'error',message:'The update could not be downloaded or verified. No update was installed. Retrying tomorrow.'});
 }
 async check(manual=true){
  if(this.stopped||this.busy)return this.status();
  if(this.ready){if(manual)await this.restart();return this.status();}
  // Resume a known pending download after reopening; ordinary checks remain monthly.
  const resume=this.schedule.pending&&!this.resumed;
  if(!manual&&!resume&&this.clock()<dueAt(this.schedule)){this.arm();return this.status();}
  this.resumed=true;this.busy=true;this.available=null;this.schedule.lastAttempt=this.clock();this.persist();
  this.setInfo({phase:'checking',message:'Checking GitHub Releases…',progress:0});
  try{
   const result=await this.updater.checkForUpdates();
   if(!result)throw Error('Update check unavailable');
   this.schedule.lastCheck=this.clock();this.schedule.retryAt=0;this.schedule.pending=!!this.available;this.persist();
   if(this.available){
    this.setInfo({phase:'downloading',message:'Downloading update…',version:this.available.version});
    await this.updater.downloadUpdate(); // NSIS updater verifies checksum and Authenticode signer.
   }else this.setInfo({phase:'current',message:'KRYLT is up to date.',version:'',progress:0});
  }catch{this.failed();}
  finally{this.busy=false;this.arm();}
  return this.status();
 }
 async restart(){
  if(this.stopped||!this.ready||this.prompting)return false;
  this.prompting=true;
  try{
   if(!await this.prompt(this.ready.version))return false;
   // Recheck the staged installer's publisher after the user has chosen restart.
   if(typeof this.updater.verifyUpdateCodeSignature!=='function'||!this.ready.downloadedFile)throw Error('Missing installer verification');
   const error=await this.updater.verifyUpdateCodeSignature(this.source.publisherName,this.ready.downloadedFile);
   if(error)throw Error('Installer publisher could not be verified');
   this.setInfo({phase:'installing',message:'Restarting to install the update…'});
   this.updater.quitAndInstall(true,true);
   return true;
  }catch{this.ready=null;this.failed();this.arm();return false;}
  finally{this.prompting=false;}
 }
}
module.exports={UpdateController};
