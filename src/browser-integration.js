'use strict';
const {webURL}=require('./policy');
// Use the bundled engine's identity, never a fabricated newer Chrome version.
function chromiumUserAgent(nativeAgent){
 return nativeAgent.replace(/\s+(?:Electron|tempest-ultra|TempestUltra|krylt)\/[^\s]+/gi,'');
}
function externalURLs(args){
 const end=args.indexOf('--');
 const candidates=end>=0?args.slice(end+1):args;
 return candidates.filter(arg=>typeof arg==='string'&&arg.length<=8192&&webURL(arg)).slice(0,20);
}
module.exports={chromiumUserAgent,externalURLs};
