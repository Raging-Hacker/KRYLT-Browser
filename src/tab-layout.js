(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.tabLayout=factory();})(this,()=>{
 'use strict';
 function splitTabs(tabs,active,width){
  const capacity=Math.max(1,Math.floor((Math.max(0,Number(width)||0)-126)/154));
  const visible=tabs.slice(0,capacity);const selected=tabs.find(t=>t.id===active);
  if(selected&&!visible.some(t=>t.id===active))visible[visible.length-1]=selected;
  const ids=new Set(visible.map(t=>t.id));return {visible,hidden:tabs.filter(t=>!ids.has(t.id))};
 }
 return {splitTabs};
});
