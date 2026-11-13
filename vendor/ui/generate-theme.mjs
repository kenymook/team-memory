import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
const tokens=JSON.parse(fs.readFileSync(path.join(dir,'tokens.json'),'utf8'));
const foundation=tokens.$collections.foundation.$modes['Mode 1'];
const components=tokens.$collections.components.$modes['Mode 1'];
const get=(obj,parts)=>parts.reduce((v,k)=>v?.[k],obj);

function leaves(node,prefix=[],out=[]){
  if(!node || typeof node!=='object')return out;
  if('$value' in node)out.push([prefix,node]);
  for(const [k,v] of Object.entries(node)){
    if(!k.startsWith('$'))leaves(v,[...prefix,k],out);
  }
  return out;
}
function resolve(value,semantic,trail=[]){
  if(typeof value!=='string')return String(value);
  const match=value.match(/^\{(.+)\}$/);
  if(!match)return value;
  if(trail.includes(match[1]))throw new Error('Cyclic token: '+match[1]);
  if(match[1]==='color.transparent')return 'transparent';
  const parts=match[1].split('.');
  const leaf=get(semantic,parts)||get(foundation,parts)||get(components,parts);
  if(!leaf || !('$value' in leaf))throw new Error('Missing token: '+match[1]);
  return resolve(leaf.$value,semantic,[...trail,match[1]]);
}
const sections=[];
for(const mode of ['Light','Dark']){
  const semantic=tokens.$collections.semantic.$modes[mode];
  const vars=new Map();
  for(const [parts,leaf] of leaves(semantic)){
    vars.set('--'+parts.join('-'),resolve(leaf.$value,semantic));
  }
  for(const [parts,leaf] of leaves(components)){
    vars.set('--'+parts.join('-'),resolve(leaf.$value,semantic));
  }
  // Map the scaffold package's flattened Button names to its actual component tokens.
  for(const [alias,source] of Object.entries({
    primary:['button','primary','solid'],
    secondary:['button','neutral','secondary'],
    outline:['button','neutral','outline'],
    ghost:['button','neutral','ghost'],
    text:['button','neutral','text'],
    destruction:['button','danger','solid']
  })){
    for(const [parts,leaf] of leaves(get(components,source))){
      vars.set('--button-'+alias+'-'+parts.join('-'),resolve(leaf.$value,semantic));
    }
  }
  for(const [alias,source] of Object.entries({secondary:'neutral',outline:'neutral',destruction:'danger'})){
    for(const [parts,leaf] of leaves(components['icon-button'][source])){
      vars.set('--icon-button-'+alias+'-'+parts.join('-'),resolve(leaf.$value,semantic));
    }
  }
  vars.set('--ui-font-family',foundation.font.family.$value+', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif');
  vars.set('--ui-body-size',foundation.font.body.base.size.$value+'px');
  vars.set('--ui-body-line-height',foundation.font.body.base.lineHeight.$value+'px');
  vars.set('--ui-radius',foundation.border.radius.m.$value+'px');
  const selector=mode==='Light'?':root, [data-theme="light"]':'[data-theme="dark"]';
  sections.push(selector+' {\n'+[...vars].map(([k,v])=>'  '+k+': '+v+';').join('\n')+'\n}');
}
fs.writeFileSync(path.join(dir,'theme.css'),'/* Generated from tokens.json; run node vendor/ui/generate-theme.mjs. */\n'+sections.join('\n\n')+'\n');
console.log('Generated Light/Dark semantic and component variables with all references resolved.');
