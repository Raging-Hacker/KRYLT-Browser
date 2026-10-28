'use strict';
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
function visit(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())visit(file);else if(/\.(?:js|cjs)$/.test(file))execFileSync(process.execPath,['--check',file],{stdio:'inherit'});}}
for(const dir of ['src','scripts','test'])visit(dir);
for(const file of ['assets/icon.ico','assets/logo.png','assets/landing-krylt.png','build/sidebar.bmp','build/installer.nsh','build/clean-profile.ps1','build/clean-install.ps1','THIRD_PARTY_NOTICES.md'])if(!fs.existsSync(file))throw Error('Missing build input: '+file);
console.log('Source syntax and build inputs checked.');
