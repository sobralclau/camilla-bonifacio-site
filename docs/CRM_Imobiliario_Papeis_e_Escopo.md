# Especificação funcional: Mini CRM Camilla Bonifácio
## Perfis
- admin (Cláudio): acesso integral aos dados comerciais, indicadores de marketing, configurações e laboratório demo.
- commercial (Camilla): acesso somente ao workspace commercial, gerenciamento de atendimentos, etapas, visitas, follow-ups, métricas comerciais e leitura de origem de marketing.
- Dois logins individuais e hashes de senha independentes; nenhum usuário demo compartilhado.
- Proteção no servidor: parâmetros mode=demo de usuário commercial são ignorados e sempre resultam em commercial.
## Separação de dados
- crm_deals.workspace = commercial | demo, validado por CHECK e filtrado em TODAS as consultas e mutações.
- Métricas comerciais reais não incluem workspace demo.
- Dados de teste devem ser gerados apenas na área demo, sem contatos reais e sem disparo WhatsApp.
- Dados legados camilla_leads permanecem no D1, sem descarte e sem mistura automática de ambientes.
## Funil imobiliário
Novo → Contatado → Qualificado → Visita agendada → Visitado → Proposta → Negociação → Ganho/Perdido.
- Acompanhar imóvel/referência, bairro, orçamento, valor de venda, comissão estimada, parceria, construtora, responsável, visita, próximos contatos e motivo de perda.
- Histórico de movimentações, agendamentos de visita e follow-ups.
## Marketing e performance
- Origem/canal, source/medium, campanha, conjunto, anúncio, posicionamento, UTM, landing page, CTA.
- Filtros por data, campanha, etapa, bairro, responsável, tipo de interesse, imóvel, origem, status e resultado.
- KPIs: leads únicos, leads qualificados, visitas, propostas, ganhos/perdas, taxas de avanço, receita e comissão estimada, tempo até primeiro atendimento.
- Integração Meta/GA4 precisa ser validada por identificadores reais de evento; não inferir ROAS sem dados de investimento.
## Implementado na branch
- Estrutura de banco com tabelas crm_users, crm_deals, crm_properties, crm_activities, crm_visits.
- Autenticação multiusuário com papéis no banco e sessão assinada; endpoints CRM verificam role e workspace.
- Dashboard inicial com KPIs básicos, filtros por período, campanha, origem, bairro, responsável e etapa.
- Cadastro e alteração de etapa com trilha de atividade.
## Ainda necessário antes da produção
- Provisionamento seguro de dois usuários e segredos, testes de login real, sessão e autorização negativa.
- Migração remota D1 prévia e produção (a API Cloudflare retornou 10000 Authentication error).
- Integração entre camilla_leads e crm_deals com idempotência e importação sem duplicar.
- Telas completas de imóveis, visitas, follow-ups, auditoria, exportação CSV, filtros avançados e indicadores.
- Testes end-to-end desktop/mobile e validação de permissões de todos os endpoints.
- Revisar retenção de dados, privacidade e acesso a dados pessoais (LGPD).
