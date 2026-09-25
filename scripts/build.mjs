import { readFile, writeFile, mkdir, rm, cp, access } from 'node:fs/promises';
import path from 'node:path';
import { layout, homeBody, detailBody, guideBody, groups, esc } from '../src/templates.mjs';
import { WHATSAPP_NUMBER } from '../src/whatsapp.mjs';
const read = async name => JSON.parse(await readFile(`data/${name}.json`,'utf8'));
const [site,ctas,services,guides] = await Promise.all(['site','ctas','services','guides'].map(read));
if (site.whatsappNumber !== WHATSAPP_NUMBER) throw Error('Atualize o contato de forma consistente em data/site.json e src/whatsapp.mjs.');
site.siteUrl = (process.env.SITE_URL || site.siteUrl || '').replace(/\/$/,'');
if (site.siteUrl) { const u = new URL(site.siteUrl); if (!['https:','http:'].includes(u.protocol)||u.pathname!=='/'||u.search||u.hash) throw Error('SITE_URL deve conter somente a origem HTTP(S).'); }
const collections={};
for (const type of Object.keys(groups)) {
 const items=await read(type);collections[type]=items.filter(x=>x.approved===true);
 const ids=new Set();
 for(const x of collections[type]) {
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x.id)||ids.has(x.id)) throw Error(`${type}: identificador ausente, inválido ou duplicado.`);ids.add(x.id);
  const fields=type==='properties'?['name','code','location']:type==='projects'?['name','author','context']:['title'];
  for(const f of fields) if(typeof x[f]!=='string'||!x[f].trim()) throw Error(`${type}/${x.id}: campo ${f} obrigatório.`);
  if(x.verified!==true||!Array.isArray(x.body)||!x.body.length||x.body.some(p=>typeof p!=='string'||!p.trim())) throw Error(`${type}/${x.id}: texto completo e verificação são obrigatórios.`);
  if(!x.images?.length)throw Error(`${type}/${x.id}: imagens identificadas são obrigatórias.`);
  for(const im of x.images){if(im.authorized!==true||!im.alt?.trim()||!im.credit?.trim()||!Number.isInteger(im.width)||!Number.isInteger(im.height)||im.width<1||im.height<1||!/^assets\/images\/[\w./-]+\.(webp|avif|jpe?g|png)$/.test(im.src)||im.src.includes('..'))throw Error(`${type}/${x.id}: metadados de imagem incompletos.`);await access(path.join('public',im.src));}
 }
}
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
await Promise.all(['styles.css','app.js'].map(f=>cp(`src/${f}`,`dist/${f}`)));
const ctx={site,ctas,services,guides,collections};
const title='Camilla Bonifácio | Arquitetura e Curadoria Imobiliária';
const description='Um olhar de arquiteta para escolher seu próximo imóvel. Conheça a curadoria imobiliária, a arquitetura residencial e a consultoria de Camilla Bonifácio.';
await writeFile('dist/index.html',layout({...ctx,body:homeBody(ctx),title,description,canonical:site.siteUrl?site.siteUrl+'/':''}));
const routes=['/'];
for (const guide of guides) {
 if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(guide.id) || !['service','criterion'].includes(guide.kind)) throw Error(`guides/${guide.id}: dados inválidos.`);
 if (!guide.title?.trim() || !guide.intro?.trim() || !guide.sections?.length || !guide.checklist?.length || !guide.sources?.length) throw Error(`guides/${guide.id}: conteúdo incompleto.`);
 const base=guide.kind==='service'?'servicos':'criterios';
 const route=`/${base}/${guide.id}/`;
 routes.push(route);
 await mkdir('dist'+route,{recursive:true});
 await writeFile('dist'+route+'index.html',layout({...ctx,body:guideBody(guide),title:`${guide.title} | Camilla Bonifácio`,description:guide.intro,canonical:site.siteUrl?site.siteUrl+route:'',prefix:'../../',home:'../../'}));
}
for(const [type,items]of Object.entries(collections))for(const item of items){const route=`/${groups[type].slug}/${item.id}/`;routes.push(route);await mkdir('dist'+route,{recursive:true});await writeFile('dist'+route+'index.html',layout({...ctx,body:detailBody(type,item),title:`${item.title||item.name} | Camilla Bonifácio`,description:item.body[0],canonical:site.siteUrl?site.siteUrl+route:'',prefix:'../../',home:'../../'}));}
if(site.siteUrl){await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(r=>`<url><loc>${esc(site.siteUrl+r)}</loc></url>`).join('')}</urlset>`);await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${site.siteUrl}/sitemap.xml\n`);}
else await writeFile('dist/robots.txt','User-agent: *\nAllow: /\n');
await mkdir('docs',{recursive:true});
const map=[...Object.entries(ctas).map(([id,x])=>({id,...x})),...services.map(s=>({id:'service-'+s.id,label:s.cta,section:'servicos',message:s.message})),...guides.map(g=>({id:'guide-'+g.id,label:g.ctaLabel,section:g.kind==='service'?'servicos':'criterios',message:g.message}))];
await writeFile('docs/Mapa_CTAs.md',`# Mapa de atendimento\n\nDestino: +55 83 99931-8581. Cada link abre a mensagem para o visitante revisar e enviar.\n\n| Identificador | Seção | Botão | Mensagem |\n|---|---|---|---|\n${map.map(x=>`| ${x.id} | ${x.section} | ${x.label} | ${x.message} |`).join('\n')}\n\nOs componentes de imóveis, projetos e artigos montam mensagens com o nome, código ou título do registro. As coleções iniciais estão vazias.\n`);
console.log(`Build concluído: ${routes.length} página(s), ${map.length} CTAs, domínio ${site.siteUrl?'configurado':'pendente'}.`);
