# Configurar Supabase — appsbrasil.store

Guia passo a passo para conectar o projeto **Nexus Inteligência Artificial** ao Supabase self-hosted em:

| Recurso | URL |
|---|---|
| **Dashboard (Studio)** | https://supabase.appsbrasil.store/project/default |
| **API base** | `https://supabase.appsbrasil.store` |
| **REST API** | https://supabase.appsbrasil.store/rest/v1/ |
| **SQL Editor** | https://supabase.appsbrasil.store/project/default/sql/new |

> O painel exige login. Não é possível executar o SQL ou copiar chaves automaticamente — siga os passos abaixo no navegador.

---

## Passo 1 — Acessar o painel (login)

1. Abra **https://supabase.appsbrasil.store/project/default**
2. Se não estiver logado, você verá a tela de **Sign in** do Supabase Studio
3. Informe e-mail e senha do administrador da instância self-hosted
4. Após o login, você deve ver o projeto **default** com menu lateral esquerdo

**O que você verá no dashboard:**
- Barra lateral com ícones: Home, Table Editor, SQL Editor, Database, Authentication, Storage, **Settings** (engrenagem)
- No topo: nome do projeto (`default`) e ambiente

---

## Passo 2 — Executar o schema SQL

### Abrir o SQL Editor

1. No menu lateral, clique em **SQL Editor** (ícone de terminal/código)
2. Clique em **+ New query** (ou acesse direto: https://supabase.appsbrasil.store/project/default/sql/new)
3. Uma área de texto grande aparece no centro — é aqui que você cola o SQL

### SQL exato para colar

Copie **todo** o conteúdo do arquivo `supabase-schema.sql` na raiz do projeto e cole no editor:

```sql
create table if not exists public.downloads (
  id bigint primary key,
  name text not null,
  description text not null default '',
  type text not null default 'pdf',
  size text not null default 'Varia',
  url text not null,
  downloads integer not null default 0,
  date date not null default current_date,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_requests (
  id bigint primary key,
  name text not null,
  phone text not null,
  email text not null,
  service text not null,
  message text not null,
  status text not null default 'new',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### Executar

1. Clique no botão **Run** (ou `Ctrl+Enter`)
2. Aguarde a mensagem de sucesso na parte inferior
3. Confirme em **Table Editor** → schemas `public` → tabelas `downloads` e `contact_requests`

**Se der erro "relation already exists":** as tabelas já foram criadas — pode seguir para o próximo passo.

---

## Passo 3 — Obter as chaves da API

1. No menu lateral, clique em **Settings** (engrenagem, geralmente no final)
2. Clique em **API**
3. Na seção **Project URL**, copie a URL — deve ser:
   ```
   https://supabase.appsbrasil.store
   ```
4. Na seção **Project API keys**, localize:
   - **anon** `public` — chave pública (não use no backend deste projeto)
   - **service_role** `secret` — **esta é a que você precisa**

5. Clique em **Reveal** ou no ícone de olho ao lado de **service_role**
6. Copie a chave completa (começa com `eyJ...`)

> **Importante:** a `service_role` key ignora Row Level Security e tem acesso total. Use **somente** no backend (`.env` local e variáveis do Vercel). **Nunca** coloque no `index.html` ou em código frontend.

**O que você verá em Settings → API:**
- Campo **URL** com `https://supabase.appsbrasil.store`
- Duas chaves listadas: `anon` (public) e `service_role` (secret, mascarada até revelar)

---

## Passo 4 — Configurar o `.env` local

O arquivo `.env` já foi criado a partir de `.env.example`. Edite-o e preencha a chave:

```env
SUPABASE_URL=https://supabase.appsbrasil.store
SUPABASE_SERVICE_ROLE_KEY=cole_sua_chave_service_role_aqui
SUPABASE_DOWNLOADS_TABLE=downloads
SUPABASE_CONTACT_REQUESTS_TABLE=contact_requests
```

Substitua `cole_sua_chave_service_role_aqui` pela chave copiada no Passo 3.

---

## Passo 5 — Testar a conexão

### Verificar se a API está no ar (sem chave)

```bash
curl.exe -sI https://supabase.appsbrasil.store/rest/v1/
```

Resposta esperada: **`HTTP/1.1 401 Unauthorized`** — confirma que o Kong/PostgREST está respondendo.

### Testar com suas chaves

```bash
npm install
npm run supabase:test
```

Saída esperada quando tudo estiver correto:

```
OK: Supabase API acessivel.
URL: https://supabase.appsbrasil.store
Tabela downloads: 0 registro(s) (ou mais apos migrate)
Tabela contact_requests: 0 registro(s)
```

### Sincronizar dados iniciais

```bash
npm run supabase:migrate
```

Saída esperada:

```
Supabase sincronizado com sucesso.
Downloads: 2
Solicitacoes: 0
```

---

## Passo 6 — Configurar no Vercel (produção)

No dashboard do Vercel → **Settings** → **Environment Variables**, adicione:

| Variável | Valor |
|---|---|
| `SUPABASE_URL` | `https://supabase.appsbrasil.store` |
| `SUPABASE_SERVICE_ROLE_KEY` | sua chave `service_role` (do Passo 3) |
| `SUPABASE_DOWNLOADS_TABLE` | `downloads` |
| `SUPABASE_CONTACT_REQUESTS_TABLE` | `contact_requests` |

Opcional (painel admin futuro):

| Variável | Valor |
|---|---|
| `ADMIN_EMAIL` | seu e-mail |
| `ADMIN_PASSWORD` | sua senha |
| `ADMIN_SESSION_SECRET` | string aleatória longa |

---

## Passo 7 — Endpoints da API (após deploy)

Com deploy no Vercel, as rotas ficam disponíveis em:

- `POST /api/contact-requests` — salvar solicitação de contato (público)
- `GET /api/downloads` — listar materiais para download
- `POST /api/downloads` — incrementar contador de download

Persistência: Supabase → tabelas `downloads` e `contact_requests`.

---

## Verificação manual da REST API (com chave)

```bash
curl.exe "https://supabase.appsbrasil.store/rest/v1/downloads?select=*" ^
  -H "apikey: SUA_SERVICE_ROLE_KEY" ^
  -H "Authorization: Bearer SUA_SERVICE_ROLE_KEY"
```

Substitua `SUA_SERVICE_ROLE_KEY` pela chave real. Deve retornar JSON (array vazio `[]` ou registros).

---

## Problemas comuns

| Problema | Solução |
|---|---|
| Tela de login no dashboard | Faça login com credenciais do administrador da instância |
| 401 na API sem chave | **Normal** — adicione headers `apikey` e `Authorization` |
| 401 na API com chave | Verifique se copiou a `service_role` completa, sem espaços |
| Tabela não existe | Execute o SQL do Passo 2 no SQL Editor |
| `supabase:test` falha | Confirme `.env` com URL e `SUPABASE_SERVICE_ROLE_KEY` preenchidos |
| `supabase:migrate` aborta | Mesmo que acima — variáveis obrigatórias ausentes |
| Vercel sem persistência | Adicione as 4 variáveis Supabase no Vercel (Passo 6) |
| Chave exposta no Git | `.env` está no `.gitignore` — nunca commite chaves reais |

---

## Checklist rápido

- [ ] Login em https://supabase.appsbrasil.store/project/default
- [ ] SQL executado no SQL Editor (tabelas `downloads` e `contact_requests`)
- [ ] `service_role` key copiada em Settings → API
- [ ] `.env` preenchido localmente
- [ ] `npm run supabase:test` passou
- [ ] `npm run supabase:migrate` sincronizou dados
- [ ] Variáveis configuradas no Vercel
