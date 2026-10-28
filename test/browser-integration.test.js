'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromiumUserAgent,externalURLs}=require('../src/browser-integration');

test('web compatibility identity preserves the actual engine and platform',()=>{
 const input='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) tempest-ultra/3.0.0-dev.5 Chrome/156.0.8078.49 Electron/45.1.0 Safari/537.36';
 const output=chromiumUserAgent(input);
 assert.equal(output,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.8078.49 Safari/537.36');
 assert.equal(chromiumUserAgent(output),output);
 assert.equal(chromiumUserAgent('Mozilla/5.0 KRYLT/3.0.0-dev.8 Chrome/156.0.8078.49 Electron/45.1.0 Safari/537.36'),'Mozilla/5.0 Chrome/156.0.8078.49 Safari/537.36');
 assert.equal(chromiumUserAgent('Mozilla/5.0 (X11; Linux x86_64) Chrome/156.0.8078.49 Electron/45.1.0 Safari/537.36'),'Mozilla/5.0 (X11; Linux x86_64) Chrome/156.0.8078.49 Safari/537.36');
});

test('external browser launches accept web links and reject native schemes and credential URLs',()=>{
 assert.deepEqual(externalURLs(['C:\\Program Files\\Tempest Ultra\\Tempest Ultra.exe','--','https://example.com/path?q=one%20two#part','http://localhost:8080/','javascript:alert(1)','file:///C:/secret','data:text/html,hi','--inspect','https://user:secret@example.com','bad url']),['https://example.com/path?q=one%20two#part','http://localhost:8080/']);
 assert.deepEqual(externalURLs(['https://not-an-argument.example','--','https://actual.example']),['https://actual.example']);
 assert.equal(externalURLs(Array(25).fill('https://example.com')).length,20);
 assert.deepEqual(externalURLs(['https://example.com/'+ 'a'.repeat(8192)]),[]);
});
