'use strict';
const path=require('node:path'),fs=require('node:fs'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..');
let electron=process.env.KRYLT_ELECTRON_BINARY;
if(!electron){try{electron=require('electron');}catch{throw Error('Install Electron with npm ci, or set KRYLT_ELECTRON_BINARY to a local Electron executable.');}}
const args=[];if(process.env.KRYLT_TEST_UNSANDBOXED==='1')args.push('--no-sandbox');args.push(path.join(root,'test','integration-app.cjs'));
const child=spawn(electron,args,{cwd:root,stdio:'inherit',env:{...process.env,KRYLT_QA_OUTPUT:process.env.KRYLT_QA_OUTPUT||path.join(root,'qa-output')}});
const timer=setTimeout(()=>{console.error('Electron integration test timed out');child.kill('SIGKILL');},90000);timer.unref();
child.on('error',error=>{console.error(error.message);process.exitCode=1;});child.on('exit',code=>{clearTimeout(timer);process.exitCode=code===0?0:1;});
