'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
// Native means Chromium can attempt to display or play a file; actual codec
// availability varies by Electron build and operating system.
const NATIVE={
 documents:['.htm','.html','.shtml','.xht','.xhtml','.pdf'],
 images:['.jpg','.jpeg','.png','.gif','.webp','.bmp','.svg','.ico','.tif','.tiff','.avif','.apng','.jfif'],
 video:['.mp4','.webm','.ogv','.m4v'],
 audio:['.mp3','.wav','.ogg','.opus','.m4a','.aac','.flac'],
 subtitles:['.srt','.vtt']
};
const EXTERNAL={
 video:['.mkv','.avi','.mov','.wmv','.flv','.mpeg','.mpg','.3gp','.ts','.m2ts','.vob'],
 audio:['.wma','.aiff','.alac','.mid','.midi','.amr','.ape'],
 images:['.heic','.heif'],
 streaming:['.m3u8','.mpd','.m3u','.pls'],
 subtitles:['.ass','.ssa','.sub']
};
const nativeSet=new Set(Object.values(NATIVE).flat());
const externalSet=new Set(Object.values(EXTERNAL).flat());
function classify(file){if(typeof file!=='string')return null;const ext=path.extname(file).toLowerCase();if(nativeSet.has(ext))return {extension:ext,mode:'native'};if(externalSet.has(ext))return {extension:ext,mode:'external'};return null;}
function trustedLocalFile(file){
 if(typeof file!=='string'||!file||file.length>8192||file.includes('\0'))throw Error('Invalid local file');
 const resolved=path.resolve(file),kind=classify(resolved);
 if(!kind)throw Error('Unsupported file type. Use the system default application.');
 const st=fs.statSync(resolved);if(!st.isFile())throw Error('Choose a file, not a folder');
 return {path:resolved,url:pathToFileURL(resolved).href,...kind};
}
function externalFiles(args){
 const end=args.indexOf('--'),candidates=end>=0?args.slice(end+1):args;
 return candidates.filter(x=>typeof x==='string').slice(0,20).flatMap(x=>{try{return [trustedLocalFile(x).path];}catch{return [];}});
}
module.exports={NATIVE,EXTERNAL,classify,trustedLocalFile,externalFiles};
