'use strict';
const fs=require('node:fs'),path=require('node:path'),{execFile}=require('node:child_process');
function installedBrowsers(env=process.env,exists=fs.existsSync){
 const roots=[env.ProgramFiles,env['ProgramFiles(x86)'],env.LOCALAPPDATA].filter(Boolean);
 const products=[['Microsoft Edge','Microsoft/Edge/Application/msedge.exe'],['Google Chrome','Google/Chrome/Application/chrome.exe'],['Mozilla Firefox','Mozilla Firefox/firefox.exe']];
 return products.map(([name,suffix])=>({name,file:roots.map(root=>path.join(root,...suffix.split('/'))).find(exists)})).filter(b=>b.file);
}
async function openAuthentication(url,{app,shell,dialog,window,browsers=installedBrowsers(),launch=execFile,platform=process.platform}){
 if(!url.startsWith('https://accounts.google.com/o/oauth2/'))throw Error('Invalid authorization endpoint');
 if(platform!=='win32'){
  if(app.isDefaultProtocolClient('https'))throw Error('Google sign-in needs an external browser. Choose another system default browser for authentication.');
  return shell.openExternal(url);
 }
 if(!browsers.length)throw Error('Install Microsoft Edge, Google Chrome or Mozilla Firefox to complete Google sign-in in an external browser.');
 const result=await dialog.showMessageBox(window,{type:'question',title:'Google sign-in',message:'Choose an external browser for Google sign-in',detail:'Sign-in opens in this browser even when KRYLT is your default browser.',buttons:[...browsers.map(b=>b.name),'Cancel'],defaultId:0,cancelId:browsers.length});
 if(result.response>=browsers.length)throw Error('Google sign-in canceled');
 await new Promise((resolve,reject)=>{const child=launch(browsers[result.response].file,['--new-window',url],{windowsHide:false},error=>{if(error)reject(Error('Could not open the selected authentication browser'));});child.once('spawn',resolve);child.once('error',()=>reject(Error('Could not open the selected authentication browser')));child.unref?.();});
}
module.exports={installedBrowsers,openAuthentication};
