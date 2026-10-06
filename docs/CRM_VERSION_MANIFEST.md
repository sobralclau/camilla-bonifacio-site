# Manifesto de versão pré-registro

## Identificação

Software: CRM Core Cláudio Sobral  
Versão documental atual: **0.9.0-pre**  
Data: 2026-10-06  
Status: preparação técnica e documental  
Cliente piloto: Camilla Bonifácio  
Infraestrutura-alvo: Cloudflare Workers + Cloudflare D1  
Branch de trabalho: `chore/crm-core-separation`

## Objetivo desta versão

A versão 0.9.0-pre existe para:

- separar o núcleo reutilizável das customizações da cliente;
- validar arquitetura multi-instância;
- consolidar documentação de autoria, dependências e escopo;
- executar testes automatizados e operacionais;
- preparar o futuro congelamento da versão 1.0.0.

Esta versão não é a versão destinada ao hash definitivo do pedido de registro.

## Módulos já separados em scaffold

- `src/crm-core/utils.js`
- `src/crm-core/auth.js`
- `src/crm-core/cloudflare.js`
- `src/crm-core/leads.js`
- `src/crm-core/lifecycle.js`
- `src/crm-client/camilla.config.js`

## Testes existentes

- normalização de nome e telefone;
- validação de leads;
- detecção básica de duplicidade por telefone;
- normalização de ciclo de vida;
- normalização de resultado;
- validação de fechamento ganho;
- validação de fechamento perdido;
- carregamento da configuração da instância Camilla;
- build do projeto;
- verificações existentes do projeto.

## Critérios pendentes para v1.0.0

- integração gradual do core ao Worker de preview;
- teste D1 em ambiente isolado;
- captura e leitura de lead de teste;
- deduplicidade operacional;
- autenticação sem segredo versionado;
- funil imobiliário completo;
- ganho e perda;
- filtros e dashboard;
- exportação;
- WhatsApp;
- regressão do site;
- isolamento entre dados do cliente e núcleo;
- revisão final de dependências e licenças;
- criação do pacote técnico congelado;
- geração do hash somente após aprovação.

## Regra de versionamento

A futura versão `1.0.0` deverá apontar para um commit imutável e um pacote técnico preservado. Qualquer mudança relevante posterior deverá receber nova versão e, se necessário, novo pacote de evidência e novo registro.
