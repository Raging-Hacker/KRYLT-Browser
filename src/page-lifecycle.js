'use strict';
const {webURL}=require('./policy');
function pageFailure(tab,code,description,url){
 // ERR_ABORTED also means a newer navigation or download replaced this load.
 if(code===-3)return false;
 tab.loading=false;tab.error=String(description||'This page could not be loaded.').slice(0,240);
 tab.failure={code:Number.isInteger(code)?code:0,url:webURL(url)?url:tab.url};
 return true;
}
function watchPage(wc,tab,changed){
 wc.on('did-start-navigation',(event,_url,_inPlace,isMainFrame)=>{
  if((event.isMainFrame??isMainFrame)&&!event.isSameDocument){tab.error='';tab.failure=null;tab.loading=true;changed();}
 });
 wc.on('did-start-loading',()=>{tab.loading=true;changed();});
 wc.on('did-stop-loading',()=>{tab.loading=false;changed();});
 wc.on('did-fail-load',(_event,code,description,url,isMainFrame)=>{if(isMainFrame&&pageFailure(tab,code,description,url))changed();});
 wc.on('render-process-gone',()=>{pageFailure(tab,0,'The webpage process stopped. Reload to continue.',tab.url);changed();});
}
module.exports={pageFailure,watchPage};
