'use strict';
const {webURL}=require('./policy');
function normalSession(tabs,active){
 const items=[...tabs].filter(t=>!t.private).slice(0,40).map(t=>({url:webURL(t.url)?t.url:'',title:String(t.title||'New tab').slice(0,160),selected:t.id===active,...(t.keepAwake?{keepAwake:true}:{})}));
 return items.length?items:[{url:'',title:'New tab',selected:true}];
}
function restoreSession(raw){
 if(!Array.isArray(raw))return [];
 return raw.filter(t=>t&&typeof t.url==='string'&&(!t.url||webURL(t.url))).slice(0,40).map(t=>({url:t.url,title:String(t.title||'New tab').slice(0,160),selected:t.selected===true,...(t.keepAwake===true?{keepAwake:true}:{})}));
}
module.exports={normalSession,restoreSession};
