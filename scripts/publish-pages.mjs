import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {rm} from 'node:fs/promises';
const root=fileURLToPath(new URL('../',import.meta.url));const output=path.resolve(root,'pages-out');const index=path.resolve(root,'.pages-index');
execFileSync(process.execPath,[path.join(root,'scripts/build-pages.mjs')],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,[path.join(root,'scripts/validate-pages.mjs')],{cwd:root,stdio:'inherit'});
const options=['-c','safe.directory='+path.resolve(root),'-c','credential.helper=','-c','credential.helper=!gh auth git-credential','--git-dir='+path.join(root,'.git')];
function git(args,settings={}){return execFileSync('git',[...options,...args],{cwd:root,encoding:'utf8',...settings});}
const remote=git(['remote','get-url','origin']).trim();
if(remote!=='https://github.com/alexus2mad/Prophotoacademy.git')throw new Error('Unexpected publication repository');
const previous=git(['ls-remote','--heads','origin','gh-pages']).trim().split(/\s+/)[0];
if(previous)git(['fetch','origin','gh-pages']);
const env={...process.env,GIT_INDEX_FILE:index};
try{
 git(['read-tree','--empty'],{env});
 git(['--work-tree='+output,'add','--all'],{env,cwd:output});
 const tree=git(['write-tree'],{env}).trim();
 const source=git(['rev-parse','HEAD']).trim();
 const args=['commit-tree',tree,...(previous?['-p',previous]:[]),'-m','Publish static review from '+source.slice(0,7)];
 const commit=git(args,{env}).trim();
 git(['update-ref','refs/heads/gh-pages',commit]);
 git(['push','origin','gh-pages'],{stdio:'inherit'});
 console.log('Published reviewed static files to gh-pages; main source and index remain intact.');
}finally{await rm(index,{force:true});}
