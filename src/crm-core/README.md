# CRM Core

Núcleo técnico reutilizável em preparação para as implementações MinhaKasa e Camilla Bonifácio.

## Estado

Esta pasta é um scaffold de separação arquitetural. Os módulos ainda não estão conectados aos Workers de produção.

## Princípios

1. O núcleo não contém marcas, fotografias, textos ou dados exclusivos de clientes.
2. Banco D1, domínio, WhatsApp, identidade visual e regras setoriais permanecem configurados por instância.
3. Segredos não devem ser versionados no código.
4. Cada cliente mantém banco D1 isolado.
5. O mesmo núcleo poderá atender múltiplas instâncias Cloudflare Workers.
6. Alterações somente serão ligadas aos Workers após testes de regressão em branch/preview.


## Identificação de versão

Versão documental atual: `0.9.0-pre`.

A futura `1.0.0` somente será definida após testes operacionais, revisão final de dependências e congelamento de um commit de referência.

## Documentação relacionada

Consulte `docs/CRM_DOCUMENTATION_INDEX.md` para o conjunto de documentos de preparação para registro.
