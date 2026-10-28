'use strict';
const fs=require('node:fs');
const yaml=require('js-yaml');
const DAY=24*60*60*1000;

function nextMonth(timestamp){
 const previous=new Date(timestamp),year=previous.getUTCFullYear(),month=previous.getUTCMonth()+1;
 const day=Math.min(previous.getUTCDate(),new Date(Date.UTC(year,month+1,0)).getUTCDate());
 return Date.UTC(year,month,day,previous.getUTCHours(),previous.getUTCMinutes(),previous.getUTCSeconds(),previous.getUTCMilliseconds());
}
function normalizeSchedule(value,now){
 const timestamp=v=>Number.isSafeInteger(v)&&v>0&&v<=now?v:0;
 return {lastCheck:timestamp(value?.lastCheck),lastAttempt:timestamp(value?.lastAttempt),retryAt:Number.isSafeInteger(value?.retryAt)&&value.retryAt>now&&value.retryAt<=now+DAY?value.retryAt:0,pending:value?.pending===true};
}
function dueAt(schedule){
 if(schedule.retryAt)return schedule.retryAt;
 if(schedule.pending)return schedule.lastAttempt? schedule.lastAttempt+DAY:0;
 return schedule.lastCheck?nextMonth(schedule.lastCheck):0;
}
function validateSource(source){
 if(source?.schemaVersion!==1||source.provider!=='github'||typeof source.owner!=='string'||typeof source.repo!=='string'||!/^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/.test(source.owner)||!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,99}$/.test(source.repo))throw Error('GitHub Releases repository is not configured');
 const names=source.publisherName;
 if(!Array.isArray(names)||!names.length||names.length>5||names.some(n=>typeof n!=='string'||n.length>2000||/[\r\n]/.test(n)||!/(?:^|,\s*)CN=/.test(n)))throw Error('Certificate publisher must be configured as a distinguished name');
 return {schemaVersion:1,provider:'github',owner:source.owner,repo:source.repo,publisherName:[...names]};
}
function verifyBuildConfiguration(file,source){
 const expected=validateSource(source);
 if(fs.statSync(file).size>65536)throw Error('Invalid signed update configuration');
 const config=yaml.load(fs.readFileSync(file,'utf8'),{schema:yaml.JSON_SCHEMA});
 const names=Array.isArray(config?.publisherName)?config.publisherName:[config?.publisherName];
 if(config?.provider!=='github'||config.owner!==expected.owner||config.repo!==expected.repo||config.private===true||config.token||config.verifyUpdateCodeSignature===false||JSON.stringify(names)!==JSON.stringify(expected.publisherName))throw Error('Signed update configuration does not match the release policy');
 return expected;
}
module.exports={DAY,nextMonth,normalizeSchedule,dueAt,validateSource,verifyBuildConfiguration};
