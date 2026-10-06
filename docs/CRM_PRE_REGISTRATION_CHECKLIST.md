# Checklist pré-registro do CRM Core

Status geral: **em preparação**

## A. Escopo e titularidade

- [x] CRM-base separado conceitualmente da instância Camilla
- [x] ativos da cliente identificados como fora do core
- [x] infraestrutura Cloudflare identificada como terceiro
- [x] dependências principais identificadas
- [x] responsabilidade de desenvolvimento documentada
- [x] uso de ferramentas de apoio documentado sem ampliar indevidamente a reivindicação de titularidade
- [ ] contratos e cláusulas de propriedade intelectual revisados contra a versão final do software

## B. Arquitetura

- [x] diretório `src/crm-core` criado
- [x] configuração específica em `src/crm-client`
- [x] abstrações iniciais para Cloudflare/D1
- [x] validação e ciclo de vida separados em módulos
- [ ] autenticação migrada para secret/binding apropriado
- [ ] core conectado integralmente ao Worker em ambiente de preview
- [ ] banco de preview validado sem tocar no D1 de produção

## C. Testes

- [x] testes automatizados do core
- [x] build automatizado
- [x] check automatizado
- [x] CI em Pull Request
- [ ] teste operacional de criação de lead no preview
- [ ] teste de duplicidade
- [ ] teste de mudança de status
- [ ] teste de ganho
- [ ] teste de perda
- [ ] teste de filtros
- [ ] teste de exportação
- [ ] teste de WhatsApp
- [ ] teste responsivo do painel
- [ ] teste de regressão do site
- [ ] teste de isolamento de dados

## D. Dependências e licenças

- [x] Vite identificado
- [x] Node.js identificado
- [x] Cloudflare Workers/D1 identificados
- [x] fontes identificadas
- [ ] inventário final de todas as dependências do pacote registrável
- [ ] conferência final das licenças
- [ ] remoção de qualquer componente sem origem/licença suficientemente documentada

## E. Congelamento da versão

- [ ] definir v1.0.0
- [ ] associar v1.0.0 a commit específico
- [ ] criar tag/release
- [ ] gerar pacote técnico
- [ ] preservar pacote fora do fluxo normal de edição
- [ ] gerar hash
- [ ] registrar algoritmo e data
- [ ] verificar que o pacote corresponde exatamente ao hash

## F. Protocolo

- [ ] confirmar titular e autor(es) que constarão no pedido
- [ ] reunir dados cadastrais exigidos
- [ ] providenciar certificado digital aplicável
- [ ] emitir e pagar a retribuição correspondente
- [ ] preencher pedido de registro
- [ ] anexar/declarar informações exigidas
- [ ] arquivar comprovantes do protocolo
- [ ] arquivar certificado quando emitido

## Regra

O hash definitivo não deve ser gerado enquanto houver alteração funcional prevista para a versão 1.0.0.


## Marco 2026-10-06

- [x] decisão formal de não gerar o hash definitivo na v0.9 PRE-REGISTRO
- [x] rotas operacionais de preview preparadas
- [x] smoke tests automatizados preparados
- [x] configuração de preview com D1 isolado preparada no repositório
- [ ] executar smoke tests contra URL pública/privada do Preview Cloudflare
- [ ] validar autenticação positiva no ambiente de preview
- [ ] validar painel/responsividade após o Preview ficar acessível

Observação: o hash definitivo permanece adiado até o congelamento da v1.0.0.
