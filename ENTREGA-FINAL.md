# FluxoIA — Entrega Final

Atualizado em: 16/07/2026

## URLs de produção (Vercel)

| Serviço | URL | Status verificado |
|---------|-----|-------------------|
| Site principal | https://151230.vercel.app/ | HTTP 200 |
| Downloads (rota limpa) | https://151230.vercel.app/downloads | Aguardando redeploy completo |
| Downloads (arquivo) | https://151230.vercel.app/downloads.html | HTTP 200 |
| Admin login | https://151230.vercel.app/admin-login.html | HTTP 200 |
| Admin (rota limpa) | https://151230.vercel.app/admin | Aguardando redeploy completo |
| API downloads | https://151230.vercel.app/api/downloads | Aguardando env + redeploy |

> Deploy alternativo parcial: https://fluxo-ia.vercel.app/ (apenas `/` e `/admin.html`).

## Repositório

- **GitHub:** https://github.com/ivoneieletrotecnico-collab/151230
- **Branch de deploy:** `fluxoia-deploy`
- **Último commit:** FluxoIA admin + Supabase + auth

## Supabase

- **URL:** https://supabase.appsbrasil.store
- **Tabelas:** `downloads`, `contact_requests`, `users`

## Vercel (conta)

- **Team:** https://vercel.com/ivoneis-projects

## Automação nesta entrega

- Clone/pull da branch `fluxoia-deploy` e `npm run build` (dist/ OK)
- Git push verificado (remoto sincronizado)
- Sondagem de URLs de produção
- Documentação consolidada neste arquivo

## Variáveis obrigatórias no Vercel (Production)

| Variável | Descrição |
|----------|-----------|
| `SUPABASE_URL` | URL do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role |
| `ADMIN_EMAIL` | E-mail do administrador |
| `ADMIN_PASSWORD` | Senha do painel |
| `ADMIN_SESSION_SECRET` | Segredo de sessão |

## Comandos de deploy (quando `VERCEL_TOKEN` estiver disponível)

```powershell
cd "<pasta-do-projeto>"
npx vercel --prod --yes --token $env:VERCEL_TOKEN
```

Após configurar env vars via CLI, redeploy:

```powershell
npx vercel --prod --yes --token $env:VERCEL_TOKEN
```

