// Unsigned Linux cross-build using the pinned builder's own NSIS reader.
// Normal Windows builds should use npm run dist:win.
'use strict';
const path=require('node:path');
const {build,Platform,Arch}=require('electron-builder');
const {UninstallerReader}=require('app-builder-lib/out/targets/nsis/nsisUtil');
const {WineVmManager}=require('app-builder-lib/out/vm/WineVm');
const projectDir=path.resolve(__dirname,'..');
if(process.platform!=='linux')throw Error('Use npm run dist:win on Windows');
if(require('app-builder-lib/package.json').version!=='26.18.0')throw Error('Review NSIS cross-build integration before changing electron-builder');
WineVmManager.prototype.exec=async function(file,args=[]){
 // Only the generated unsigned uninstaller-writing stub is handled here.
 if(args.length||!path.basename(file).startsWith('KRYLT-')||!path.basename(file).includes('-Setup-'))throw Error('Unexpected Windows executable requested during unsigned build');
 await UninstallerReader.exec(file,path.join(path.dirname(file),path.basename(file,'exe')+'__uninstaller.exe'));
};
const config={};
if((process.env.KRYLT_ELECTRON_DIST||process.env.TEMPEST_ELECTRON_DIST))config.electronDist=process.env.KRYLT_ELECTRON_DIST||process.env.TEMPEST_ELECTRON_DIST;
build({projectDir,targets:Platform.WINDOWS.createTarget(['nsis'],Arch.x64),config,publish:'never'}).catch(error=>{
 console.error(error.message||error);process.exitCode=1;
});

