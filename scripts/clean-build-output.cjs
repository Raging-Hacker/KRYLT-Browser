'use strict';
const {directories,clean}=require('./build-staging.cjs');
module.exports=async()=>{for(const directory of directories)await clean(directory);};
