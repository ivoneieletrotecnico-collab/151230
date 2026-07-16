# ENTREGA FINAL — FluxoIA

**Data:** 16/07/2026  
**Projeto:** Site + painel admin + Edge Functions Supabase (self-hosted via Coolify)  
**Agência:** FluxoIA — automação com IA em Irecê-BA e região  
**Stack:** 100% Supabase self-hosted — **sem Vercel**

---

## 1. URLs de produção (Supabase ONLY)

### Site — URLs amigáveis (recomendado)

| Página | URL | Status |
|--------|-----|--------|
| **Site principal** | https://fluxoia.appsbrasil.store/ | ✅ |
| **Downloads** | https://fluxoia.appsbrasil.store/downloads | ✅ |
| **Login admin** | https://fluxoia.appsbrasil.store/admin | ✅ |
| **Painel admin** | https://fluxoia.appsbrasil.store/painel | ✅ |

> Proxy Traefik no Coolify encaminha `fluxoia.appsbrasil.store` → bucket `fluxoia-site` no Supabase Storage (via Kong).

### Site — URLs diretas (Storage)

| Página | URL |
|--------|-----|
| **Site principal** | https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/index.html |
| **Downloads** | https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/downloads.html |
| **Login admin** | https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/admin.html |
| **Painel admin** | https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/painel.html |
| **api-config.js** | https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/api-config.js |

Todas as páginas HTML são servidas com `Content-Type: text/html; charset=UTF-8`.

### API (Edge Functions)

| Endpoint | URL | Métodos |
|----------|-----|---------|
| **Auth** | https://supabase.appsbrasil.store/functions/v1/auth | GET, POST, DELETE |
| **Downloads** | https://supabase.appsbrasil.store/functions/v1/downloads | GET, POST, PUT, DELETE |
| **Contact requests** | https://supabase.appsbrasil.store/functions/v1/contact-requests | GET, POST, PUT, DELETE |
| **Users (admin)** | https://supabase.appsbrasil.store/functions/v1/users | GET, POST, PUT, DELETE |
| **Hello (sanidade)** | https://supabase.appsbrasil.store/functions/v1/hello | GET |

O frontend usa `api-config.js` para apontar automaticamente para `/functions/v1/*` em hosts `*.appsbrasil.store`.

### Infraestrutura

| Recurso | URL |
|---------|-----|
| **Supabase Dashboard** | https://supabase.appsbrasil.store/project/default |
| **Coolify (painel servidor)** | https://painel.appsbrasil.store/ |
| **n8n (automações)** | https://auto.appsbrasil.store/ |
| **REST API** | https://supabase.appsbrasil.store/rest/v1/ |

### Repositório

| Recurso | URL |
|---------|-----|
| **GitHub** | https://github.com/ivoneieletrotecnico-collab/151230 |
| **Branch deploy** | `fluxoia-deploy` |

---

## 2. Deploy automático (um comando)

```powershell
npm install
npm run deploy:supabase
```

O comando `deploy:supabase` executa automaticamente:

1. `build` — gera `dist/` (HTML, CSS, JS, aliases admin/painel)
2. `deploy:supabase:storage` — publica no bucket `fluxoia-site`
3. `deploy:supabase:functions` — gera bundle + tenta API de deploy
4. `scripts/deploy-functions-ssh.py` — envia bundle via SSH e reinicia container
5. `scripts/setup-fluxoia-proxy.py` — configura URLs amigáveis + patch HTML Content-Type
6. Verificação de páginas, API e Edge Functions

### Variáveis necessárias (`.env`)

| Variável | Descrição |
|----------|-----------|
| `SUPABASE_URL` | `https://supabase.appsbrasil.store` |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role |
| `SUPABASE_KONG_USER` / `SUPABASE_KONG_PASSWORD` | Credenciais Studio (fallback para obter keys) |
| `SSH_PASS` | Senha SSH do servidor Coolify (deploy functions + proxy) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` | Auth admin |

Copie `.env.example` → `.env` (nunca commitar).

### Comandos individuais

```powershell
npm run build
npm run deploy:supabase:storage
npm run deploy:supabase:functions
npm run deploy:supabase:verify
node scripts/test-production.js
```

---

## 3. Resultados dos testes

| Teste | Resultado |
|-------|-----------|
| Site estático (HTML UTF-8, não plain text) | ✅ |
| URLs amigáveis fluxoia.appsbrasil.store | ✅ |
| `api-config.js` → `/functions/v1` | ✅ |
| Edge Functions (auth, downloads, contact-requests, users) | ✅ |
| Login admin + CRUD com sessão | ✅ |
| Formulário de contato (POST) | ✅ |

**Credenciais admin:** tabela `users` (Supabase) ou variáveis `ADMIN_EMAIL` / `ADMIN_PASSWORD` no container `functions`.

---

## 4. Infraestrutura self-hosted

- **Servidor:** Coolify em `76.13.163.185`
- **Bucket:** `fluxoia-site` (Storage público)
- **Edge Functions:** volume `/data/coolify/services/trnrt2q82d5v3rygega7jisi/volumes/functions/`
- **Container:** `supabase-edge-functions-trnrt2q82d5v3rygega7jisi`
- **Patch HTML:** `/root/fluxoia-fixes/allow-storage-html.sh` (Content-Type correto no Storage)

### Variáveis no container `functions`

| Variável | Status |
|----------|--------|
| `SUPABASE_URL` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ |
| `ADMIN_SESSION_SECRET` | ✅ |
| `ADMIN_EMAIL` | ✅ |
| `ADMIN_PASSWORD` | ✅ |

---

## 5. Supabase MCP

Nenhum servidor MCP Supabase está habilitado neste workspace. Ferramentas disponíveis: `cursor-app-control`, `cursor-ide-browser`. Verificação e deploy usam scripts Node/Python + SSH.

---

## 6. Checklist final

- [x] Edge Functions Deno (auth, downloads, contact-requests, users)
- [x] Frontend com `api-config.js` + scripts inline no admin (UTF-8)
- [x] Site no Supabase Storage
- [x] URLs amigáveis `fluxoia.appsbrasil.store`
- [x] Deploy automático `npm run deploy:supabase`
- [x] Login admin validado
- [x] CRUD admin + formulário de contato
- [x] **Vercel não utilizado**

---

## 7. Pendências

| Item | Status | Ação |
|------|--------|------|
| **Atendente Bia (n8n)** | ⚠️ | Créditos OpenAI + `OPENAI_API_KEY` no workflow |
| **Domínio fluxoia.com.br** | ⚠️ | Apontar DNS para o servidor (proxy Coolify) |
| **Rotação de senhas** | ⚠️ | Trocar senhas compartilhadas em chat |

---

## 8. Segurança

- **Nunca** commitar `.env`
- Rotacionar senhas SSH, Coolify, admin e chaves Supabase
- Chave SSH pública adicionada em `authorized_keys` (append only)

---

## 9. Desenvolvimento local

```powershell
npm run dev    # http://localhost:3000 (site + API Express)
```

---

*Atualizado em 16/07/2026 — stack 100% Supabase self-hosted (Coolify). Sem Vercel.*
