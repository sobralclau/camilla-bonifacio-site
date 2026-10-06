# CRM Cláudio Sobral v0.9 PRE-REGISTRO

Data de consolidação: 2026-10-06

## 1. Identificação da versão

Nome interno do software: CRM Cláudio Sobral  
Versão documental: 0.9 PRE-REGISTRO  
Estado: pré-registro, em validação técnica e operacional  
Cliente piloto: Camilla Bonifácio  
Repositório: `sobralclau/camilla-bonifacio-site`  
Branch: `chore/crm-core-separation`  
Commit de referência desta consolidação documental: `0c8ceb2e765d2e7f3d0193a5553149afc7264e83`  
Branch de produção: `main`

Este documento descreve o estado técnico do CRM no estágio anterior ao congelamento da versão 1.0.0. Não constitui certificado de registro, marca registrada ou cessão de direitos.

## 2. Objetivo do software

O CRM foi concebido como um núcleo reutilizável de gestão de leads e relacionamento comercial, com suporte a múltiplas implementações por cliente.

A arquitetura deve permitir que diferentes clientes utilizem o mesmo núcleo técnico, mantendo separados:

- dados;
- banco D1;
- domínio;
- marca;
- identidade visual;
- regras setoriais;
- textos e mensagens;
- credenciais;
- integrações específicas;
- configurações de atendimento.

A implementação da Camilla Bonifácio funciona como ambiente piloto prioritário para validação do núcleo.

## 3. Escopo funcional atual e planejado para v1.0

### Núcleo funcional

- captura de leads;
- normalização de dados;
- validação de nome e telefone;
- deduplicidade por telefone;
- persistência em banco;
- consulta administrativa;
- autenticação administrativa;
- atualização de status;
- ciclo de vida do lead;
- abertura de atendimento via WhatsApp;
- filtros;
- dashboard;
- histórico e observações;
- resultado ganho ou perdido;
- exportação;
- integrações de marketing quando aplicáveis;
- componentes reutilizáveis para múltiplas instâncias.

### Funções específicas da vertical imobiliária

- qualificação;
- aprovação de crédito, quando aplicável;
- visita;
- visita a imóvel pronto ou em obra;
- reunião de fechamento;
- venda direta ou em parceria;
- identificação de construtora ou imóvel próprio;
- ganho;
- perda;
- campos comerciais e imobiliários específicos.

Esses itens específicos não devem ser acoplados ao núcleo de forma que impeçam seu uso em outras verticais.

## 4. Arquitetura

### Plataforma

Cloudflare.

### Camadas principais

1. Front-end do site
2. Worker
3. CRM Core
4. Configuração específica do cliente
5. Cloudflare D1
6. Static Assets
7. Integrações externas

### Estrutura técnica em preparação

```
src/
  crm-core/
    README.md
    utils.js
    auth.js
    cloudflare.js
    leads.js
    lifecycle.js

  crm-client/
    camilla.config.js

  worker.js
```

A estrutura acima é a base da separação entre código reutilizável e código específico do cliente.

## 5. Módulos

### `src/crm-core/utils.js`

Responsabilidades:

- limpeza de valores;
- normalização de dígitos;
- respostas JSON;
- serialização CSV;
- construção de filtros temporais;
- geração de SHA-256 para usos internos compatíveis.

### `src/crm-core/auth.js`

Responsabilidades:

- autenticação administrativa genérica;
- validação de Basic Auth;
- comparação de hash;
- resposta de acesso não autorizado.

Estado atual:

- módulo separado;
- autenticação de produção ainda não migrada integralmente para secrets/bindings.

### `src/crm-core/cloudflare.js`

Responsabilidades:

- acesso genérico ao binding D1;
- acesso ao binding de Static Assets;
- operações auxiliares para banco;
- desacoplamento dos nomes específicos de cada instância.

### `src/crm-core/leads.js`

Responsabilidades:

- normalização de lead;
- validação de lead;
- verificação básica de duplicidade por telefone.

### `src/crm-core/lifecycle.js`

Responsabilidades:

- normalização do ciclo de vida;
- normalização de resultado;
- validações genéricas de fechamento ganho;
- validações genéricas de fechamento perdido.

### `src/crm-client/camilla.config.js`

Responsabilidades:

- identificar a instância;
- definir vertical;
- declarar bindings;
- declarar banco lógico;
- habilitar ou desabilitar recursos específicos.

## 6. Banco de dados

Tecnologia: Cloudflare D1.

### Produção

Banco lógico da instância Camilla:

`camilla-bonifacio-leads`

Binding:

`DB`

O banco de produção não deve ser utilizado para testes destrutivos ou experimentais.

### Preview

Banco separado de preview:

`camilla-bonifacio-preview`

Objetivo:

- testes operacionais;
- validação de schema;
- criação de leads de teste;
- testes de deduplicidade;
- testes de status;
- testes de funil;
- testes de integração.

Regra:

dados de preview e produção devem permanecer isolados.

