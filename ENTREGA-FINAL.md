# ENTREGA FINAL — FluxoIA

**Data:** 16/07/2026  
**Projeto:** Site + painel admin + Edge Functions Supabase (self-hosted via Coolify)  
**Agência:** FluxoIA — automação com IA em Irecê-BA e região

---

## 1. URLs de produção

### Site estático (Supabase Storage — bucket `fluxoia-site`)

| Página | URL | Status |
|--------|-----|--------|
| **Site principal** | https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/index.html | ✅ HTTP 200 |
| **Downloads** | https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/downloads.html | ✅ HTTP 200 |
| **Login admin** | https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/admin.html | ✅ HTTP 200 |
| **Painel admin** | https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/painel.html | ✅ HTTP 200 |
| **api-config.js** | https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/api-config.js | ✅ HTTP 200 |

### API (Edge Functions — substituem `/api/*`)

| Endpoint | URL | Métodos | Status |
|----------|-----|---------|--------|
| **Auth** | https://supabase.appsbrasil.store/functions/v1/auth | GET, POST, DELETE | ✅ 200 |
| **Downloads** | https://supabase.appsbrasil.store/functions/v1/downloads | GET, POST, PUT, DELETE | ✅ 200 (GET público) |
| **Contact requests** | https://supabase.appsbrasil.store/functions/v1/contact-requests | GET, POST, PUT, DELETE | ✅ 201 (POST) / 401 sem sessão (GET) |
| **Users (admin)** | https://supabase.appsbrasil.store/functions/v1/users | GET, POST, PUT, DELETE | ✅ 200 com sessão / 401 sem sessão |
| **Hello (sanidade)** | https://supabase.appsbrasil.store/functions/v1/hello | GET | ✅ 200 |

O frontend usa `api-config.js` para apontar automaticamente para `/functions/v1/*`.

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

## 2. Resultados dos testes (16/07/2026 — validação final)

| Teste | Resultado |
|-------|-----------|
| Site estático (todas as páginas) | ✅ HTTP 200 |
| `api-config.js` apontando para `/functions/v1` | ✅ OK |
| Edge Function `auth` (GET) | ✅ HTTP 200, `configured: true` |
| Edge Function `downloads` (GET) | ✅ HTTP 200, 5 registros |
| Edge Function `contact-requests` (GET sem sessão) | ✅ HTTP 401 (correto) |
| Edge Function `users` (GET sem sessão) | ✅ HTTP 401 (correto) |
| Login admin (POST auth) | ✅ HTTP 200, sessão criada |
| `contact-requests` + `users` com sessão | ✅ HTTP 200 |
| Formulário de contato (POST) | ✅ HTTP 201 |
| Edge Functions deployadas no Coolify | ✅ `auth`, `downloads`, `contact-requests`, `users` + `hello` |

**Credenciais admin:** login via tabela `users` (Supabase) ou variáveis `ADMIN_EMAIL` / `ADMIN_PASSWORD` no container `functions`. E-mail: `ivoneifs@gmail.com`.

---

## 3. Deploy realizado

### Site estático
```powershell
npm run build
npm run deploy:supabase:storage
```

### Edge Functions (self-hosted / Coolify)
- Bundle: `supabase/functions-bundle/`
- Volume no servidor: `/data/coolify/services/trnrt2q82d5v3rygega7jisi/volumes/functions/`
- Container: `supabase-edge-functions-trnrt2q82d5v3rygega7jisi`
- Deploy via SSH (sem apagar funções existentes como `hello`)

### Variáveis no container `functions`

| Variável | Descrição | Status |
|----------|-----------|--------|
| `SUPABASE_URL` | URL interna Kong | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role | ✅ |
| `ADMIN_SESSION_SECRET` | Segredo HMAC sessão admin | ✅ |
| `ADMIN_EMAIL` | E-mail admin (fallback) | ✅ |
| `ADMIN_PASSWORD` | Senha admin (fallback) | ✅ |

---

## 4. Comandos úteis

```powershell
npm install
npm run build                              # gera dist/
npm run deploy:supabase:storage            # publica site no Storage
npm run deploy:supabase:functions          # gera bundle + tenta deploy remoto
npm run test:edge-functions                # testa endpoints públicos
node scripts/test-production.js            # teste completo (login + rotas protegidas)
npm run supabase:test                      # testa conexão REST/DB
```

Deploy completo:
```powershell
npm run deploy:supabase
```

---

## 5. Supabase (self-hosted)

**Tabelas:** `downloads` (5), `contact_requests` (1+), `users` (1+)

---

## 6. Checklist final

- [x] Código Edge Functions Deno (auth, downloads, contact-requests, users)
- [x] Frontend atualizado (`api-config.js`, `auth-client.js`)
- [x] Site estático no Supabase Storage
- [x] Bundle copiado para `volumes/functions/` no Coolify
- [x] `ADMIN_SESSION_SECRET` no container functions
- [x] `ADMIN_EMAIL` + `ADMIN_PASSWORD` no container functions
- [x] Login admin validado em produção
- [x] CRUD admin (contact-requests, users) com sessão
- [x] Formulário de contato gravando no Supabase
- [x] Chave SSH pública adicionada ao servidor (`authorized_keys`)
- [x] Documentação e push `fluxoia-deploy`

---

## 7. Pendências / bloqueios

| Item | Status | Ação necessária |
|------|--------|-----------------|
| **Atendente virtual Bia (n8n)** | ⚠️ Bloqueado | Adicionar créditos OpenAI na conta e configurar `OPENAI_API_KEY` no workflow n8n |
| **Domínio próprio fluxoia.com.br** | ⚠️ Pendente | Apontar DNS para o Storage/CDN ou proxy reverso |
| **Vercel** | ❌ Não usado | Stack em produção é Supabase Storage + Edge Functions |
| **Rotação de senhas** | ⚠️ Recomendado | Trocar senhas SSH, Coolify, admin e Supabase compartilhadas em chat |

---

## 8. Segurança

- **Nunca** commitar `.env` (está no `.gitignore`)
- Senhas e chaves foram compartilhadas em conversas de chat — **rotacione**:
  - Senha SSH do servidor (`76.13.163.185`)
  - Senha do painel Coolify
  - `ADMIN_PASSWORD` / senha do usuário admin
  - Chaves Supabase se houver suspeita de exposição
- Chave SSH pública do agente foi adicionada em `/root/.ssh/authorized_keys` (append, sem remover chaves existentes)

---

## 9. Desenvolvimento local

```powershell
npm run dev    # http://localhost:3000 (site + API Express)
```

Credenciais: copie `.env.example` → `.env` (nunca commitar).

---

*Atualizado em 16/07/2026 — deploy completo validado em produção (Supabase self-hosted + Coolify).*
