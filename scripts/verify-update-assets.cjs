'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),yaml=require('js-yaml');
function verifyAssets(directory,version){
 const info=yaml.load(fs.readFileSync(path.join(directory,'latest.yml'),'utf8'),{schema:yaml.JSON_SCHEMA});
 if(info.version!==version)throw Error('latest.yml version does not match this build');
 const installer=info.files?.find(f=>typeof f.url==='string'&&f.url.endsWith('-Setup-x64.exe'));
 if(!installer||path.basename(installer.url)!==installer.url)throw Error('Expected a local x64 installer in latest.yml');
 const file=path.join(directory,installer.url),bytes=fs.readFileSync(file);
 if(crypto.createHash('sha512').update(bytes).digest('base64')!==installer.sha512||bytes.length!==installer.size)throw Error('Release metadata checksum or size does not match the signed installer');
 if(!fs.existsSync(file+'.blockmap'))throw Error('Installer blockmap missing');
 return [installer.url,installer.url+'.blockmap','latest.yml'];
}
module.exports={verifyAssets};
