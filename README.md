# Nexus Inteligência Artificial — Irecê e Região

Landing page estática com deploy no Vercel e backend opcional via Supabase.

## Links

- **GitHub:** https://github.com/ivoneieletrotecnico-collab/151230
- **Supabase Dashboard:** https://supabase.appsbrasil.store/project/default
- **Supabase SQL Editor:** https://supabase.appsbrasil.store/project/default/sql/new
- **Supabase REST API:** https://supabase.appsbrasil.store/rest/v1/

## Estrutura

```
index.html          # Landing page Nexus IA
css/ js/ images/    # Assets estáticos
api/                # Serverless functions (Vercel)
lib/                # Lógica de API e Supabase
dist/               # Build de produção (gerado)
```

## Desenvolvimento local

```bash
npm install
npm run dev
```

Abre em http://localhost:3000

## Build

```bash
npm run build
npm run preview
```

## Supabase

Siga o guia: [CONFIGURAR-SUPABASE-APPSBRASIL.md](./CONFIGURAR-SUPABASE-APPSBRASIL.md)

Resumo:

1. Faça login em https://supabase.appsbrasil.store/project/default
2. Execute `supabase-schema.sql` no [SQL Editor](https://supabase.appsbrasil.store/project/default/sql/new)
3. Copie a `service_role` key em **Settings → API**
4. Preencha `SUPABASE_SERVICE_ROLE_KEY` no `.env`
5. Rode `npm run supabase:test` e depois `npm run supabase:migrate`

## Deploy no Vercel

1. Conecte o repositório GitHub no Vercel
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Adicione variáveis `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`

## Publicar no GitHub

```bash
git init
git remote add origin https://github.com/ivoneieletrotecnico-collab/151230.git
git add .
git commit -m "Nexus IA: landing page com deploy e Supabase"
git branch -M main
git push -u origin main
```

> O push exige autenticação GitHub (`gh auth login` ou token).

## WhatsApp

Número configurado: `+55 74 98825-9925` (Irecê/BA).

Para alterar, busque `5574988259925` em `index.html` e `downloads.defaults.js`.

## Pendências manuais

- [ ] Login no [Supabase Dashboard](https://supabase.appsbrasil.store/project/default)
- [ ] Executar SQL schema no [SQL Editor](https://supabase.appsbrasil.store/project/default/sql/new)
- [ ] Obter `SUPABASE_SERVICE_ROLE_KEY` em Settings → API
- [ ] Preencher `.env` e rodar `npm run supabase:test`
- [ ] Configurar variáveis no Vercel
- [ ] Fazer `git push` (gh não autenticado nesta máquina)
- [ ] Substituir imagens placeholder por fotos reais da Nexus
