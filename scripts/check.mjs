import {readFile,stat,access} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createWhatsAppUrl,itemMessage} from '../src/whatsapp.mjs';
const html=await readFile('dist/index.html','utf8');
assert.equal((html.match(/<h1\b/g)||[]).length,1);
assert(html.includes('lang="pt-BR"'));
assert(!/[\u2013\u2014]/.test(html),'Travessões no conteúdo.');
assert(!/São Paulo|DDD 11|CRECI|99944|lojaminhakasa|camillabonifacio\.arq/.test(html));
const ctas=JSON.parse(await readFile('data/ctas.json','utf8'));
const services=JSON.parse(await readFile('data/services.json','utf8'));
const expected={...Object.fromEntries(Object.entries(ctas).map(([id,x])=>[id,x.message])),...Object.fromEntries(services.map(s=>['service-'+s.id,s.message]))};
const actual=[...html.matchAll(/<a\b[^>]*data-cta-id="([^"]+)"[^>]*>/g)];assert.equal(actual.length,9);
for(const [tag,id]of actual){const href=tag.match(/href="([^"]+)"/)[1].replaceAll('&amp;','&');const url=new URL(href);assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/5583999318581');assert.equal(url.searchParams.get('text'),expected[id]);assert(tag.includes('noopener noreferrer'));assert(!/[{}]/.test(url.searchParams.get('text')));}
for(const group of ['properties','projects','articles']){const rows=JSON.parse(await readFile(`data/${group}.json`,'utf8'));assert.equal(rows.length,0);}
for(const ref of [...html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)].map(m=>m[1]))await access('dist/'+ref);
const css=await readFile('dist/styles.css','utf8');
for(const m of css.matchAll(/url\('\.\/([^']+)'\)/g)){assert((await stat('dist/'+m[1])).size>0);}
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
for(const m of html.matchAll(/href="#([^"]+)"/g))assert(ids.has(m[1]),'Âncora sem destino: '+m[1]);
for(const type of ['properties','projects','articles']){const url=new URL(createWhatsAppUrl(itemMessage(type,{name:'Opção de teste',code:'REF-001',title:'Leitura da planta'})));assert(!/[{}]|undefined/.test(url.searchParams.get('text')));}
assert.throws(()=>createWhatsAppUrl('Olá {nome}'));assert.throws(()=>createWhatsAppUrl(''));
const relativeLuminance=hex=>{const rgb=hex.match(/\w\w/g).map(h=>parseInt(h,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722};
const contrast=(a,b)=>{const x=relativeLuminance(a),y=relativeLuminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
for(const [a,b]of [['854D37','F6EFE6'],['2F2F2F','F6EFE6'],['61584f','F6EFE6'],['61584f','eee4d9'],['854D37','eee4d9'],['D7C3B1','2F2F2F']]){const ratio=contrast(a,b);assert(ratio>=4.5,`Contraste insuficiente ${a}/${b}: ${ratio}`);console.log(`Contraste ${a}/${b}: ${ratio.toFixed(2)}:1`);}
console.log('Verificados: 9 CTAs, mensagens, acentos, âncoras, assets, fontes, contraste e coleções vazias.');
