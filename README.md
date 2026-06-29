# Ivonei Ferreira Eletrotecnico

Landing page estatica para divulgacao de servicos eletricos.

## Repositorio atual

`https://github.com/ivoneieletrotecnico-collab/151230`

## URL publica

`https://eletrotecnico.vercel.app/`

## Executar localmente

1. Instale as dependencias:
   `npm install`
2. Inicie o servidor local:
   `npm run dev`

## Build

Gera a pasta `dist/` com `index.html` e os ativos estaticos:

`npm run build`

## Previa do build

Serve o conteudo gerado em `dist/`:

`npm run preview`

## Deploy no Vercel

O projeto esta preparado para deploy automatico no Vercel com:

- `Build Command`: `npm run build`
- `Output Directory`: `dist`
- `vercel.json` com rotas para `/admin`, `/painel` e `/downloads`
- funcoes em `/api` para downloads e solicitacoes

Para persistir dados em producao, voce pode usar uma das opcoes abaixo:

- Supabase com `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`
- Vercel KV com `KV_REST_API_URL` e `KV_REST_API_TOKEN`
- Upstash Redis com `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`

## Supabase

Se quiser usar o projeto Supabase, crie as tabelas abaixo no SQL Editor:

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

Depois configure no ambiente do deploy:

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
SUPABASE_DOWNLOADS_TABLE=downloads
SUPABASE_CONTACT_REQUESTS_TABLE=contact_requests
```

O backend usa essas tabelas para salvar:

- `downloads`
- `contact-requests`

Use `SUPABASE_SERVICE_ROLE_KEY` apenas no backend/API. Nao exponha essa chave no frontend.

## Migrar dados locais para o Supabase

Com um arquivo `.env` configurado, execute:

```bash
npm run supabase:migrate
```

O script le:

- `downloads.store.json`
- `contact-requests.store.json`

Se esses arquivos nao existirem, ele usa os defaults do projeto.
