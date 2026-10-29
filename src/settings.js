'use strict';
const DEFAULT_SETTINGS=Object.freeze({shield:true,light:false,bookmarksBar:true,wallpaper:true,collapsed:false,zoom:100,toolWidth:480,backgroundAudio:false,aiProvider:'chatgpt',showWhatsApp:true,showAI:true,showMusic:true,showDiscord:true,showTwitch:true,showTikTok:true,showStudio:true,restoreSession:true,suspendMinutes:0,maxLiveTabs:12,maxRAM:0,maxCPU:0,renderMode:'gpu',toolHeight:650,blockPopups:true,blockRedirects:true,locationPrompt:false,notificationsPrompt:false,mediaPrompt:false,askDownload:true,downloadPath:''});
const BOOL=new Set(Object.entries(DEFAULT_SETTINGS).filter(([,v])=>typeof v==='boolean').map(([k])=>k));
function validateSetting(key,value){
 if(BOOL.has(key)&&typeof value==='boolean')return value;
 if(key==='maxLiveTabs'&&Number.isInteger(value)&&value>=1&&value<=40)return value;
 if(key==='maxRAM'&&Number.isInteger(value)&&(value===0||value>=512&&value<=65536))return value;
 if(key==='maxCPU'&&Number.isInteger(value)&&value>=0&&value<=100)return value;
 if(key==='renderMode'&&['cpu','gpu'].includes(value))return value;
 if(key==='toolHeight'&&Number.isInteger(value)&&value>=260&&value<=1600)return value;
 if(key==='zoom'&&Number.isInteger(value)&&value>=50&&value<=200)return value;
 if(key==='toolWidth'&&Number.isInteger(value)&&value>=320&&value<=1600)return value;
 if(key==='suspendMinutes'&&[0,5,15,30].includes(value))return value;
 if(key==='aiProvider'&&['chatgpt','gemini','claude'].includes(value))return value;
 throw Error('Unsupported setting or invalid value');
}
function normalizeSettings(raw){const settings={...DEFAULT_SETTINGS};if(raw&&typeof raw==='object'){for(const [k,v]of Object.entries(raw)){try{settings[k]=validateSetting(k,v);}catch{}}if(typeof raw.downloadPath==='string'&&raw.downloadPath.length<4096)settings.downloadPath=raw.downloadPath;}return settings;}
function renameBookmark(items,url,title){if(typeof url!=='string'||typeof title!=='string'||!title.trim()||title.length>120)throw Error('Bookmark names must contain 1–120 characters');const item=items.find(x=>x.url===url);if(!item)throw Error('Bookmark no longer exists');item.title=title.trim();}
module.exports={DEFAULT_SETTINGS,validateSetting,normalizeSettings,renameBookmark};

