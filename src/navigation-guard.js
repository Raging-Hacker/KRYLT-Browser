'use strict';
const {webURL}=require('./policy');
const {allowed,sameSite}=require('./guard');
// Observed site advert: a fixed overlay containing a srcdoc extension pitch.
// Match its actual copy and fixed wrapper, never generic player iframes.
const MOVIE_AD_CSS='iframe[srcdoc*="Ad Block Ghost" i], :is(html, body) > div[style*="position: fixed"]:has(iframe[srcdoc*="Ad Block Ghost" i]) { display: none !important; pointer-events: none !important; }';

// Keep the catalogue and embedded players separate: a player may load in a
// frame, but must never replace the catalogue or spawn an advertising tab.
function movieURL(value,root='https://ww25.soap2day.day/'){
 if(!webURL(value))return false;
 const u=new URL(value),base=new URL(root);
 if(/^(?:ww\d+\.)?soap2day\.day$/.test(base.hostname))return u.protocol==='https:'&&!u.port&&/^(?:ww\d+\.)?soap2day\.day$/.test(u.hostname);
 return u.origin===base.origin; // The integration fixture uses its own origin.
}

function protectNavigation(wc,{guard,settings,changed,openTab,movieRoot=null,now=Date.now}){
 let gesture=0,lastPopup=0;
 const counts={popups:0,redirects:0};
 const strict=()=>!!movieRoot||movieURL(wc.getURL());
 const blocked=(kind,url)=>{counts[kind]++;guard.record(kind,url);changed();};
 wc.on('before-mouse-event',(_e,m)=>{if(m.type==='mouseDown')gesture=now();});
 wc.on('before-input-event',(_e,k)=>{if(k.type==='keyDown')gesture=now();});
 wc.setWindowOpenHandler(({url})=>{
  const source=wc.getURL(),s=settings(),recent=gesture>0&&now()-gesture<1000;
  // An ad script runs during the very same click as Play. Recent input alone
  // therefore cannot authorize a new window, even when Chromium allows it.
  if(strict()||!webURL(url)||(s.blockPopups&&!allowed(source,guard.whitelist))||!recent||now()-lastPopup<1500){blocked('popups',url);return {action:'deny'};}
  lastPopup=now();gesture=0;openTab(url);return {action:'deny'};
 });
 function check(event,url,isMainFrame=true,redirect=false){
  if(!isMainFrame)return; // Cross-origin player-frame redirects are legitimate.
  const source=wc.getURL(),initiator=event.initiator;
  const movie=strict();
  const childInitiated=!!initiator&&initiator!==wc.mainFrame;
  const recent=gesture>0&&now()-gesture<1000;
  const deny=!webURL(url)||(movie&&!movieURL(url,movieRoot||undefined))||
   (!movie&&settings().blockRedirects&&webURL(source)&&!sameSite(source,url)&&!allowed(source,guard.whitelist)&&(redirect||childInitiated||!recent));
  if(deny){event.preventDefault();blocked('redirects',url);}
 }
 wc.on('will-frame-navigate',event=>check(event,event.url,event.isMainFrame));
 wc.on('will-redirect',(event,url,_inPlace,isMainFrame)=>check(event,event.url||url,event.isMainFrame??isMainFrame??true,true));
 wc.on('will-prevent-unload',event=>{if(strict())event.preventDefault();});
 return counts;
}
module.exports={movieURL,protectNavigation,MOVIE_AD_CSS};
