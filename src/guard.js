'use strict';
const {webURL,shouldBlock}=require('./policy');
function hostname(value){if(typeof value!=='string'||value.length>2048)throw Error('Enter a website hostname');let u;try{u=new URL(value.includes('://')?value:'https://'+value);}catch{throw Error('Enter a valid hostname');}if(!webURL(u.href)||u.port||u.pathname!=='/'||u.search||u.hash)throw Error('Use a hostname without a path or port');return u.hostname.toLowerCase();}
function allowed(url,list){try{const h=new URL(url).hostname;return list.some(d=>h===d||h.endsWith('.'+d));}catch{return false;}}
function sameSite(a,b){try{return new URL(a).origin===new URL(b).origin;}catch{return false;}}
class Guard{
 constructor(raw={}){this.whitelist=[];for(const x of Array.isArray(raw.whitelist)?raw.whitelist.slice(0,200):[]){try{this.whitelist.push(hostname(x));}catch{}}this.counts={requests:0,popups:0,redirects:0,...Object.fromEntries(Object.entries(raw.counts||{}).filter(([k,v])=>['requests','popups','redirects'].includes(k)&&Number.isSafeInteger(v)&&v>=0))};this.sites={};}
 record(kind,url){this.counts[kind]++;try{const host=new URL(url).hostname;if(Object.keys(this.sites).length<100||this.sites[host])this.sites[host]=(this.sites[host]||0)+1;}catch{}}
 blockRequest(url,source,enabled){return enabled&&!allowed(source,this.whitelist)&&shouldBlock(url,true);}
 snapshot(){return {counts:{...this.counts},total:Object.values(this.counts).reduce((a,b)=>a+b,0),whitelist:[...this.whitelist],sites:{...this.sites}};}
 saved(){return {counts:this.counts,whitelist:this.whitelist};}
 add(value){const h=hostname(value);if(!this.whitelist.includes(h)){if(this.whitelist.length>=200)throw Error('Whitelist limit reached');this.whitelist.push(h);}}
 remove(value){this.whitelist=this.whitelist.filter(h=>h!==value);}
}
module.exports={Guard,hostname,allowed,sameSite};
