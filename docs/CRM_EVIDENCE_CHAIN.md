# Cadeia de evidências do desenvolvimento

Data de abertura formal: 2026-10-06

## Objetivo

Preservar uma trilha verificável do desenvolvimento do CRM, reduzindo dependência de declarações isoladas e permitindo associar documentação, código, testes e versões a eventos concretos do repositório.

## Repositório piloto

Repositório: `sobralclau/camilla-bonifacio-site`  
Branch principal de produção: `main`  
Branch de separação do CRM: `chore/crm-core-separation`  
Pull Request de trabalho: `#16`

## Evidências a preservar

- histórico de commits;
- Pull Requests;
- diffs;
- documentação técnica;
- arquivos de configuração;
- testes automatizados;
- resultados de CI;
- releases;
- tags;
- pacote técnico da versão registrada;
- hash e algoritmo utilizado;
- comprovantes e documentos do processo de registro;
- certificado, quando emitido;
- contratos e aditivos relacionados à propriedade intelectual;
- registro das dependências e respectivas licenças.

## Marco de produção anterior à separação

Commit de referência observado em `main` em 2026-10-06:

`e197836e1a0b6f746d4fbbb01f3fa6022fd48c4c`

Descrição: atualização da identificação institucional no rodapé.

Esse commit serve apenas como marco cronológico do estado de produção observado antes da conclusão da separação documental. Não é o commit da futura versão registrável.

## Marco da branch de separação

A branch `chore/crm-core-separation` concentra o trabalho preparatório do CRM Core. O commit definitivo de referência será registrado neste documento somente após os testes operacionais e o congelamento da v1.0.0.

## Política de evidência

1. Não apagar a branch de preparação enquanto o processo estiver em andamento.
2. Não reescrever histórico de commits relacionados à versão de registro.
3. Preferir commits pequenos e descritivos.
4. Registrar alterações relevantes por Pull Request.
5. Não armazenar senhas, tokens ou segredos em documentos de evidência.
6. Manter o pacote técnico congelado fora do fluxo normal de edição após a geração do hash.
7. Registrar data, versão, commit e algoritmo de hash no momento do congelamento.

## Pacote futuro de evidência da v1.0.0

Deverá conter, no mínimo:

- código do CRM Core;
- documentação técnica;
- manifesto da versão;
- lista de dependências e licenças;
- instruções de build e teste;
- testes automatizados;
- esquema lógico de dados aplicável ao core;
- arquivos de configuração sem segredos;
- identificação do commit;
- hash definitivo;
- registro do algoritmo utilizado.

## Observação

Os dados da cliente e o conteúdo de produção não devem ser incluídos no pacote registrável quando não forem necessários para identificar tecnicamente o software.
