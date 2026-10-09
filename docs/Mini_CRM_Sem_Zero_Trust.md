# Mini CRM sem Zero Trust e sem cartão
## Arquitetura
- Login próprio no Cloudflare Worker, banco D1 já existente.
- Senhas PBKDF2-SHA256 com 210000 iterações e salt aleatório, nunca guardar senha em texto puro no repositório.
- Sessão com assinatura HMAC-SHA256, cookie HttpOnly, Secure, SameSite Strict e duração máxima de 8 horas.
- Bloqueio de tentativas repetidas por IP e usuário (5 tentativas/15 minutos), Origin obrigatório para POST.
- Segredos necessários no Worker: CRM_ADMIN_USER, CRM_ADMIN_PASSWORD_HASH, CRM_SESSION_SECRET.
- Cloudflare Access não é necessário; não criar conta Zero Trust nem fornecer cartão.
## Implantação
1. Testar autenticação com node crm-password-test.mjs (somente dados artificiais).
2. Para gerar hash da senha real, executar um utilitário local que solicite a senha sem ecoá-la e chame passwordRecord; não colar senha em mensagens, terminal gravado ou Git.
3. Gravar os 3 valores no Cloudflare Worker com wrangler secret put (sem expor valores nos logs).
4. Testar login na prévia, logout, sessão expirada, tentativas incorretas, proteção de escrita, mobile e status atendido.
5. Fazer backup D1 de produção e executar crm-migration.sql apenas uma vez; a migração preserva leads antigos.
6. Publicar a branch após testes completos e confirmar rota /admin/login no domínio de produção.
## Observações
- Esta versão inicial tem um administrador. Usuários múltiplos, recuperação de senha, revogação imediata de sessão e auditoria de ações requerem ampliação.
- Logout remove cookie no navegador; tokens já copiados permanecem válidos até expiração, salvo troca de CRM_SESSION_SECRET.
- Não executar a migração duas vezes sem verificar PRAGMA table_info(camilla_leads).
