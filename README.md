# Camilla Bonifácio

Site institucional estático, em português, com arquitetura editorial e atendimento pelo WhatsApp. A primeira versão contém Início, Sobre, Serviços, Diferencial e Contato. Imóveis, projetos e conteúdos só aparecem com registros aprovados e completos.

## Executar

Requer Node.js 22 ou superior.

```bash
npm ci
npm run build
npm run preview
```

Acesse `http://localhost:4173`. Para desenvolvimento com atualização ao vivo: execute o build após alterar fontes ou dados e use `npm run dev`. O servidor Vite serve `dist`; as fontes editáveis ficam em `src` e `data`. Para validar: `npm run check`.

O build e a prévia simples usam somente módulos nativos do Node.js. A dependência Vite é exclusiva do ambiente de desenvolvimento.

## Organização

- `src/templates.mjs`: HTML semântico e componentes de página.
- `src/styles.css`: identidade, tipografia, contrastes e responsividade.
- `src/app.js`: navegação móvel e adaptador opcional de medição.
- `src/whatsapp.mjs`: número de destino e construção central de URLs.
- `data/site.json`: informações profissionais e parâmetros públicos.
- `data/ctas.json` e `data/services.json`: mensagens e serviços.
- `data/properties.json`, `projects.json`, `articles.json`: conteúdo aprovado, inicialmente vazio.
- `public/assets`: fotografias preparadas para web e fontes locais.
- `scripts/build.mjs`: geração de páginas, mapa de CTAs e metadados.
- `scripts/preview.mjs`: servidor local estático.
- `scripts/check.mjs`: checagens dos requisitos principais.
- `dist`: site gerado, com `index.html` na raiz.
- `docs`: mapa dos CTAs, publicação de conteúdo e verificação.

O pacote entregue inclui `dist` para inspeção imediata. No Git, essa pasta é ignorada e reconstruída pelo Cloudflare Pages.

## Identidade e fotografias

Paleta: off-white `#F6EFE6`, areia `#D7C3B1`, terracota `#A8694E`, taupe `#8C7B6B` e grafite `#2F2F2F`.

O token funcional `--terra-text: #854D37` escurece o terracota em textos pequenos e botões para garantir contraste. Não substitui a cor institucional. Cormorant Garamond nos títulos; Montserrat em conteúdo e controles. As fontes WOFF2 estão incluídas, com caracteres portugueses e licenças OFL. Não há dependência de Google Fonts durante a navegação.

Fontes originais: https://github.com/google/fonts/tree/main/ofl/cormorantgaramond e https://github.com/google/fonts/tree/main/ofl/montserrat.

O retrato de blazer mantém o círculo, a composição cinza e suas proporções. O retrato rosa usa somente enquadramento CSS, preservando a fotografia; a taça fica fora do recorte. Uma pequena parte da pessoa ao lado pode permanecer visível conforme a largura. Nenhum rosto foi reconstruído ou modificado. Não houve ampliação para simular recuperação de resolução.

O cabeçalho, as seções terracota e preta, o contato, o rodapé e o favicon usam versões da marca preparadas a partir das composições fornecidas. O desenho do monograma e do wordmark foi preservado. As versões foram separadas tecnicamente para fundo claro, terracota e preto, sem redesenho da marca.

A imagem Open Graph é uma cópia da fotografia autorizada de blazer, sem alteração. Título e descrição acompanham a imagem nos metadados. URLs absolutas, canonical, sitemap e `og:image` são inseridos somente quando `SITE_URL` é configurado. A ausência de domínio não gera endereços fictícios.

## GitHub e Cloudflare Pages

A entrega não criou repositório remoto, não vinculou contas e não publicou o site. Essas ações aguardam solicitação.

1. Crie um repositório no GitHub e envie o código na branch `main`, sem `node_modules`, anexos privados ou segredos.
2. No Cloudflare, abra Workers & Pages, selecione Pages e importe o repositório Git.
3. Use preset de framework `None`, branch de produção `main`, comando `npm run build` e diretório de saída `dist`.
4. Configure uma versão suportada do Node.js, no mínimo 22.
5. Faça alterações em uma branch separada e revise o endereço de preview do Pages antes de mesclar em `main`.
6. Depois de existir um endereço efetivo aprovado, configure `SITE_URL` com essa origem, sem caminho, por exemplo o domínio confirmado. A variável pode ser diferente nos ambientes de produção e preview. Deixe vazia até conhecer o endereço.

O `package-lock.json` fixa as versões de desenvolvimento. Não existem configurações de outro provedor.

### Domínio próprio

Após definir o domínio, adicione-o em Custom domains do projeto Pages. Faça os ajustes DNS indicados pelo Cloudflare para o caso de domínio raiz ou subdomínio. Confirme o estado ativo e o HTTPS. Escolha uma versão principal, com ou sem `www`, configure `SITE_URL` com ela e direcione a outra versão por redirecionamento no Cloudflare. Defina também a política de acesso/redirecionamento do endereço `pages.dev`. Não configure DNS ou redirects com nomes provisórios.

Documentação oficial consultada:

- https://developers.cloudflare.com/pages/configuration/git-integration/
- https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- https://developers.cloudflare.com/pages/configuration/custom-domains/

## WhatsApp e medição

Os nove CTAs comerciais usam o número `5583999318581`. O HTML já contém os links completos, independentemente do JavaScript. Veja `docs/Mapa_CTAs.md`.

A configuração `analytics.enabled` começa em `false`. Nenhum Pixel, Analytics ou cookie de medição foi instalado. Depois de configurar a ferramenta e revisar os requisitos de privacidade, habilite o adaptador e implemente `window.siteAnalytics(eventName, payload)`. O único evento preparado é `whatsapp_click`, com `cta_id`, `section` e `item_id`, quando existente. Não inclui mensagens nem dados pessoais. Cada clique dispara no máximo uma chamada desse adaptador. Evite configurar uma segunda captura automática para o mesmo evento na ferramenta escolhida.

Um clique não comprova envio de mensagem, conversa iniciada, lead qualificado ou venda. O envio depende da ação do visitante no WhatsApp.

## Pendências antes de produção

- Domínio e decisão sobre `www`.
- Arquivos vetoriais definitivos da marca, quando forem produzidos, para substituir as versões raster fornecidas.
- Fotografia original do blazer sem moldura para eventual nova composição.
- Registros profissionais a exibir.
- Perfis sociais e eventual link do crédito Cláudio Sobral.
- Área de atendimento e horários confirmados.
- Materiais de imóveis e projetos com identificação, informações verificadas e autorização de uso.
- Conteúdos completos e aprovados, quando houver.
- Revisão visual em navegador nas quatro larguras solicitadas e aprovação editorial da cliente.

## Estado da verificação

Build executado e referências de arquivos verificadas. Nove URLs comerciais conferidas contra as mensagens do briefing, incluindo acentos. Contrastes de texto verificados por cálculo. Coleções sem material continuam vazias e ocultas. Anexos privados e dossiê não estão no pacote público.

A tentativa de revisão visual automatizada foi bloqueada pela política de acesso do navegador deste ambiente. Portanto, não foi possível confirmar visualmente ausência de sobreposições em 360, 390, 768 e 1440 px nem medir Core Web Vitals. A prévia independente entregue oferece essas quatro larguras para revisão manual. Não houve publicação.
