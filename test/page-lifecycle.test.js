'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{EventEmitter}=require('node:events');
const {watchPage,pageFailure}=require('../src/page-lifecycle');
function fixture(){const wc=new EventEmitter(),tab={url:'https://example.com/',error:'',loading:false};let changes=0;watchPage(wc,tab,()=>changes++);return {wc,tab,get changes(){return changes;}};}
test('main-document network errors remain visible after loading stops',()=>{
 const f=fixture();f.wc.emit('did-fail-load',{},-105,'ERR_NAME_NOT_RESOLVED','https://missing.example/',true);f.wc.emit('did-stop-loading');
 assert.equal(f.tab.error,'ERR_NAME_NOT_RESOLVED');assert.equal(f.tab.failure.url,'https://missing.example/');assert.equal(f.tab.loading,false);
});
test('failed images/frames and aborted redirects do not replace a working page',()=>{
 const f=fixture();f.wc.emit('did-fail-load',{},-105,'ERR_NAME_NOT_RESOLVED','https://frame.example/',false);f.wc.emit('did-fail-load',{},-3,'ERR_ABORTED',f.tab.url,true);
 assert.equal(f.tab.error,'');assert.equal(f.tab.failure,undefined);assert.equal(f.changes,0);
});
test('only a new main-document navigation clears the previous failure',()=>{
 const f=fixture();pageFailure(f.tab,-2,'Failed',f.tab.url);f.wc.emit('did-start-navigation',{isMainFrame:false,isSameDocument:false});assert.equal(f.tab.error,'Failed');
 f.wc.emit('did-start-navigation',{isMainFrame:true,isSameDocument:true});assert.equal(f.tab.error,'Failed');
 f.wc.emit('did-start-navigation',{isMainFrame:true,isSameDocument:false});assert.equal(f.tab.error,'');assert.equal(f.tab.failure,null);assert.equal(f.tab.loading,true);
});
test('renderer failure is recoverable and failure URLs cannot become privileged navigation targets',()=>{
 const f=fixture();f.wc.emit('render-process-gone');assert.match(f.tab.error,/Reload/);assert.equal(f.tab.failure.url,f.tab.url);
 pageFailure(f.tab,-2,'bad','file:///private');assert.equal(f.tab.failure.url,f.tab.url);
});
