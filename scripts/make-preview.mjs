import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
let html=await readFile('dist/index.html','utf8');
let css=await readFile('dist/styles.css','utf8');
const dataUrl=async file=>{const ext=path.extname(file);const type={'.woff2':'font/woff2','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png'}[ext];return `data:${type};base64,${(await readFile(file)).toString('base64')}`;};
for(const match of [...css.matchAll(/url\('\.\/([^']+)'\)/g)]) css=css.replace(match[0],`url('${await dataUrl('dist/'+match[1])}')`);
html=html.replace('<link rel="stylesheet" href="./styles.css">',`<style>${css}</style>`).replace(/<link rel="preload"[^>]*>/g,'');
const app=await readFile('dist/app.js','utf8');
html=html.replace('<script src="./app.js" defer></script>',`<script>${app}</script>`);
html=html.replace('href="./assets/brand/favicon.png"',`href="${await dataUrl('dist/assets/brand/favicon.png')}"`);
for(const match of [...html.matchAll(/<img\b[^>]*>/g)]) {
 let tag=match[0];
 const src=tag.match(/src="\.\/([^"]+)"/);
 if(!src) continue;
 tag=tag.replace(/\s+srcset="[^"]*"/,'').replace(/\s+sizes="[^"]*"/,'').replace(src[0],`src="${await dataUrl('dist/'+src[1])}"`);
 html=html.replace(match[0],tag);
}
html=html.replace('<title>Camilla Bonifácio | Arquitetura e Curadoria Imobiliária</title>','<title>Prévia | Camilla Bonifácio</title>');
const output=process.argv[2]||'Previa_Site_Camilla_Bonifacio.html';
await mkdir(path.dirname(output),{recursive:true});
await writeFile(output,html);
console.log('Prévia direta salva: '+output);
