# ENTREGA FINAL — FluxoIA

**Data:** 16/07/2026  
**Projeto:** Site + painel admin + API (Vercel serverless + Edge Functions Supabase)  
**Agência:** FluxoIA — automação com IA em Irecê-BA e região

---

## 1. URLs de produção

### Vercel (deploy 16/07/2026 — conta `ivoneis-projects`)

| Página | URL | Status |
|--------|-----|--------|
| **Site principal** | https://151230-two.vercel.app/ | ✅ FluxoIA, UTF-8, acentos OK |
| **Downloads** | https://151230-two.vercel.app/downloads | ✅ |
| **Login admin** | https://151230-two.vercel.app/admin | ✅ |
| **Painel admin** | https://151230-two.vercel.app/painel | ✅ |
| **API downloads** | https://151230-two.vercel.app/api/downloads | ✅ JSON via Supabase |
| **API auth** | https://151230-two.vercel.app/api/auth | ✅ `configured: true` |

| Recurso | URL |
|---------|-----|
| **Projeto Vercel** | https://vercel.com/ivoneis-projects/151230 |
| **Alias de produção** | https://151230-two.vercel.app |

> **Atenção:** `https://151230.vercel.app/` ainda aponta para o site antigo (landing Ivonei) e **pertence a outra conta Vercel**. Nesta conta (`ivoneienergia-2833` / team `ivoneis-projects`) o alias `151230.vercel.app` já está em uso e não pode ser reatribuído. Para unificar o domínio, entre na conta dona do projeto antigo e remova/transfira o alias, ou aponte um domínio customizado.

### Supabase Storage (site estático)

| Página | URL | Status |
|--------|-----|--------|
| **Site principal** | https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/index.html | ✅ |
| **Downloads** | https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/downloads.html | ✅ |
| **Login admin** | https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/admin.html | ✅ |
| **Painel admin** | https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/painel.html | ✅ |

### API Edge Functions (Supabase self-hosted)

| Endpoint | URL |
|----------|-----|
| **Auth** | https://supabase.appsbrasil.store/functions/v1/auth |
| **Downloads** | https://supabase.appsbrasil.store/functions/v1/downloads |
| **Contact requests** | https://supabase.appsbrasil.store/functions/v1/contact-requests |
| **Users** | https://supabase.appsbrasil.store/functions/v1/users |

`api-config.js`: em hosts `*.appsbrasil.store` usa Edge Functions; em Vercel/local usa `/api/*` (same-origin).

### Infraestrutura

| Recurso | URL |
|---------|-----|
| **Supabase Dashboard** | https://supabase.appsbrasil.store/project/default |
| **Coolify** | https://painel.appsbrasil.store/ |
| **n8n** | https://auto.appsbrasil.store/ |
| **GitHub** | https://github.com/ivoneieletrotecnico-collab/151230 |
| **Branch** | `fluxoia-deploy` |

---

## 2. Deploy Vercel (realizado)

```powershell
npm run build
npx vercel --prod --yes
```

Projeto criado/linkado: `ivoneis-projects/151230`  
Env de produção configuradas (sem expor valores): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.

### Deploy Supabase (site + functions)

```powershell
npm run deploy:supabase
```

---

## 3. Checklist

- [x] Código FluxoIA em `fluxoia-deploy` (UTF-8, admin inline, api-config por host)
- [x] Push GitHub `fluxoia-deploy`
- [x] Deploy Vercel production → https://151230-two.vercel.app
- [x] Env vars Vercel (API serverless)
- [x] `/`, `/downloads`, `/admin`, `/api/downloads`, `/api/auth` validados
- [ ] Alias `151230.vercel.app` — bloqueado (outra conta)

---

## 4. O que o usuário precisa fazer (bloqueio do domínio antigo)

1. Entrar na **conta Vercel que possui** `https://151230.vercel.app` (não é `ivoneis-projects`).
2. No projeto antigo: remover o domínio/alias `151230.vercel.app` **ou** deletar o projeto antigo.
3. Na conta `ivoneis-projects`, no projeto `151230`:
   ```powershell
   cd C:\Users\User\fluxoia-151230
   npx vercel alias set <deployment-url> 151230.vercel.app
   ```
   Ou em Project Settings → Domains → Add `151230.vercel.app`.
4. (Opcional) Conectar o GitHub `ivoneieletrotecnico-collab/151230` ao projeto Vercel (precisa write access no repo).

---

## 5. Segurança

- **Nunca** commitar `.env` / `.env.local`
- Rotacionar senhas compartilhadas em chat (SSH, Coolify, admin)

---

## 6. Desenvolvimento local

```powershell
npm run dev    # http://localhost:3000 (site + API Express)
```

---

*Atualizado em 16/07/2026 — Vercel FluxoIA em https://151230-two.vercel.app + Supabase Storage/Edge Functions.*
