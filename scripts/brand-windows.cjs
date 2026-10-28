// Cross-platform Windows resource branding; no Wine dependency.
const fs=require('node:fs');const path=require('node:path');
module.exports=async(context)=>{
 if(context.electronPlatformName!=='win32')return;
 const PE=await import('pe-library'),R=await import('resedit');
 const target=path.join(context.appOutDir,'KRYLT.exe');
 const exe=PE.NtExecutable.from(fs.readFileSync(target));
 const resources=PE.NtExecutableResource.from(exe);
 const icon=R.Data.IconFile.from(fs.readFileSync(path.join(context.packager.projectDir,'assets/icon.ico')));
 const groups=R.Resource.IconGroupEntry.fromEntries(resources.entries);
 for(const group of groups)R.Resource.IconGroupEntry.replaceIconsForResource(resources.entries,group.id,group.lang,icon.icons.map(i=>i.data));
 const version=context.packager.appInfo.version.match(/^(\d+)\.(\d+)\.(\d+)(?:-dev\.(\d+))?/).slice(1).map(x=>Number(x||0));
 for(const v of R.Resource.VersionInfo.fromEntries(resources.entries)){
  v.setFileVersion(...version,1033);v.setProductVersion(...version,1033);
  v.setStringValues({lang:1033,codepage:1200},{CompanyName:'Cyclonix Designs',FileDescription:'KRYLT Browser',ProductName:'KRYLT',InternalName:'KRYLT',OriginalFilename:'KRYLT.exe',LegalCopyright:'Copyright © 2026 Cyclonix Designs'});v.outputToResourceEntries(resources.entries);
 }
 resources.outputResource(exe);fs.writeFileSync(target,Buffer.from(exe.generate()));
 // Some mounted build filesystems leave atomic-write staging files behind.
 // Only remove builder-created executable staging files, never runtime assets.
 for(const name of fs.readdirSync(context.appOutDir)){
  if(/^\.(?:electron|KRYLT)\.exe\.[A-Za-z0-9.]+$/.test(name))fs.rmSync(path.join(context.appOutDir,name),{force:true});
 }
};
