# Registro contemporâneo de evidências técnicas

Data: 2026-10-06

## Finalidade

Preservar, de forma contemporânea ao desenvolvimento, uma trilha objetiva do estado técnico do CRM antes dos testes operacionais e antes do congelamento da futura versão 1.0.0.

Este registro não substitui contrato, parecer jurídico, hash definitivo ou certificado de registro.

## Repositório

`sobralclau/camilla-bonifacio-site`

## Pull Request de trabalho

PR: `#16`  
Branch: `chore/crm-core-separation`  
Base: `main`  
Estado no momento deste registro: draft

## Marco anterior em produção

Commit da base observada:

`e197836e1a0b6f746d4fbbb01f3fa6022fd48c4c`

Descrição:

`Atualiza identificação institucional no rodapé`

Esse commit serve como marco cronológico do estado da branch `main` antes da consolidação desta etapa do CRM Core.

## Marco técnico desta etapa

Head observado da branch de separação antes da criação deste registro:

`8682bcba7a5735563243a75aad0b00f102a372a7`

A comparação com a base indicava 24 commits à frente da `main`.

## Arquivos técnicos e documentais presentes nesta etapa

### Automação e testes

- `.github/workflows/crm-core-tests.yml`
- `tests/crm-core.test.mjs`
- `package.json`

### Núcleo reutilizável

- `src/crm-core/README.md`
- `src/crm-core/auth.js`
- `src/crm-core/cloudflare.js`
- `src/crm-core/leads.js`
- `src/crm-core/lifecycle.js`
- `src/crm-core/utils.js`

### Configuração da instância Camilla

- `src/crm-client/camilla.config.js`

### Integração em preparação

- `src/worker.js`

### Documentação

- `docs/CRM_AUTHORSHIP_AND_SCOPE.md`
- `docs/CRM_CORE_MAP.md`
- `docs/CRM_DOCUMENTATION_INDEX.md`
- `docs/CRM_EVIDENCE_CHAIN.md`
- `docs/CRM_MASTER_VERSION_0.9_PRE.md`
- `docs/CRM_PRE_REGISTRATION_CHECKLIST.md`
- `docs/CRM_VERSION_MANIFEST.md`
- `docs/THIRD_PARTY_AND_OWNERSHIP_AUDIT.md`

## Validações automatizadas registradas

Para o commit `8682bcba7a5735563243a75aad0b00f102a372a7` foram observadas:

### Workflow Quality

Run ID: `37499014302`  
Resultado: `success`

### Workflow CRM Core Tests

Run ID: `37499014275`  
Resultado: `success`

As validações cobrem build, check do projeto e testes automatizados do núcleo em seu estágio atual.

## Responsabilidade de desenvolvimento documentada

Os documentos desta branch registram Cláudio Sobral como responsável pela coordenação e desenvolvimento do projeto, incluindo especificação funcional, arquitetura, organização, integração, revisão, testes, manutenção e evolução.

Esse registro é documental e deve ser interpretado em conjunto com histórico Git, contratos, Pull Requests, arquivos técnicos e demais evidências disponíveis.

## Limites da evidência

A existência de um commit, branch ou repositório não prova isoladamente titularidade jurídica sobre todos os componentes presentes.

Por isso, a cadeia de evidências deve permanecer acompanhada de:

- contratos;
- auditoria de dependências;
- licenças;
- separação de ativos da cliente;
- identificação de componentes de terceiros;
- pacote técnico da versão final;
- hash definitivo;
- protocolo e certificado, quando aplicável.

## Política de preservação a partir deste marco

1. A branch de trabalho não deve ter seu histórico reescrito.
2. Os commits desta etapa não devem ser apagados.
3. A PR #16 deve ser mantida como registro do processo.
4. Um snapshot separado deve preservar o estado contemporâneo desta etapa.
5. A futura v1.0.0 terá um novo marco, tag ou release correspondente, quando tecnicamente pronta.
6. O hash definitivo não deve ser gerado nesta etapa.
7. O pacote associado ao hash final deverá ser arquivado sem alteração após sua geração.

## Próximo marco documental

O próximo registro relevante deverá ocorrer após a conclusão dos testes operacionais em preview, quando serão documentados:

- resultados dos testes;
- falhas encontradas;
- correções;
- estado do D1 de preview;
- autenticação;
- isolamento de dados;
- commit candidato à v1.0.0.
