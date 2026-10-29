'use strict';
// This harness is excluded from production packages. Only this harness substitutes
// native dialogs, the single-instance lock and (when explicitly requested) the
// root-container sandbox. The shipped app keeps its real security settings.
const {app,BrowserWindow,dialog,Menu,session}=require('electron');
const fs=require('node:fs'),path=require('node:path'),https=require('node:https'),assert=require('node:assert/strict'),os=require('node:os');
app.disableHardwareAcceleration();
const checks=[];const record=checks.push.bind(checks);checks.push=(...items)=>{console.log('QA_PROGRESS: '+items[0]);return record(...items);};
const output=process.env.KRYLT_QA_OUTPUT;fs.mkdirSync(output,{recursive:true});
process.on('uncaughtException',error=>{console.error('QA_UNCAUGHT',error);fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({error:error.stack,checks}));app.exit(1);});process.on('unhandledRejection',error=>{console.error('QA_REJECTION',error);app.exit(1);});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'krylt-ui-test-'));app.setPath('appData',profile);
if(process.env.KRYLT_TEST_UNSANDBOXED==='1')app.enableSandbox=()=>{};
app.requestSingleInstanceLock=()=>true;app.quit=()=>{};
let menu=[],dialogReply=1,dialogCalls=0;
Menu.buildFromTemplate=entries=>{menu=entries;return {popup(){}};};
dialog.showMessageBox=async()=>{dialogCalls++;return {response:dialogReply};};
dialog.showSaveDialog=async()=>({canceled:false,filePath:path.join(output,'page-snapshot.png')});
let requestCount=0,secondaryOrigin,primaryOrigin,networkUnavailable=true;
const tls={key:fs.readFileSync(path.join(__dirname,'fixtures/localhost.key.pem')),cert:fs.readFileSync(path.join(__dirname,'fixtures/localhost.cert.pem'))};
const secondary=https.createServer(tls,(req,res)=>{if(req.url==='/auth-hop'){res.writeHead(303,{Location:primaryOrigin+'/signed-in'});res.end();return;}res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Embedded player</title><h1 id="embedded-player">Embedded player ready</h1>');});
const server=https.createServer(tls,(req,res)=>{requestCount++;
 if(req.url==='/sso-start'){res.writeHead(302,{Location:secondaryOrigin+'/auth-hop'});res.end();return;}
 if(req.url==='/auto-login'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Signing in</title><script>setTimeout(()=>location.href='+JSON.stringify(secondaryOrigin+'/auth-hop')+',100)</script>');return;}
 if(req.url==='/signed-in'||req.url==='/retry-page'){if(req.url==='/retry-page'&&networkUnavailable){req.socket.destroy();return;}res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Signed-in application</title><h1 id=app-content>Application loaded successfully</h1>');return;}
 if(req.url==='/frame-redirect'){res.writeHead(302,{Location:secondaryOrigin+'/player'});res.end();return;}
 if(req.url==='/download'){res.writeHead(200,{'Content-Type':'application/octet-stream','Content-Disposition':'attachment; filename="unwanted.exe"'});res.end('fixture download');return;}
 res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Fixture website</title><h1>Fixture website</h1><button id="page-click">Page button</button><form action="/login"><input name="username" type="email" autocomplete="username" value="fixture@example.com"><input name="password" type="password" autocomplete="current-password" value="fixture-password"></form>');});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function capture(wc){await pause(180);for(let retry=0;retry<4;retry++){try{return await wc.capturePage();}catch(error){if(retry===3)throw error;await pause(150);}}}
async function until(fn,label){for(let attempt=0;attempt<100;attempt++){if(await fn())return;await pause(80);}throw Error('Timed out: '+label);}
(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='https://127.0.0.1:'+server.address().port;
primaryOrigin=origin;await new Promise(resolve=>secondary.listen(0,'127.0.0.1',resolve));secondaryOrigin='https://127.0.0.1:'+secondary.address().port;
app.on('certificate-error',(event,_wc,url,_error,certificate,callback)=>{if((url.startsWith(origin+'/')||url.startsWith(secondaryOrigin+'/'))&&certificate.data.trim()===fs.readFileSync(path.join(__dirname,'fixtures/localhost.cert.pem'),'utf8').trim()){event.preventDefault();callback(true);}else callback(false);});
for(const tool of Object.values(require('../src/tools').TOOLS))tool.url=origin+'/tool';
require('../src/main');
await app.whenReady();await until(()=>BrowserWindow.getAllWindows().length>0,'window');const win=BrowserWindow.getAllWindows()[0],wc=win.webContents;const js=code=>Promise.race([wc.executeJavaScript(code),new Promise((_,reject)=>{const timer=setTimeout(()=>reject(Error('Renderer command timed out: '+code.slice(0,120))),15000);timer.unref();})]),command=(a,p)=>js('window.krylt.command('+JSON.stringify(a)+','+JSON.stringify(p)+')');
const errors=[];wc.on('console-message',details=>{if(details.level==='error'&&!/favicon|ERR_/i.test(details.message))errors.push(details.message);});
await until(()=>js('!!window.krylt && !!document.querySelector("#tabs button")'),'shell loaded');
assert.ok(await js('document.querySelector("#tabs").getBoundingClientRect().bottom<=document.querySelector("#addressForm").getBoundingClientRect().top'));
for(let i=0;i<14;i++)await command('new');await until(()=>js('!document.querySelector("#moreTabs").hidden'),'overflow');await js('document.querySelector("#moreTabs").click()');await pause(100);assert.ok(menu.length>1);menu[0].click();checks.push('Horizontal tabs, native More menu and hidden-tab selection');
for(const key of ['discord','twitch','tiktok','studio'])assert.equal(await js('!!document.querySelector("[data-tool='+key+'] img.service-icon")'),true);
await js('document.querySelector("#tabSearch").click()');await until(()=>js('document.querySelector("#panelTitle").textContent==="Search tabs"'),'tab search');fs.writeFileSync(path.join(output,'tab-search.png'),(await capture(wc)).toPNG());checks.push('Searchable tabs and recognizable service logos');
await command('navigate',origin+'/page');await js('document.querySelector("#closePanel").click()');await until(()=>win.contentView.children.some(view=>view.webContents?.getURL().startsWith(origin+'/page')),'fixture page');let page=win.contentView.children.find(view=>view.webContents?.getURL().startsWith(origin+'/page'));await until(()=>!page.webContents.isLoading(),'page load');
await command('tool-open','whatsapp');await pause(300);const bounds=page.getBounds();page.webContents.sendInputEvent({type:'mouseDown',x:50,y:45,button:'left',clickCount:1});page.webContents.sendInputEvent({type:'mouseUp',x:50,y:45,button:'left',clickCount:1});await until(()=>js('!document.querySelector("[data-tool=whatsapp]").classList.contains("active-tool")'),'outside-click dismissal');assert.deepEqual(page.getBounds(),bounds);checks.push('Native click underneath floating app dismisses it without changing page geometry');
await js('document.querySelector("[data-panel=history]").click()');await until(()=>js('document.querySelector("#panelBody .row")!==null'),'history row');await js('[...document.querySelectorAll("#panelBody .row button")].find(b=>b.textContent==="Delete").click()');await until(()=>js('document.querySelectorAll("#panelBody .row").length===0'),'history deletion');checks.push('Individual history deletion');
const sleepingID=(await command('resource-stats')).tabs.find(t=>t.active).id;
await js('document.querySelector("#closePanel").click()');await command('new');await command('tabs-suspend');assert.equal((await command('resource-stats')).tabs.find(t=>t.id===sleepingID).sleeping,true);await command('select',sleepingID);await until(()=>win.contentView.children.some(view=>view.webContents?.getURL().startsWith(origin+'/page')),'wake sleeping page');page=win.contentView.children.find(view=>view.webContents?.getURL().startsWith(origin+'/page'));await until(()=>!page.webContents.isLoading(),'reloaded sleeping page');checks.push('Inactive-tab sleeping releases its view and selecting it reloads the page');

await js('document.querySelector("[data-panel=passwords]").click()');await js('document.querySelector("[aria-label=Email]").value="client@example.com";document.querySelector("[aria-label=Password]").value="profile-password-123";document.querySelector(".vault-form button[type=submit]").click()');await until(()=>js('!!document.querySelector(".vault-add input[type=url]")'),'email/password profile creation');
await js('document.querySelector(".vault-add").open=true;document.querySelector(".vault-add input[type=url]").value="'+origin+'";document.querySelector("[aria-label=\\"Username or email\\"]").value="manual@example.com";window.__submits=0;document.querySelector(".vault-add form").addEventListener("submit",()=>window.__submits++);[...document.querySelectorAll("button")].find(b=>b.textContent==="Generate strong password").click()');await until(()=>js('document.querySelector("[aria-label=\\"Website password\\"]").value.length===24'),'password generation');assert.equal(await js('window.__submits'),0);await js('[...document.querySelectorAll("button")].find(b=>b.textContent==="Save login").click()');await until(()=>js('document.querySelectorAll(".vault-entry").length===1'),'manual password saved');
await js('document.querySelector("#closePanel").click()');await command('vault-capture');const entries=await command('vault-list');assert.equal(entries.length,2);const captured=entries.find(entry=>entry.username==='fixture@example.com');assert.ok(captured);await page.webContents.executeJavaScript('document.querySelector("input[type=password]").value=""');await command('vault-fill',captured.id);assert.equal(await page.webContents.executeJavaScript('document.querySelector("input[type=password]").value'),'fixture-password');const vaultBytes=fs.readFileSync(path.join(profile,'tempest-ultra','password-vault.json'),'utf8');assert.equal(vaultBytes.includes('fixture-password'),false);checks.push('Vault creation, generate without submit, manual save and actual isolated-world HTTPS capture/fill');
await js('document.querySelector("[data-panel=passwords]").click()');await until(()=>js('document.querySelectorAll(".vault-entry").length===2'),'vault rows');await js('[...document.querySelectorAll(".vault-entry button")].find(b=>b.textContent==="Reveal").click()');await until(()=>js('!!document.querySelector("input[data-secret][readonly]")'),'revealed password');await command('vault-lock');await until(()=>js('!document.querySelector("input[readonly]")'),'lock clears reveal');checks.push('Explicit reveal and lock clearing');
await js('document.querySelector("[data-panel=resources]").click()');await until(()=>js('document.querySelectorAll(".metric").length===3'),'performance metrics');fs.writeFileSync(path.join(output,'performance.png'),(await capture(wc)).toPNG());await js('document.querySelector("#closePanel").click()');await command('snapshot');assert.ok(fs.statSync(path.join(output,'page-snapshot.png')).size>0);checks.push('Live process metrics and PNG screenshot export');
await command('new',true);await command('navigate',origin+'/private-secret');await pause(150);await command('new');await command('navigate',origin+'/normal-session');await pause(250);await command('setting',{key:'collapsed',value:true});await js('document.querySelector("#homeButton").click()');await pause(100);fs.writeFileSync(path.join(output,'home.png'),(await capture(wc)).toPNG());
await js('document.querySelector("#shield").click()');await until(()=>js('document.querySelector("#panelTitle").textContent==="KRYLT Guard"'),'Guard dashboard');await command('guard-add','trusted.example');assert.equal(await js('document.querySelector("#panelBody").innerText.includes("trusted.example")'),true);await command('guard-remove','trusted.example');await js('document.querySelector("#closePanel").click()');
assert.equal(await js('getComputedStyle(document.querySelector("#dragHandle")).getPropertyValue("-webkit-app-region")'),'drag');assert.equal(await js('document.querySelector("[data-tool=ai]").title.includes("Gemini")'),true);assert.equal(await js('!!document.querySelector("#snapshot svg")'),true);checks.push('Guard whitelist, draggable title bar, multi-provider AI icon and camera icon');
await command('tool-open','whatsapp');await command('tool-resize',{width:600,height:380});const sized=win.contentView.children.filter(v=>v.webContents?.getURL().includes('/tool'));assert(sized.some(v=>v.getBounds().height===260));await command('tool-close');checks.push('Floating panel width and height apply to native views');
// Reproduce the recorded failure with actual renderer events: a native Play
// click opens an ad, a burst follows, and a player frame redirects separately.
await command('tool-open','movies');
await until(()=>win.contentView.children.some(v=>v.webContents?.session===session.fromPartition('persist:krylt-movies')&&v.webContents.getURL()===origin+'/tool'),'Movies workspace');
const movie=win.contentView.children.find(v=>v.webContents?.session===session.fromPartition('persist:krylt-movies'));
console.log('QA_MOVIES: workspace created');const movieWC=movie.webContents;await until(()=>!movieWC.isLoading(),'movie catalogue');
assert.equal(movieWC.getLastWebPreferences().disableDialogs,true);assert.notEqual(movieWC.session,session.fromPartition('persist:tempest-default'));
const chrome=win.contentView.children.find(v=>v.webContents?.getURL().endsWith('/src/tool.html'));
await until(()=>chrome.webContents.executeJavaScript('document.querySelector("#title").textContent==="KRYLT Movies"'),'dedicated title');
assert(movie.getBounds().width>1000);const fullBounds=movie.getBounds();
await command('tool-expand');assert(movie.getBounds().width<fullBounds.width);await command('tool-expand');assert.deepEqual(movie.getBounds(),fullBounds);
const beforeTabs=(await command('resource-stats')).tabs.length,beforeDialogs=dialogCalls;
await movieWC.executeJavaScript('document.querySelector("#page-click").onclick=()=>window.open('+JSON.stringify(secondaryOrigin+'/ad')+');void 0');
const button=await movieWC.executeJavaScript('(()=>{const r=document.querySelector("#page-click").getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};})()');movieWC.sendInputEvent({type:'mouseDown',...button,button:'left',clickCount:1});movieWC.sendInputEvent({type:'mouseUp',...button,button:'left',clickCount:1});
await pause(100);await movieWC.executeJavaScript('for(let i=0;i<8;i++)window.open('+JSON.stringify(secondaryOrigin+'/ad')+')');
console.log('QA_MOVIES: popup attempts sent');await movieWC.executeJavaScript('location.href='+JSON.stringify(secondaryOrigin+'/takeover'));await pause(200);
assert.equal(movieWC.getURL(),origin+'/tool');assert.equal(dialogCalls,beforeDialogs);assert.equal((await command('resource-stats')).tabs.length,beforeTabs);
await movieWC.executeJavaScript('var frame=document.createElement("iframe");frame.id="player";frame.src='+JSON.stringify(origin+'/frame-redirect')+';document.body.append(frame)');
await until(()=>movieWC.mainFrame.frames.some(f=>f.url===secondaryOrigin+'/player'),'cross-origin embedded player redirect');
console.log('QA_MOVIES: embedded redirect loaded');const embedded=movieWC.mainFrame.frames.find(f=>f.url===secondaryOrigin+'/player');
await movieWC.executeJavaScript('var advert=document.createElement("div");advert.id="extension-advert";advert.style="position: fixed; inset: 0; z-index: 2147483647";var pitch=document.createElement("iframe");pitch.srcdoc="<h1>Ad Block Ghost</h1>";advert.append(pitch);document.documentElement.append(advert)');
await until(()=>movieWC.executeJavaScript('getComputedStyle(document.querySelector("#extension-advert")).display==="none"'),'extension advert and click-overlay hidden');
assert.notEqual(await movieWC.executeJavaScript('getComputedStyle(document.querySelector("#player")).display'),'none');
await embedded.executeJavaScript('try{top.location.href='+JSON.stringify(secondaryOrigin+'/frame-takeover')+'}catch{}');await pause(150);assert.equal(movieWC.getURL(),origin+'/tool');
await movieWC.executeJavaScript('alert("should be suppressed");document.body.dataset.dialogs="suppressed"');assert.equal(await movieWC.executeJavaScript('document.body.dataset.dialogs'),'suppressed');
await movieWC.loadURL(origin+'/next');await command('tool-back');await until(()=>movieWC.getURL()===origin+'/tool','workspace Back');
console.log('QA_MOVIES: navigation controls passed');let downloadCanceled=false;movieWC.session.once('will-download',(_e,item)=>{downloadCanceled=item.getState()==='cancelled';item.once('done',(_event,status)=>{downloadCanceled=status==='cancelled';});});
await movieWC.downloadURL(origin+'/download');await until(()=>downloadCanceled,'blocked movie download');
await until(()=>chrome.webContents.executeJavaScript('document.querySelector("#status").textContent.includes("9 popups blocked")'),'visible silent-block counters');
fs.writeFileSync(path.join(output,'movies-toolbar.png'),(await capture(chrome.webContents)).toPNG());fs.writeFileSync(path.join(output,'movies-workspace.png'),(await capture(movieWC)).toPNG());
await command('guard-panel');await until(()=>js('document.querySelector("#panelTitle").textContent==="KRYLT Guard"'),'workspace Guard metrics');
assert.equal(dialogCalls,beforeDialogs);await js('document.querySelector("#closePanel").click()');await command('tool-close');
checks.push('Movies: native click popup + flood silently denied, top-level redirects blocked, embedded-player redirect allowed, dialogs and downloads suppressed, isolated storage, expansion, Back and visible Guard counts');

// Start from an already loaded page, as with the reported blank Salesforce
// page. The previous policy aborted this chain after comparing old/new origins.
await command('navigate',origin+'/compat-before');
await until(()=>win.contentView.children.some(v=>v.webContents?.getURL()===origin+'/compat-before'&&!v.webContents.isLoading()),'compatibility source page');
const compat=win.contentView.children.find(v=>v.webContents?.getURL()===origin+'/compat-before');
await command('navigate',origin+'/sso-start');
await until(()=>compat.webContents.getURL()===origin+'/signed-in'&&!compat.webContents.isLoading(),'cross-origin 302/303 sign-in chain');
assert.equal(await compat.webContents.executeJavaScript('document.querySelector("#app-content").textContent'),'Application loaded successfully');
await command('navigate',origin+'/auto-login');
await until(()=>compat.webContents.getURL()===origin+'/signed-in'&&!compat.webContents.isLoading(),'delayed script sign-in routing');
assert.equal(await js('document.querySelector("#pageError").hidden'),true);
checks.push('Normal 302/303 cross-origin login chains and delayed app routing render real content without whitelisting');
await command('navigate',origin+'/retry-page');
await until(()=>js('!document.querySelector("#pageError").hidden'),'visible network failure');
assert.equal(await js('document.querySelector("#pageErrorAddress").textContent'),origin+'/retry-page');
fs.writeFileSync(path.join(output,'page-load-error.png'),(await capture(wc)).toPNG());
await js('document.querySelector("#pageError [data-panel=guard]").click()');
await until(()=>js('document.querySelector("#panelTitle").textContent==="KRYLT Guard"'),'error protection settings');
await js('document.querySelector("#closePanel").click()');assert.equal(await js('document.querySelector("#pageError").hidden'),false);
networkUnavailable=false;await js('document.querySelector("#pageError [data-cmd=reload]").click()');
await until(()=>compat.webContents.getURL()===origin+'/retry-page'&&!compat.webContents.isLoading()&&compat.webContents.executeJavaScript('!!document.querySelector("#app-content")'),'retry recovers the page');
await until(()=>js('document.querySelector("#pageError").hidden'),'retry clears failure UI');
checks.push('Real network failure shows retry screen; protection panel return and retry recover visible content');

// Keep a normal page open for the saved-session assertion after window closure.
await command('navigate',origin+'/normal-session');await pause(300);win.close();await pause(80);const saved=JSON.parse(fs.readFileSync(path.join(profile,'tempest-ultra','tempest.json'),'utf8'));assert.ok(saved.session.some(entry=>entry.url.endsWith('/normal-session')));assert.equal(JSON.stringify(saved.session).includes('private-secret'),false);checks.push('Session survives window closure and excludes private tabs');
assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({checks,requestCount,errors},null,2));console.log('KRYLT_INTEGRATION_PASSED: '+checks.length+' flows');server.close();secondary.close();app.exit(0);
})().catch(error=>{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({error:error.stack,checks},null,2));console.error(error);server.close();secondary.close();app.exit(1);});
