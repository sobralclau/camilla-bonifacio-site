# Autoria, titularidade pretendida e limites de escopo

Data de consolidação documental: 2026-10-06

## Finalidade

Este documento registra, para fins técnicos, contratuais e de futura preparação de registro de software, a separação entre:

1. o núcleo reutilizável do CRM;
2. a implementação específica da cliente Camilla Bonifácio;
3. infraestrutura e dependências de terceiros;
4. ativos que não integram a reivindicação de titularidade do núcleo.

Este documento não substitui contrato, parecer jurídico ou certificado de registro.

## Identificação interna do software

Nome interno provisório: **CRM Core Cláudio Sobral**

Estado: pré-registro, versão de trabalho anterior à v1.0.0.

A designação acima é apenas identificador técnico interno. Não constitui, por si só, marca registrada.

## Responsabilidade de desenvolvimento

O projeto é coordenado e desenvolvido sob responsabilidade de Cláudio Sobral, incluindo especificação funcional, definição de fluxos, arquitetura de integração, seleção e organização de componentes, configuração, testes, revisão, manutenção e evolução do sistema.

O histórico Git, Pull Requests, documentação, testes e versões do repositório devem ser preservados como evidência cronológica do desenvolvimento.

## Uso de ferramentas de apoio

O desenvolvimento pode utilizar ferramentas de assistência à programação, automação e geração de código. A documentação de titularidade deve se apoiar nos elementos humanos verificáveis do projeto, incluindo especificação, decisões de arquitetura, seleção, integração, revisão, testes, adaptação e manutenção.

Não se reivindica, por este documento, titularidade sobre componentes de terceiros, bibliotecas, serviços, modelos, fontes, marcas ou outros ativos sujeitos a licenças ou direitos próprios.

## Núcleo reutilizável pretendido

O núcleo a ser isolado e posteriormente congelado para registro poderá incluir, desde que tecnicamente consolidado e auditado:

- autenticação e autorização administrativa;
- normalização e validação de leads;
- persistência e consulta de dados;
- deduplicidade;
- ciclo de vida do lead;
- funil e estados comerciais;
- filtros e consultas administrativas;
- componentes de dashboard;
- exportação de dados;
- regras genéricas de ganho e perda;
- histórico e acompanhamento;
- abstrações de integração com Cloudflare Workers e D1;
- configuração multi-instância;
- componentes reutilizáveis de atendimento e integrações;
- testes automatizados e documentação técnica associada.

## Implementação Camilla Bonifácio

A implementação da Camilla é uma instância do sistema e deve permanecer separada do núcleo genérico.

São específicos da cliente:

- nome e marca Camilla Bonifácio;
- monograma, identidade visual, paleta e tipografia;
- fotografias e demais ativos visuais;
- textos institucionais e conteúdo editorial;
- dados profissionais;
- domínio e configurações próprias de publicação;
- mensagens comerciais específicas;
- dados pessoais e registros de leads;
- número de WhatsApp;
- regras e nomenclaturas exclusivas da operação imobiliária;
- banco D1 e identificadores próprios da instância;
- eventuais conteúdos ou materiais fornecidos pela cliente.

## Infraestrutura de terceiros

O sistema utiliza ou pode utilizar infraestrutura e ferramentas de terceiros, incluindo Cloudflare Workers, Cloudflare D1, GitHub, Node.js, Vite e bibliotecas licenciadas.

Esses serviços e componentes não são incorporados à reivindicação de titularidade do CRM Core. Apenas o código, a configuração, a integração e as implementações próprias desenvolvidas sobre essa infraestrutura poderão integrar o pacote técnico, conforme auditoria.

## Regra para futuras instâncias

Novas implementações deverão consumir o mesmo núcleo sempre que tecnicamente possível. Marcas, bancos, dados, domínios, credenciais, regras setoriais e conteúdos de cada cliente devem permanecer isolados.

## Condição para registro

Nenhuma versão será tratada como versão definitiva de registro até que:

- o núcleo esteja tecnicamente separado;
- os testes operacionais tenham sido aprovados;
- as dependências estejam auditadas;
- a versão esteja associada a um commit específico;
- o pacote técnico esteja preservado;
- o hash definitivo seja gerado sobre esse pacote.
