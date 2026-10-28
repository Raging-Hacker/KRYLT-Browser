'use strict';
const {parse}=require('parse5');const {webURL}=require('./policy');
const MAX_BYTES=5*1024*1024,MAX_BOOKMARKS=500;
function textOf(root){let out='';const stack=[root];while(stack.length){const n=stack.pop();if(n.nodeName==='script'||n.nodeName==='style')continue;if(n.nodeName==='#text'){out+=n.value;if(out.length>20000)break;}else for(let i=(n.childNodes||[]).length-1;i>=0;i--)stack.push(n.childNodes[i]);}return out;}
function normalize(item){if(!item||typeof item.url!=='string'||item.url.length>8192||!webURL(item.url))return null;const url=new URL(item.url).href;return {url,title:(typeof item.title==='string'?item.title.trim().replace(/\s+/g,' '):'').slice(0,120)||new URL(url).hostname};}
function importBookmarks(source,format,existing=[]){if(typeof source!=='string'||Buffer.byteLength(source,'utf8')>MAX_BYTES)throw Error('Bookmark files must be smaller than 5 MB');let candidates=[];
 if(format==='json'){let data;try{data=JSON.parse(source);}catch{throw Error('Invalid bookmark JSON');}if(!data||!['tempest-bookmarks','krylt-bookmarks'].includes(data.format)||data.version!==1||!Array.isArray(data.bookmarks))throw Error('Not a supported KRYLT bookmark backup');candidates=data.bookmarks;}
 else if(format==='html'){const root=parse(source);const stack=[root];while(stack.length){const n=stack.pop();if(n.nodeName==='script'||n.nodeName==='style')continue;if(n.nodeName==='a'){candidates.push({url:n.attrs?.find(a=>a.name==='href')?.value,title:textOf(n)});}for(let i=(n.childNodes||[]).length-1;i>=0;i--)stack.push(n.childNodes[i]);}}
 else throw Error('Choose an HTML bookmark file or KRYLT JSON backup');
 if(!candidates.length&&format==='html'&&!/NETSCAPE-Bookmark-file-1/i.test(source))throw Error('No bookmarks were found in this file');const result=existing.map(normalize).filter(Boolean);const seen=new Set(result.map(b=>b.url));let imported=0,duplicates=0,invalid=0,overLimit=0;
 for(const candidate of candidates){const b=normalize(candidate);if(!b){invalid++;continue;}if(seen.has(b.url)){duplicates++;continue;}seen.add(b.url);if(result.length>=MAX_BOOKMARKS){overLimit++;continue;}result.push(b);imported++;}
 return {bookmarks:result,summary:{imported,duplicates,invalid,overLimit,total:result.length}};
}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function exportBookmarks(items,format){const bookmarks=items.map(normalize).filter(Boolean);if(format==='json')return JSON.stringify({format:'krylt-bookmarks',version:1,bookmarks},null,2)+'\n';if(format!=='html')throw Error('Unsupported export format');return '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>KRYLT Bookmarks</TITLE>\n<H1>KRYLT Bookmarks</H1>\n<DL><p>\n'+bookmarks.map(b=>'    <DT><A HREF="'+escape(b.url)+'">'+escape(b.title)+'</A>').join('\n')+'\n</DL><p>\n';}
module.exports={importBookmarks,exportBookmarks,MAX_BYTES};
