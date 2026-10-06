# Decisão de não gerar hash definitivo nesta etapa

Data: 2026-10-06

## Decisão

O hash definitivo destinado ao futuro processo de registro do programa de computador **não será gerado na versão 0.9 PRE-REGISTRO**.

## Motivo técnico

O CRM Core ainda está em fase de:

- testes operacionais;
- integração gradual com Cloudflare Workers e D1;
- validação do funil;
- validação de deduplicidade;
- validação de autenticação;
- revisão de dependências;
- correções de regressão;
- consolidação da futura versão 1.0.0.

Qualquer alteração em arquivo integrante do pacote técnico modifica o resumo criptográfico correspondente. Portanto, gerar agora um hash e tratá-lo como definitivo criaria uma referência para um pacote ainda mutável.

## Regra

O hash definitivo somente poderá ser gerado quando:

1. os testes operacionais forem concluídos;
2. as correções necessárias estiverem incorporadas;
3. a versão 1.0.0 estiver congelada;
4. o commit de referência estiver identificado;
5. o pacote técnico estiver montado;
6. a lista de arquivos estiver fechada;
7. as dependências e licenças estiverem revisadas.

## Preservação

Até esse momento, commits, snapshots, documentação e resultados de CI funcionam como cadeia de evidências do desenvolvimento.

## Estado

Hash definitivo: **ADIADO INTENCIONALMENTE**  
Versão registrável: **AINDA NÃO CONGELADA**  
Versão documental atual: **0.9 PRE-REGISTRO**
