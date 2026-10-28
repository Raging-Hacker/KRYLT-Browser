'use strict';
const fs=require('node:fs'),path=require('node:path');
const directories=new Set();
const temporary=/^\.(?:electron|KRYLT)\.exe\.[A-Za-z0-9._-]+$/;
async function clean(directory){
 // Mounted build filesystems can expose stale atomic-write files. Only remove
 // executable staging files, never directories or the actual executable.
 for(let pass=0;pass<5;pass++){
  const entries=fs.readdirSync(directory,{withFileTypes:true}).filter(e=>e.isFile()&&temporary.test(e.name));
  if(!entries.length)return;
  for(const entry of entries){try{fs.unlinkSync(path.join(directory,entry.name));}catch(error){if(error.code!=='ENOENT')throw error;}}
  await new Promise(resolve=>setTimeout(resolve,50));
 }
 if(fs.readdirSync(directory,{withFileTypes:true}).some(e=>e.isFile()&&temporary.test(e.name)))throw Error('Executable staging files remain in build output');
}
module.exports={directories,clean};
