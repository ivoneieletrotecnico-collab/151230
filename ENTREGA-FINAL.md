# ENTREGA FINAL — FluxoIA

**Data:** 16/07/2026  
**Projeto:** Site + painel admin + Edge Functions Supabase  
**Agência:** FluxoIA — automação com IA em Irecê-BA e região

---

## 1. URLs de produção (Supabase Storage + Edge Functions)

### Site estático (Storage — bucket `fluxoia-site`)

| Página | URL |
|--------|-----|
| **Site principal** | https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/index.html |
| **Downloads** | https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/downloads.html |
| **Login admin** | https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/admin.html |
| **Painel admin** | https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/painel.html |

### API (Edge Functions — substituem `/api/*` do Vercel/Express)

| Endpoint | URL | Métodos |
|----------|-----|---------|
| **Auth** | https://supabase.appsbrasil.store/functions/v1/auth | GET, POST, DELETE |
| **Downloads** | https://supabase.appsbrasil.store/functions/v1/downloads | GET, POST, PUT, DELETE |
| **Contact requests** | https://supabase.appsbrasil.store/functions/v1/contact-requests | GET, POST, PUT, DELETE |
| **Users (admin)** | https://supabase.appsbrasil.store/functions/v1/users | GET, POST, PUT, DELETE |

O frontend usa `api-config.js` para apontar automaticamente para essas URLs.

---

## 2. Resultados dos testes (16/07/2026)

| Teste | Resultado |
|-------|-----------|
| Site estático (`index.html`) | **OK** — HTTP 200 |
| `api-config.js` no Storage | **OK** — HTTP 200 |
| Edge Function `hello` (sanidade) | **OK** — HTTP 200 |
| Supabase REST (`downloads`) | **OK** — 5 registros |
| Edge Functions `auth`, `downloads`, `contact-requests`, `users` | **PENDENTE** — HTTP 500 (`could not find an appropriate entrypoint`) |

**Causa:** no Supabase self-hosted, a API de deploy (`POST /api/v1/projects/default/functions/deploy`) retorna **405 Method Not Allowed**. As funções existem no roteamento Kong, mas os arquivos `index.ts` ainda não foram copiados para `volumes/functions/` no servidor.

**Ação necessária no servidor:**

```bash
# Copiar bundle gerado localmente
scp -r supabase/functions-bundle/* user@servidor:/opt/supabase/docker/volumes/functions/

# Reiniciar serviço de functions
ssh user@servidor "cd /opt/supabase/docker && docker compose restart functions --no-deps"
```

Ou defina `SUPABASE_SSH_HOST` no `.env` e execute: `npm run deploy:supabase:functions`

---

## 3. Edge Functions criadas (código local)

```
supabase/functions/
├── _shared/          # auth, data-store, password, api-service, cors, defaults
├── auth/index.ts
├── downloads/index.ts
├── contact-requests/index.ts
└── users/index.ts
```

Bundle pronto para deploy manual: `supabase/functions-bundle/`

**Variáveis obrigatórias no container `functions` (docker-compose):**

| Variável | Descrição |
|----------|-----------|
| `SUPABASE_URL` | `http://kong:8000` (interno) ou URL pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role |
| `ADMIN_SESSION_SECRET` | Segredo HMAC para cookies de sessão |
| `ADMIN_EMAIL` | E-mail admin (fallback) |
| `ADMIN_PASSWORD` | Senha admin (fallback) |

---

## 4. Comandos de deploy

```powershell
npm install
npm run build                              # gera dist/
npm run deploy:supabase:storage            # publica site no Storage
npm run deploy:supabase:functions          # tenta deploy remoto + gera bundle
npm run test:edge-functions                # testa endpoints /functions/v1/*
npm run supabase:test                      # testa conexão REST/DB
```

Deploy completo (site + tentativa de functions):

```powershell
npm run deploy:supabase
```

---

## 5. Supabase (self-hosted)

| Recurso | URL |
|---------|-----|
| Dashboard | https://supabase.appsbrasil.store/project/default |
| REST API | https://supabase.appsbrasil.store/rest/v1/ |
| SQL Editor | https://supabase.appsbrasil.store/project/default/sql/new |

**Tabelas:** `downloads` (5), `contact_requests` (0), `users` (1+)

---

## 6. Repositório

| Recurso | URL |
|---------|-----|
| GitHub | https://github.com/ivoneieletrotecnico-collab/151230 |
| Branch deploy | `fluxoia-deploy` |

---

## 7. Checklist

- [x] Código Edge Functions Deno (auth, downloads, contact-requests, users)
- [x] Frontend atualizado (`api-config.js`, `auth-client.js`)
- [x] Site estático redeployado no Supabase Storage
- [x] Bundle de functions gerado (`supabase/functions-bundle/`)
- [x] Script `deploy-supabase-functions.js`
- [ ] **Copiar bundle para `volumes/functions/` no servidor e reiniciar `functions`**
- [ ] Definir `ADMIN_SESSION_SECRET` no container functions
- [ ] Validar login, downloads, formulário de contato e CRUD admin em produção

---

## 8. Desenvolvimento local

```powershell
npm run dev    # http://localhost:3000 (site + API Express)
```

Credenciais: copie `.env.example` → `.env` (nunca commitar).

---

*Atualizado em 16/07/2026 com Edge Functions Supabase e redeploy do site estático.*
