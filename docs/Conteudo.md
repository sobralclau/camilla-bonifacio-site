# Publicação de conteúdo

As coleções começam vazias. Cada registro só é exibido com `approved: true` e `verified: true`. O build rejeita registros aprovados incompletos. Registros não aprovados permanecem invisíveis e não são copiados para o site.

## Campos comuns

| Campo | Conteúdo |
|---|---|
| `id` | Identificador único em letras minúsculas, números e hífens |
| `approved` | Aprovação explícita de publicação |
| `verified` | Confirmação de verificação do conteúdo |
| `body` | Lista de parágrafos completos, em texto simples |
| `images` | Lista de imagens autorizadas e identificadas |

Cada imagem exige `src` dentro de `assets/images/`, `alt`, `credit`, `width`, `height` e `authorized: true`. Inclua o arquivo correspondente em `public/assets/images`. A origem e autorização devem ser documentadas antes da inclusão. Textos são escapados como HTML; não inserir marcação nos campos.

## Campos por coleção

| Coleção | Campos adicionais obrigatórios | Página gerada |
|---|---|---|
| `properties.json` | `name`, `code`, `location` | `/imoveis/{id}/` |
| `projects.json` | `name`, `author`, `context` | `/projetos/{id}/` |
| `articles.json` | `title` | `/conteudo/{id}/` |

No corpo do imóvel, publique somente atributos confirmados. Para projetos, a autoria e o contexto são exibidos expressamente. Artigos precisam estar completos e revisados. A implementação não inclui amostras fictícias.

Cada registro ganha um cartão, uma página própria e o CTA previsto no briefing. Os links personalizados incluem nome e código do imóvel, nome do projeto ou título do conteúdo. A navegação correspondente só aparece quando a coleção contém itens aprovados.

Metadados de páginas individuais têm título e descrição próprios. A imagem social desta versão é institucional; pode ser substituída por imagem específica e autorizada de cada registro em uma expansão editorial futura.
