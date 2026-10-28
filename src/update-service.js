'use strict';
const path=require('node:path');
const {UpdateController}=require('./updates');
const {verifyBuildConfiguration}=require('./update-policy');
function createUpdateService({app,getWindow,dialog,changed}){
 let message='Automatic updates are enabled in signed Windows releases.';
 try{
  if(process.platform!=='win32'||!app.isPackaged)throw Error(message);
  const source=verifyBuildConfiguration(path.join(process.resourcesPath,'app-update.yml'),require('./update-source.json'));
  const {autoUpdater}=require('electron-updater');
  const controller=new UpdateController({updater:autoUpdater,directory:app.getPath('userData'),source,changed,prompt:async version=>{
   const win=getWindow();if(!win||win.isDestroyed())return false;
   const result=await dialog.showMessageBox(win,{type:'info',title:'KRYLT update ready',message:'Restart to finish installing KRYLT '+String(version).slice(0,80)+'?',detail:'Your update has downloaded. Save any work in your tabs before restarting. Windows may ask for administrator approval to update the installed app.',buttons:['Later','Restart and install'],defaultId:0,cancelId:0});
   return result.response===1;
  }});
  controller.start();return controller;
 }catch{if(process.platform==='win32'&&app.isPackaged)message='Monthly updates are not configured for this build. Contact Cyclonix Designs for an update-enabled installer.';}
 return {status:()=>({enabled:false,phase:'disabled',message,lastCheck:0,nextCheck:0,progress:0}),check:async()=>false,restart:async()=>false,stop:()=>{}};
}
module.exports={createUpdateService};
