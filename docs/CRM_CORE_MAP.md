# Mapa de separação do CRM

## Objetivo

Separar o núcleo reutilizável do CRM das customizações exclusivas da implementação Camilla Bonifácio, sem alterar o funcionamento atual do site ou do ambiente de produção.

## Núcleo reutilizável identificado

Os elementos abaixo são candidatos a compor o CRM-base proprietário, sujeitos a revisão técnica e de licenças:

- autenticação administrativa;
- captura e persistência de leads;
- normalização de nome e telefone;
- integração com Cloudflare Workers;
- persistência em D1;
- rotas administrativas;
- atualização de status de atendimento;
- abertura de atendimento pelo WhatsApp;
- estrutura de funil e ciclo de vida do lead;
- filtros administrativos;
- exportação e métricas quando compartilhadas com outras implementações;
- deduplicidade por telefone;
- histórico e campos de acompanhamento;
- componentes de interface administrativa reutilizáveis.

## Customizações da Camilla Bonifácio

Devem permanecer fora do núcleo genérico:

- identidade visual, paleta e tipografia;
- nome Camilla Bonifácio;
- textos institucionais;
- conteúdo de arquitetura e curadoria imobiliária;
- mensagens comerciais específicas;
- número e mensagens de WhatsApp;
- nomenclaturas de setores;
- regras específicas do funil imobiliário;
- campos exclusivos de imóvel, visita, parceria, construtora, comissão e fechamento;
- banco e binding específicos da instância;
- domínio, configuração de deploy e ativos da marca;
- fotografias, logotipos e demais materiais da cliente.

## Arquivos atualmente relevantes

- `src/worker.js`: contém hoje código de infraestrutura do CRM e customizações da instância.
- `src/app.js`: contém captura de leads e lógica de conversão vinculada ao site.
- `wrangler.jsonc`: contém configuração específica da instância e bancos D1.

## Próxima estrutura recomendada

```
src/
  crm-core/
    auth.js
    leads.js
    lifecycle.js
    deduplication.js
    admin.js
    whatsapp.js
  crm-client/
    camilla.config.js
  worker.js
```

A implementação deve ocorrer em etapa posterior, com testes, sem alterar produção até validação.

## Titularidade e dependências

A separação documental inicial foi consolidada em documentos complementares desta mesma branch. Este mapa permanece como referência de arquitetura e não substitui análise jurídica. Antes do congelamento da versão 1.0.0, devem permanecer auditados:

- histórico de commits;
- autoria dos componentes;
- bibliotecas e licenças de terceiros;
- elementos produzidos com ferramentas externas;
- contratos e cláusulas de cessão/licenciamento;
- componentes específicos da cliente.

## Regra de preservação

Nenhum componente da marca, conteúdo, fotografia ou ativo exclusivo da Camilla Bonifácio deve ser incorporado ao CRM-base.


## Status documental em 2026-10-06

A fronteira documental entre CRM Core e implementação Camilla está concluída para permitir o início dos testes operacionais. O código de produção permanece fora deste processo até validação em preview.
