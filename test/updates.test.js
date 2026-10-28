'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{EventEmitter}=require('node:events');
const {UpdateController}=require('../src/updates');
const {DAY,nextMonth,normalizeSchedule,dueAt,validateSource,verifyBuildConfiguration}=require('../src/update-policy');
const {releaseConfig}=require('../scripts/release-config.cjs');
const {verifyAssets}=require('../scripts/verify-update-assets.cjs');
const source={schemaVersion:1,provider:'github',owner:'CyclonixExample',repo:'tempest-releases',publisherName:['CN=Cyclonix Test Company, O=Cyclonix Test Company, C=ZA']};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function fixture(t,options={}){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tempest-updates-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 let now=Date.UTC(2026,9,28,8),checks=0,downloads=0,installs=0,verifications=0,prompts=0,accept=false,fail=false,signatureError=null;
 class FakeUpdater extends EventEmitter{
  setFeedURL(value){this.feed=value;}
  async checkForUpdates(){checks++;if(fail)throw Error('offline');if(options.available)this.emit('update-available',{version:'3.0.1'});return {updateInfo:{version:'3.0.1'}};}
  async downloadUpdate(){downloads++;if(options.downloadFails)throw Error('network lost');this.emit('download-progress',{percent:44.7});this.emit('update-downloaded',{version:'3.0.1',downloadedFile:'C:\\TempestUpdate.exe'});return ['C:\\TempestUpdate.exe'];}
  async verifyUpdateCodeSignature(names,file){assert.deepEqual(names,source.publisherName);assert.equal(file,'C:\\TempestUpdate.exe');verifications++;return signatureError;}
  quitAndInstall(silent,reopen){assert.equal(silent,true);assert.equal(reopen,true);installs++;}
 }
 const updater=new FakeUpdater();
 const manager=new UpdateController({updater,directory:dir,source,clock:()=>now,setTimer:(cb,ms)=>({cb,ms,unref(){}}),clearTimer:()=>{},prompt:async()=>{prompts++;return accept;}});
 return {manager,updater,dir,get checks(){return checks;},get downloads(){return downloads;},get installs(){return installs;},get verifications(){return verifications;},get prompts(){return prompts;},setNow:v=>{now=v;},accept:()=>{accept=true;},fail:v=>{fail=v;},badSignature:()=>{signatureError='wrong publisher';}};
}
test('monthly schedule handles short months, leap years and year rollover',()=>{
 assert.equal(nextMonth(Date.UTC(2026,0,31,8)),Date.UTC(2026,1,28,8));
 assert.equal(nextMonth(Date.UTC(2028,0,31,8)),Date.UTC(2028,1,29,8));
 assert.equal(nextMonth(Date.UTC(2026,11,31,8)),Date.UTC(2027,0,31,8));
 const now=Date.UTC(2026,9,28);
 assert.deepEqual(normalizeSchedule({lastCheck:now+DAY,lastAttempt:'bad',retryAt:now+5*DAY,pending:'true'},now),{lastCheck:0,lastAttempt:0,retryAt:0,pending:false});
});
test('successful background checks persist and do not repeat before the following month',async t=>{
 const f=fixture(t);await f.manager.check(false);assert.equal(f.checks,1);
 await f.manager.check(false);assert.equal(f.checks,1);
 f.setNow(Date.UTC(2026,10,28,8));await f.manager.check(false);assert.equal(f.checks,2);
 const saved=JSON.parse(fs.readFileSync(path.join(f.dir,'update-schedule.json')));assert.equal(saved.lastCheck,Date.UTC(2026,10,28,8));
 f.manager.arm();assert.ok(f.manager.timer.ms<=DAY);assert.equal(f.updater.allowPrerelease,false);assert.equal(f.updater.allowDowngrade,false);assert.equal(f.updater.autoInstallOnAppQuit,false);
});
test('update downloads automatically, Later keeps browser running, restart verifies publisher before installing',async t=>{
 const f=fixture(t,{available:true});await f.manager.check(false);await tick();
 assert.equal(f.downloads,1);assert.equal(f.prompts,1);assert.equal(f.installs,0);assert.equal(f.manager.status().phase,'ready');
 f.accept();await f.manager.restart();assert.equal(f.verifications,1);assert.equal(f.installs,1);assert.equal(f.manager.status().phase,'installing');
});
test('publisher verification failure never invokes the installer',async t=>{
 const f=fixture(t,{available:true});await f.manager.check(false);await tick();f.accept();f.badSignature();await f.manager.restart();
 assert.equal(f.installs,0);assert.equal(f.manager.status().phase,'error');assert.equal(f.manager.ready,null);
});
test('offline checks retry tomorrow and do not count failure as a successful monthly check',async t=>{
 const f=fixture(t);f.fail(true);await f.manager.check(false);
 assert.equal(f.manager.schedule.lastCheck,0);assert.equal(dueAt(f.manager.schedule),Date.UTC(2026,9,29,8));
 await f.manager.check(false);assert.equal(f.checks,1);
 f.fail(false);f.setNow(Date.UTC(2026,9,29,8));await f.manager.check(false);assert.equal(f.checks,2);assert.equal(f.manager.status().phase,'current');
});
test('failed download remains pending for retry instead of waiting another month',async t=>{
 const f=fixture(t,{available:true,downloadFails:true});await f.manager.check(false);
 assert.equal(f.manager.schedule.pending,true);assert.equal(f.installs,0);assert.equal(f.manager.status().nextCheck,Date.UTC(2026,9,29,8));
});
test('a pending update is rechecked once after reopening to resume its cached download',async t=>{
 const f=fixture(t,{available:true});await f.manager.check(false);await tick();
 const fresh=new UpdateController({updater:f.updater,directory:f.dir,source,clock:()=>Date.UTC(2026,9,28,9),setTimer:()=>null,clearTimer:()=>{}});
 await fresh.check(false);assert.equal(f.checks,2);assert.equal(f.downloads,2);fresh.stop();
});
test('manual checks bypass the monthly interval and concurrent checks are coalesced',async t=>{
 const f=fixture(t);let release;f.updater.checkForUpdates=()=>{return new Promise(r=>{release=r;});};
 const first=f.manager.check(true);assert.equal(f.manager.busy,true);await f.manager.check(true);release({updateInfo:{version:'3.0.0'}});await first;
 let calls=0;f.updater.checkForUpdates=async()=>{calls++;return {updateInfo:{version:'3.0.0'}};};
 await f.manager.check(true);assert.equal(calls,1);f.manager.stop();assert.equal(f.manager.timer,null);
});
test('release source requires a repository and certificate DN; mismatched/missing/disabled verification config is rejected',t=>{
 const f=fixture(t),file=path.join(f.dir,'app-update.yml');
 assert.throws(()=>validateSource({...source,owner:'bad/owner'}));assert.throws(()=>validateSource({...source,publisherName:['Cyclonix Designs']}));assert.throws(()=>validateSource({...source,repo:['repo']}));
 const config={provider:'github',owner:source.owner,repo:source.repo,publisherName:source.publisherName};
 fs.writeFileSync(file,JSON.stringify(config));assert.deepEqual(verifyBuildConfiguration(file,source),source);
 for(const change of [{publisherName:[]},{publisherName:['CN=Attacker']},{repo:'other'},{verifyUpdateCodeSignature:false},{private:true},{token:'do-not-ship'}]){
  fs.writeFileSync(file,JSON.stringify({...config,...change}));assert.throws(()=>verifyBuildConfiguration(file,source));
 }
 assert.throws(()=>verifyBuildConfiguration(file+'-missing',source));
});
test('production release configuration requires signing and emits only public GitHub feed details',()=>{
 const env={TEMPEST_UPDATE_REPOSITORY:'CyclonixExample/tempest-releases',TEMPEST_PUBLISHER_DN:source.publisherName[0],TEMPEST_CERTIFICATE_SHA1:'A'.repeat(40),GH_TOKEN:'must-not-ship'};
 const r=releaseConfig(env,'3.0.0');assert.equal(r.config.forceCodeSigning,true);assert.equal(r.config.win.signAndEditExecutable,true);assert.equal(r.config.win.verifyUpdateCodeSignature,true);
 assert.deepEqual(r.config.win.signtoolOptions.publisherName,source.publisherName);assert.equal(JSON.stringify(r).includes('must-not-ship'),false);
 assert.throws(()=>releaseConfig(env,'3.0.0-dev.7'));assert.throws(()=>releaseConfig({...env,TEMPEST_CERTIFICATE_SHA1:''},'3.0.0'));
});
test('the configured public release repository takes precedence over a private source repository in CI',()=>{
 const env={GITHUB_REPOSITORY:'PrivateCompany/internal-browser-source',TEMPEST_PUBLISHER_DN:source.publisherName[0],TEMPEST_CERTIFICATE_SHA1:'A'.repeat(40)};
 const r=releaseConfig(env,'3.0.0');
 assert.equal(r.source.owner,'Raging-Hacker');assert.equal(r.source.repo,'KRYLT-Browser');assert.equal(r.config.publish[0].private,false);
 assert.throws(()=>releaseConfig({...env,TEMPEST_PUBLISHER_DN:undefined},'3.0.0'));
});
test('KRYLT signing variables override the compatible legacy build variables',()=>{
 const env={KRYLT_UPDATE_REPOSITORY:'NewOrg/krylt-updates',TEMPEST_UPDATE_REPOSITORY:'OldOrg/old-feed',KRYLT_PUBLISHER_DN:source.publisherName[0],TEMPEST_PUBLISHER_DN:'CN=Wrong Company',KRYLT_CERTIFICATE_SHA1:'B'.repeat(40),TEMPEST_CERTIFICATE_SHA1:'A'.repeat(40)};
 const r=releaseConfig(env,'3.0.0');assert.equal(r.source.owner,'NewOrg');assert.equal(r.source.repo,'krylt-updates');assert.deepEqual(r.source.publisherName,source.publisherName);assert.equal(r.config.win.signtoolOptions.certificateSha1,'B'.repeat(40));
});
test('release verification detects modified installers and missing blockmaps',t=>{
 const f=fixture(t),name='Tempest-Ultra-3.0.0-Setup-x64.exe',bytes=Buffer.from('fixture installer bytes');
 fs.writeFileSync(path.join(f.dir,name),bytes);fs.writeFileSync(path.join(f.dir,name+'.blockmap'),'blockmap');
 fs.writeFileSync(path.join(f.dir,'latest.yml'),JSON.stringify({version:'3.0.0',files:[{url:name,size:bytes.length,sha512:require('node:crypto').createHash('sha512').update(bytes).digest('base64')}]}));
 assert.deepEqual(verifyAssets(f.dir,'3.0.0'),[name,name+'.blockmap','latest.yml']);
 fs.writeFileSync(path.join(f.dir,name),'modified installer');assert.throws(()=>verifyAssets(f.dir,'3.0.0'));
 fs.writeFileSync(path.join(f.dir,name),bytes);fs.rmSync(path.join(f.dir,name+'.blockmap'));assert.throws(()=>verifyAssets(f.dir,'3.0.0'));
});
