'use strict';
const fs=require('node:fs'),path=require('node:path');
const PRODUCT_NAME='KRYLT';
// Preserve the established profile and Windows application ID during the rename.
const APP_ID='com.tempest.ultra';
function configureIdentity(app){
 const profile=path.join(app.getPath('appData'),'tempest-ultra');
 fs.mkdirSync(profile,{recursive:true});
 app.setPath('userData',profile);
 app.setPath('sessionData',profile);
 app.setName(PRODUCT_NAME);
 return profile;
}
module.exports={PRODUCT_NAME,APP_ID,configureIdentity};
