'use strict';
const {randomUUID}=require('node:crypto');
const {webURL}=require('./policy');
function normalizeHistory(input){
 const ids=new Set();
 return (Array.isArray(input)?input:[]).filter(e=>e&&webURL(e.url)).slice(0,500).map(e=>{
  let id=typeof e.id==='string'&&/^[a-f0-9-]{36}$/i.test(e.id)?e.id:randomUUID();
  if(ids.has(id))id=randomUUID();ids.add(id);
  return {id,url:e.url,title:String(e.title||e.url).slice(0,160),time:Number.isSafeInteger(e.time)&&e.time>0?e.time:0};
 });
}
function deleteHistory(history,ids){
 if(!Array.isArray(ids)||!ids.length||ids.length>500||ids.some(id=>typeof id!=='string'||id.length>36))throw Error('Select history entries to delete');
 const selected=new Set(ids);return history.filter(entry=>!selected.has(entry.id));
}
module.exports={normalizeHistory,deleteHistory};
