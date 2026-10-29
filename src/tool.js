'use strict';
const api=window.krylt,$=s=>document.querySelector(s);
const cmd=(a,p)=>api.command(a,p).catch(e=>$('#status').textContent=e.message);
for(const [id,action]of [['reload','tool-reload'],['tab','tool-tab'],['close','tool-close'],['back','tool-back'],['home','tool-home'],['expand','tool-expand'],['guard','guard-panel']])$('#'+id).onclick=()=>cmd(action);
document.querySelectorAll('[data-provider]').forEach(b=>b.onclick=()=>cmd('tool-open',b.dataset.provider));
api.onState(s=>{
 const t=s.tool;if(!t)return;const movies=t.key==='movies',ai=['chatgpt','gemini','claude'].includes(t.key);
 $('#title').textContent=movies?'KRYLT Movies':t.name;
 document.body.classList.toggle('expanded',!!t.expanded);document.body.classList.toggle('movies',movies);
 document.querySelectorAll('[data-provider]').forEach(b=>{b.hidden=!ai;b.classList.toggle('active',b.dataset.provider===t.key);});
 $('#site').textContent=movies?'Soap2Day · protected workspace':'';$('#guard').hidden=!movies;$('#tab').hidden=movies;$('#back').disabled=!t.canGoBack;
 $('#expand').title=$('#expand').ariaLabel=t.expanded?'Restore floating panel':'Expand workspace';
 $('#status').textContent=t.error?'Could not load: '+t.error+' · Try reload':t.loading?'Loading…':movies?`Protection on · ${t.protection?.popups||0} popups blocked · ${t.protection?.redirects||0} redirects stopped`:'Normal profile · Esc closes · Sign in with the service';
 $('#status').title=movies?'New windows, off-site page redirects, JavaScript dialogs and downloads are blocked. Embedded players may load other websites.':'';
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')cmd('tool-close');});cmd('init');
for(const id of ['resizeLeft','resizeCorner']){
 const handle=document.getElementById(id);let start=null;
 handle.onpointerdown=e=>{start={x:e.screenX,y:e.screenY,w:innerWidth,h:innerHeight};handle.setPointerCapture(e.pointerId);document.body.classList.add('resizing');};
 handle.onpointermove=e=>{if(!start)return;cmd('tool-resize',{width:Math.round(start.w-(e.screenX-start.x)),height:Math.round(start.h+(id==='resizeCorner'?e.screenY-start.y:0))});};
 handle.onpointerup=handle.onlostpointercapture=()=>{start=null;document.body.classList.remove('resizing');};
}
