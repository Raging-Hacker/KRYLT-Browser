'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function emailOf(value){if(typeof value!=='string'||value.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(value.trim()))throw Error('Enter a valid email address');return value.trim().toLowerCase();}
function passwordOf(value){if(typeof value!=='string'||value.length<8||Buffer.byteLength(value)>1024)throw Error('Use a password of at least 8 characters');return 'krylt-local-profile:'+value;}
class LocalProfile{
 constructor(directory,vault,protection){this.file=path.join(directory,'local-profile.json');this.vault=vault;this.protection=protection;this.record=null;try{const r=JSON.parse(fs.readFileSync(this.file,'utf8'));if(r.version===1&&['local','google'].includes(r.type)&&emailOf(r.email))this.record=r;}catch{}}
 status(){return {exists:!!this.record,type:this.record?.type||'',email:this.record?.email||''};}
 write(record){fs.writeFileSync(this.file+'.tmp',JSON.stringify(record),{mode:0o600});fs.renameSync(this.file+'.tmp',this.file);this.record=record;}
 async create({email,password,legacyPassword}){if(this.record)throw Error('A local profile already exists. Sign in instead.');email=emailOf(email);const secret=passwordOf(password),exists=this.vault.status().exists,backup=exists?this.vault.read():null;
  if(exists){if(!legacyPassword)throw Error('Enter your existing vault password once to keep your saved logins');await this.vault.unlock(legacyPassword);await this.vault.changePassword(secret);}else await this.vault.create(secret);
  try{this.write({version:1,type:'local',email});}catch(error){if(backup)this.vault.write(backup);this.vault.lock();throw error;}return this.status();
 }
 async signIn({email,password}){if(this.record?.type!=='local')throw Error('Create a local profile or use Google sign-in');if(emailOf(email)!==this.record.email)throw Error('Email or password is incorrect');try{await this.vault.unlock(passwordOf(password));}catch{throw Error('Email or password is incorrect');}return this.status();}
 async google(email,legacyPassword){email=emailOf(email);if(!this.protection?.available())throw Error('Secure device encryption is unavailable. Use a local email/password profile on this device.');
  if(this.record){if(this.record.type!=='google'||this.record.email!==email)throw Error('Sign in with the account used to create this profile');await this.vault.unlock(this.protection.decrypt(Buffer.from(this.record.key,'base64')));return this.status();}
  const secret=crypto.randomBytes(32).toString('base64'),exists=this.vault.status().exists,backup=exists?this.vault.read():null;
  if(exists){if(!legacyPassword)throw Error('Enter your existing vault password once to keep your saved logins');await this.vault.unlock(legacyPassword);await this.vault.changePassword(secret);}else await this.vault.create(secret);
  try{this.write({version:1,type:'google',email,key:this.protection.encrypt(secret).toString('base64')});}catch(error){if(backup)this.vault.write(backup);this.vault.lock();throw error;}return this.status();
 }
}
module.exports={LocalProfile,emailOf,passwordOf};
