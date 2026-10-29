'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{EventEmitter}=require('node:events');
const {Guard}=require('../src/guard'),{protectNavigation,movieURL}=require('../src/navigation-guard');
function fixture({url='https://catalogue.example/',movieRoot=null}={}){
 const wc=new EventEmitter(),guard=new Guard(),opened=[];let clock=10000,changes=0;
 const settings={blockPopups:true,blockRedirects:true};wc.mainFrame={};wc.getURL=()=>url;wc.setWindowOpenHandler=fn=>wc.popup=fn;
 const counts=protectNavigation(wc,{guard,settings:()=>settings,changed:()=>changes++,openTab:u=>opened.push(u),movieRoot,now:()=>clock});
 function navigate(url,{redirect=false,main=true,child=false}={}){const e={url,isMainFrame:main,initiator:child?{}:wc.mainFrame,preventDefault(){this.blocked=true;}};wc.emit(redirect?'will-redirect':'will-frame-navigate',e);return !!e.blocked;}
 return {wc,guard,settings,counts,opened,navigate,get changes(){return changes;},click:()=>wc.emit('before-mouse-event',{}, {type:'mouseDown'}),advance:ms=>clock+=ms};
}
test('a real Play click cannot authorize an advertising popup; floods stay silent and create no tabs',()=>{
 const f=fixture();f.click();for(let i=0;i<100;i++)assert.deepEqual(f.wc.popup({url:'https://advert.example/?click='+i}),{action:'deny'});
 assert.equal(f.opened.length,0);assert.equal(f.guard.counts.popups,100);assert.equal(f.changes,100);
});
test('ordinary trusted popup exceptions require recent input, respect hostname boundaries and consume the gesture',()=>{
 const f=fixture();f.guard.add('catalogue.example');f.wc.popup({url:'https://login.example/'});assert.equal(f.opened.length,0);
 f.click();f.wc.popup({url:'https://login.example/'});assert.equal(f.opened.length,1);f.wc.popup({url:'https://login.example/'});assert.equal(f.opened.length,1);
 f.advance(1600);f.click();f.wc.popup({url:'file:///secret'});assert.equal(f.opened.length,1);
 const other=fixture({url:'https://notcatalogue.example/'});other.guard.add('catalogue.example');other.click();other.wc.popup({url:'https://login.example/'});assert.equal(other.opened.length,0);
});
test('movie site matching accepts only HTTPS service hosts without credentials or custom ports',()=>{
 for(const u of ['https://ww25.soap2day.day/a','https://ww26.soap2day.day/advanced-search/','https://soap2day.day/'])assert(movieURL(u));
 for(const u of ['http://ww25.soap2day.day/','https://ww25.soap2day.day:444/','https://user:pass@ww25.soap2day.day/','https://soap2day.day.evil.example/','https://notsoap2day.day/','https://unknown.soap2day.day/','javascript:alert(1)'])assert(!movieURL(u));
});
test('Movies blocks off-site top-level navigation and every popup even with whitelist and settings disabled',()=>{
 const f=fixture({url:'https://ww25.soap2day.day/movie/'});f.guard.add('soap2day.day');f.settings.blockPopups=false;f.settings.blockRedirects=false;f.click();
 f.wc.popup({url:'https://ww25.soap2day.day/another/'});f.wc.popup({url:'https://advert.example/'});assert.equal(f.opened.length,0);
 assert(f.navigate('https://advert.example/'));assert(f.navigate('https://advert.example/',{redirect:true}));assert(!f.navigate('https://ww26.soap2day.day/advanced-search/'));
 assert(f.navigate('file:///secret'));assert.equal(f.counts.redirects,3);
});
test('embedded-player redirects continue inside their frame while their top-level takeovers are blocked',()=>{
 const f=fixture({url:'https://ww25.soap2day.day/movie/'});f.click();
 assert(!f.navigate('https://player.example/embed',{main:false}));assert(!f.navigate('https://cdn.example/player',{main:false,redirect:true}));
 assert(f.navigate('https://advert.example/',{child:true}));assert.equal(f.counts.redirects,1);
});
test('ordinary cross-site links work; stale script navigation, frame takeovers and server redirects are stopped',()=>{
 const f=fixture();assert(f.navigate('https://other.example/'));f.click();assert(!f.navigate('https://other.example/'));
 assert(f.navigate('https://other.example/',{child:true}));assert(f.navigate('https://other.example/',{redirect:true}));
 f.advance(1100);assert(f.navigate('https://other.example/'));assert(!f.navigate('https://catalogue.example/next'));
 f.guard.add('catalogue.example');assert(!f.navigate('https://other.example/',{redirect:true}));
});
test('dedicated workspace enforces its root during initial load and prevents unload traps',()=>{
 const f=fixture({url:'',movieRoot:'https://127.0.0.1:4321/tool'});
 assert(!f.navigate('https://127.0.0.1:4321/watch'));assert(f.navigate('https://127.0.0.1:4322/ad',{redirect:true}));
 const e={preventDefault(){this.allowed=true;}};f.wc.emit('will-prevent-unload',e);assert.equal(e.allowed,true);
});