## 7. Integrações

### Cloudflare Workers

Responsável pela camada de aplicação, rotas, APIs e acesso ao D1.

### Cloudflare D1

Persistência estruturada dos dados operacionais.

### Cloudflare Static Assets

Entrega dos arquivos estáticos vinculados ao Worker.

### GitHub

Controle de versão, histórico de commits, Pull Requests, documentação e evidências técnicas.

### WhatsApp

Canal de continuidade de atendimento a partir do lead capturado.

### Analytics e mídia

Podem existir integrações com Pixel, GA4, parâmetros UTM e Meta conforme a implementação e o estágio da instância.

Essas integrações externas não constituem propriedade do CRM.

## 8. Dependências identificadas

### Dependências técnicas

- Node.js 22 ou superior;
- Vite;
- JavaScript ES Modules;
- Web APIs compatíveis com Cloudflare Workers;
- Cloudflare Workers;
- Cloudflare D1;
- GitHub;
- bibliotecas e assets declarados no projeto.

### Tipografia

- Cormorant Garamond;
- Montserrat.

As fontes seguem suas respectivas licenças e não são reivindicadas como propriedade do CRM.

## 9. Componentes excluídos da titularidade do CRM Core

Não integram a reivindicação de titularidade do núcleo:

- marca Camilla Bonifácio;
- monograma;
- logotipos;
- identidade visual;
- fotografias;
- textos institucionais;
- textos editoriais;
- dados profissionais;
- conteúdo imobiliário da cliente;
- dados pessoais e dados de leads;
- domínio;
- número de WhatsApp;
- banco de dados enquanto conjunto de dados da cliente;
- serviços Cloudflare;
- GitHub;
- Node.js;
- Vite;
- fontes;
- bibliotecas externas;
- APIs e serviços de terceiros;
- componentes sujeitos a licença própria.

## 10. Elementos candidatos à titularidade técnica do núcleo

Sujeitos à revisão final de autoria, contrato e dependências:

- arquitetura de separação multi-instância;
- código próprio de validação e normalização;
- código próprio de captura de leads;
- abstrações próprias para D1 e Worker;
- regras genéricas de ciclo de vida;
- deduplicidade;
- lógica administrativa reutilizável;
- organização do funil;
- componentes reutilizáveis de dashboard;
- filtros;
- exportação;
- regras genéricas de ganho e perda;
- parametrização de instâncias;
- testes automatizados;
- documentação técnica autoral.

## 11. Testes já existentes

- normalização de nome;
- normalização de telefone;
- validação de lead;
- detecção básica de duplicidade;
- normalização de status;
- normalização de resultado;
- validação de ganho;
- validação de perda;
- carregamento da configuração Camilla;
- build;
- check do projeto;
- CI em Pull Request.

## 12. Testes operacionais pendentes

Antes do congelamento da versão 1.0.0:

- criação de lead no preview;
- consulta de lead no D1 de preview;
- duplicidade operacional;
- alteração de status;
- qualificação;
- ganho;
- perda;
- filtros;
- dashboard;
- exportação;
- WhatsApp;
- autenticação com secrets/bindings;
- responsividade do painel;
- regressão do site;
- isolamento de dados;
- ausência de impacto no ambiente de produção.

## 13. Riscos técnicos conhecidos

### Credenciais administrativas

O código atual ainda possui representação de credenciais administrativas dentro do Worker existente.

Antes da versão 1.0.0, esse modelo deve ser substituído por Cloudflare Secrets, bindings ou mecanismo equivalente.

### Acoplamento legado

Parte da lógica do CRM ainda permanece diretamente em `src/worker.js`.

A separação para `crm-core` deve ser progressiva, com validação em preview.

## 14. Política de versionamento

### v0.9 PRE-REGISTRO

Versão de preparação, separação arquitetural, documentação e testes.

### v1.0.0

Será criada somente quando:

- testes operacionais forem concluídos;
- autenticação for adequada;
- core estiver estável;
- dependências forem auditadas;
- escopo registrável estiver fechado;
- commit definitivo estiver identificado.

## 15. Política de congelamento

No momento do congelamento da v1.0.0 deverão ser registrados:

- data;
- commit;
- tag;
- lista de arquivos;
- dependências;
- documentação;
- testes;
- resultado dos testes;
- pacote técnico;
- algoritmo de hash;
- hash definitivo.

Após gerar o hash, o pacote correspondente não deverá ser alterado.

## 16. Estado atual

Situação desta versão:

- separação documental: concluída;
- scaffold do CRM Core: concluído;
- testes automatizados básicos: aprovados;
- build: aprovado;
- check: aprovado;
- testes operacionais completos: pendentes;
- versão 1.0.0: não congelada;
- hash definitivo: não gerado;
- protocolo de registro: não iniciado.

## 17. Próximo marco

Executar os testes operacionais no ambiente de preview da Camilla, utilizando o banco D1 de preview e preservando integralmente a produção.
