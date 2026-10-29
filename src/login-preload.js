'use strict';
const {ipcRenderer}=require('electron');
// Credential-free notification: the browser shell decides whether to offer
// its existing explicit, user-confirmed "Save login" action.
if(process.isMainFrame){
 let last=0;
 document.addEventListener('focusout',event=>{
  try{
   const field=event.target;
   if(location.protocol!=='https:'||field?.type!=='password'||!field.value)return;
   if(field.autocomplete==='new-password'||field.autocomplete==='one-time-code')return;
   const form=field.form;
   if(!form||form.querySelectorAll('input[type="password"]').length!==1)return;
   const target=new URL(form.getAttribute('action')||location.href,location.href);
   if(target.origin!==location.origin)return;
   if(Date.now()-last<30000)return;
   last=Date.now();
   ipcRenderer.send('krylt-login-field-ready',{origin:location.origin});
  }catch{}
 },true);
}
