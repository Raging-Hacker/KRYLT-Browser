'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {classify,trustedLocalFile,externalFiles}=require('../src/file-support');
test('classifies file types',()=>{
 assert.equal(classify('movie.mp4').mode,'native');
 assert.equal(classify('movie.mkv').mode,'external');
 assert.equal(classify('playlist.m3u8').mode,'external');
 assert.equal(classify('program.exe'),null);
});
test('validates local file selection',()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'krylt-files-'));
 try{
  const file=path.join(folder,'test.html');fs.writeFileSync(file,'<p>Test</p>');
  assert.equal(trustedLocalFile(file).mode,'native');
  assert.deepEqual(externalFiles(['--',file]),[file]);
  assert.throws(()=>trustedLocalFile(path.join(folder,'missing.html')));
 }finally{fs.rmSync(folder,{force:true,recursive:true});}
});
