'use strict';
const blocked = new Set(['doubleclick.net','googlesyndication.com','googleadservices.com','google-analytics.com','connect.facebook.net','adnxs.com','scorecardresearch.com','hotjar.com','clarity.ms','taboola.com','outbrain.com']);
function webURL(value) { try { const u=new URL(value); return ['https:','http:'].includes(u.protocol) && !u.username && !u.password; } catch { return false; } }
function resolveInput(value) { if(typeof value!=='string'||value.length>8192) throw Error('Invalid address'); const s=value.trim(); if(!s) return ''; if(webURL(s)) return new URL(s).href; if(/^[a-z][a-z0-9+.-]*:/i.test(s) && !/^[\w.-]+:\d+(\/|$)/.test(s)) throw Error('Only HTTP and HTTPS addresses are supported'); if(!/\s/.test(s)&&(/^[\w.-]+\.[a-z]{2,}([/:?#]|$)/i.test(s)||/^localhost([/:]|$)/.test(s))) {const url=(s.startsWith('localhost')?'http://':'https://')+s; if(webURL(url)) return new URL(url).href;} return 'https://www.google.com/search?q='+encodeURIComponent(s); }
function shouldBlock(url,enabled=true) { if(!enabled)return false; try { const h=new URL(url).hostname; return [...blocked].some(d=>h===d||h.endsWith('.'+d)); } catch{return false;} }
const THEME_KEYS=['bg','surface','raised','text','muted','line','blue'];
function validateTheme(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid theme pack');
 const values=input.colors;
 if(!values||typeof values!=='object')throw Error('A theme requires colors');
 const colors={};for(const key of THEME_KEYS){if(typeof values[key]!=='string'||!/^#[0-9a-f]{6}$/i.test(values[key]))throw Error('Theme colors must use six-digit hexadecimal values');colors[key]=values[key];}
 return {name:typeof input.name==='string'?input.name.slice(0,60):'Imported theme',colors};
}
module.exports={webURL,resolveInput,shouldBlock,validateTheme};
