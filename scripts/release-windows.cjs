'use strict';
const fs=require('node:fs'),path=require('node:path');
const {releaseConfig}=require('./release-config.cjs');
async function main(){
 if(process.platform!=='win32')throw Error('Sign production releases on Windows with the certificate/token/cloud KSP installed');
 const {build,Platform,Arch}=require('electron-builder');
 const root=path.resolve(__dirname,'..'),pkg=require('../package.json');
 const {source,config}=releaseConfig(process.env,pkg.version);
 const policy=path.join(root,'src','update-source.json'),original=fs.readFileSync(policy);
 try{
  fs.writeFileSync(policy,JSON.stringify(source,null,2)+'\n');
  await build({projectDir:root,targets:Platform.WINDOWS.createTarget(['nsis'],Arch.x64),config,publish:'never'});
  // Metadata is complete only after the EXE's final signature has been applied.
  require('node:child_process').execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-File',path.join(__dirname,'verify-release.ps1'),'-Directory',path.join(root,'dist'),'-ExpectedSubject',source.publisherName[0]],{stdio:'inherit'});
  require('./verify-update-assets.cjs').verifyAssets(path.join(root,'dist'),pkg.version);
  console.log('Signed release prepared. Upload the Setup EXE, its blockmap and latest.yml together to the stable GitHub Release.');
 }finally{fs.writeFileSync(policy,original);}
}
main().catch(error=>{console.error(error.message||error);process.exitCode=1;});
