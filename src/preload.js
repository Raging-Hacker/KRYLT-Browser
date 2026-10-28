const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('krylt',Object.freeze({command:(action,payload)=>ipcRenderer.invoke('command',action,payload),onState:(callback)=>{ipcRenderer.on('state',(_e,data)=>callback(data));}}));
