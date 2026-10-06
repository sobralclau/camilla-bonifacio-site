# Índice documental do CRM Core

Data: 2026-10-06  
Estado: preparação para testes operacionais e futura versão 1.0.0.

## Documentos principais

1. `CRM_CORE_MAP.md`  
   Define a fronteira entre núcleo reutilizável e customizações da Camilla.

2. `CRM_AUTHORSHIP_AND_SCOPE.md`  
   Registra responsabilidade de desenvolvimento, escopo pretendido e exclusões de titularidade.

3. `THIRD_PARTY_AND_OWNERSHIP_AUDIT.md`  
   Identifica infraestrutura, dependências, ativos de terceiros e riscos técnicos.

4. `CRM_VERSION_MANIFEST.md`  
   Identifica a versão documental atual `0.9.0-pre` e os critérios para congelamento da v1.0.0.

5. `CRM_EVIDENCE_CHAIN.md`  
   Define a cadeia de evidências, marcos de commit e política de preservação.

6. `CRM_PRE_REGISTRATION_CHECKLIST.md`  
   Controla pendências técnicas, operacionais e documentais antes do registro.

## Estado da separação documental

A separação documental do CRM Core está considerada **concluída para início dos testes operacionais**, com as seguintes ressalvas:

- a v1.0.0 ainda não foi congelada;
- o hash definitivo ainda não deve ser gerado;
- a autenticação ainda requer migração para secrets/bindings;
- o core ainda precisa ser validado em preview com D1 isolado;
- dependências e licenças terão revisão final antes do congelamento.

## Próximo marco

Executar testes operacionais na implementação Camilla Bonifácio em ambiente de preview, sem alterar o banco D1 de produção e sem promover a branch para `main` antes da validação.
