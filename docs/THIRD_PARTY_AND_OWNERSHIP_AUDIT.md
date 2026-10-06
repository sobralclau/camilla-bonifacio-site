# Auditoria preliminar de dependências e titularidade técnica

Data: 2026-10-06

## Escopo

Levantamento inicial para preparar a separação entre código autoral do CRM, infraestrutura Cloudflare, bibliotecas de terceiros e ativos exclusivos da cliente.

## Infraestrutura e dependências identificadas

### Cloudflare
- Cloudflare Workers
- Cloudflare D1
- Static Assets via binding `ASSETS`
- Configuração de produção em `wrangler.jsonc`

Esses serviços são infraestrutura de terceiros e não integram a titularidade autoral do CRM. O código de integração e as regras implementadas sobre eles podem constituir código próprio.

### Desenvolvimento
- Vite, dependência de desenvolvimento declarada em `package.json`
- Node.js 22+ para build
- JavaScript/ES modules e APIs Web/Workers

### Tipografia
- Cormorant Garamond
- Montserrat
- Arquivos locais informados no README como licenciados sob SIL Open Font License

As fontes não devem ser reivindicadas como propriedade do CRM.

## Ativos específicos da cliente

Não devem integrar o núcleo registrável/licenciável do CRM:

- marca e monograma Camilla Bonifácio;
- fotografias;
- textos institucionais;
- identidade visual;
- conteúdo editorial;
- mensagens comerciais específicas;
- dados profissionais;
- contatos e domínio;
- registros e dados de leads da cliente.

## Código candidato a núcleo autoral

Sujeito a revisão de histórico e contratos:

- captura e persistência de leads;
- validação e normalização;
- autenticação administrativa;
- rotas administrativas;
- integração Worker + D1;
- deduplicidade;
- ciclo de vida do lead;
- lógica de atendimento;
- componentes administrativos reutilizáveis;
- abstrações e configurações multi-instância.

## Risco técnico identificado

O Worker atual possui credenciais administrativas representadas diretamente no código por usuário e hash. Antes de transformar o CRM em produto multi-cliente, a autenticação deve ser migrada para secrets/bindings do Cloudflare ou camada de autenticação própria. Esta auditoria não altera a autenticação atual para evitar impacto em produção.

## Próximas ações

1. preservar a branch de separação sem deploy;
2. extrair funções puras para `src/crm-core`;
3. parametrizar regras específicas da Camilla em `src/crm-client`;
4. testar em preview isolado;
5. somente depois substituir imports no Worker ativo;
6. registrar versão de referência e hash após estabilização.
