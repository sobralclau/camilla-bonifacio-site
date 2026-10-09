# Mini CRM: implantação segura
## Estado
- Worker de prévia: camilla-mini-crm-preview, D1 camilla-bonifacio-preview.
- Produção não deve receber o código até o Cloudflare Access estar configurado e testado.
- Site público e D1 de produção permanecem intocados nesta etapa.
## Cloudflare Zero Trust Access
1. Zero Trust > Access > Applications > Add application > Self-hosted.
2. Proteja o hostname camillabonifacio.com.br, path /admin/* e /admin (se suportado como caminho separado).
3. Política Allow somente e-mails autorizados de Camilla e do administrador; autenticação por e-mail OTP ou IdP.
4. Copie o Application AUD e o team domain (*.cloudflareaccess.com). Configure no Worker de produção como ACCESS_AUD e ACCESS_TEAM_DOMAIN. Não use os valores da prévia.
5. O Worker valida assinatura RSA-SHA256 via JWKS, issuer, expiração e audience. Se faltar configuração, falha fechado (403).
6. Verifique acesso negado sem login, login autorizado e POST /api/leads/attended com cookie CF_Authorization. Nunca use HTTP Basic como fallback.
## D1
1. Exportar backup de produção antes de migrar.
2. Verificar esquema de camilla_leads; executar crm-migration.sql UMA VEZ na D1 de produção.
3. phone_key tem índice UNIQUE. Para duplicatas históricas, só o registro mais antigo recebe phone_key; os demais são preservados.
4. Novas inserções são atômicas e usam ON CONFLICT(phone_key) DO NOTHING, retornando ID existente.
5. O campo phone continua com DDD nacional (11 dígitos); prefixo 55 removido se presente.
## Atendimento
- Abrir WhatsApp NÃO altera status.
- Ação separada Confirmar atendimento exige confirmação, autenticação e gravação bem-sucedida.
- Se o POST falhar, interface mostra erro e mantém botão disponível.
## Testes
- node crm-auth-test.mjs: JWT válido, cookie válido, expirado, audiência errada e adulterado.
- node crm-test.cjs: executa contra Worker local ou prévia com CRM_BASE; usar DB de teste sem dados reais.
- npm run build && npm run check: integridade do site.
## Publicação
1. Validar a aplicação Access e políticas de acesso com contas reais autorizadas.
2. Backup e migração de produção.
3. Configurar ACCESS_AUD e ACCESS_TEAM_DOMAIN em produção.
4. Publicar o Worker de produção somente após homologação da prévia e validar autenticação, deduplicação e atendimento.
5. Testar homepage, formulário público, WhatsApp, admin e rollback.
