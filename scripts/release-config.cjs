'use strict';
const {validateSource}=require('../src/update-policy');
const configuredSource=require('../src/update-source.json');
function releaseConfig(env,version){
 if(!/^\d+\.\d+\.\d+$/.test(version))throw Error('Publish a stable semantic version, for example 3.0.0, not a dev/prerelease version');
 const configuredRepo=configuredSource.owner&&configuredSource.repo?configuredSource.owner+'/'+configuredSource.repo:'';
 const repo=env.KRYLT_UPDATE_REPOSITORY||env.TEMPEST_UPDATE_REPOSITORY||configuredRepo||env.GITHUB_REPOSITORY||'';
 const parts=repo.split('/');
 if(parts.length!==2)throw Error('Set KRYLT_UPDATE_REPOSITORY to the public owner/repository');
 const source=validateSource({schemaVersion:1,provider:'github',owner:parts[0],repo:parts[1],publisherName:[(env.KRYLT_PUBLISHER_DN||env.TEMPEST_PUBLISHER_DN)]});
 const thumbprint=(env.KRYLT_CERTIFICATE_SHA1||env.TEMPEST_CERTIFICATE_SHA1)?.replace(/\s/g,'');
 if(!/^[a-fA-F0-9]{40}$/.test(thumbprint||''))throw Error('Set KRYLT_CERTIFICATE_SHA1 to the certificate thumbprint in the Windows certificate store');
 return {source,config:{
  forceCodeSigning:true,buildVersion:version,
  win:{signAndEditExecutable:true,verifyUpdateCodeSignature:true,signtoolOptions:{certificateSha1:thumbprint,publisherName:source.publisherName,signingHashAlgorithms:['sha256'],rfc3161TimeStampServer:'http://timestamp.digicert.com'}},
  publish:[{provider:'github',owner:source.owner,repo:source.repo,private:false,releaseType:'release'}],
 }};
}
module.exports={releaseConfig};
