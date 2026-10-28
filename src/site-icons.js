'use strict';
const {webURL}=require('./policy');
// Only bounded HTTP(S) image bytes enter the shell. No SVG, file URLs, scripts,
// persistent icon history, or third-party favicon lookup service.
async function fetchIcon(ses,url){
 if(!webURL(url))return '';
 const r=await ses.fetch(url,{credentials:'omit',redirect:'error',signal:AbortSignal.timeout(6000)});
 if(!r.ok||Number(r.headers.get('content-length'))>262144)return '';
 const chunks=[];let length=0;
 try{for await(const chunk of r.body){length+=chunk.length;if(length>262144)throw Error('Icon too large');chunks.push(Buffer.from(chunk));}}catch{await r.body?.cancel().catch(()=>{});return '';}
 const b=Buffer.concat(chunks);let type='';
 if(b.length>8&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))type='image/png';
 else if(b.length>4&&b.readUInt32LE(0)===65536)type='image/x-icon';
 else if(b.length>3&&b[0]===255&&b[1]===216&&b[2]===255)type='image/jpeg';
 else if(b.length>12&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP')type='image/webp';
 return type?'data:'+type+';base64,'+b.toString('base64'):'';
}
module.exports={fetchIcon};
