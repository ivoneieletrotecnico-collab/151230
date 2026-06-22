# Guia de Deploy - Vercel + GitHub

## Resumo

Este projeto publica no Vercel a partir do GitHub:

- Repositorio: `https://github.com/ivoneieletrotecnico-collab/151230`
- Site: `https://eletrotecnico.vercel.app/`
- Painel: `https://eletrotecnico.vercel.app/admin`
- Downloads: `https://eletrotecnico.vercel.app/downloads`

## Configuracao atual

O projeto ja esta preparado para o Vercel com:

- `npm run build`
- saida em `dist`
- `vercel.json` com rotas limpas para `/admin`, `/painel` e `/downloads`
- funcoes em `/api`

## Como publicar

1. Faça as alteracoes no projeto.
2. Rode os comandos:

```bash
git add .
git commit -m "Atualizacao do site"
git push origin master
```

3. O Vercel detecta o push e publica automaticamente.

## Importar no Vercel

Se precisar reconectar o projeto:

1. Acesse `https://vercel.com/new`
2. Escolha GitHub
3. Importe `ivoneieletrotecnico-collab/151230`
4. Confirme:
   - Framework Preset: `Other`
   - Build Command: `npm run build`
   - Output Directory: `dist`

## Pos-deploy

Verifique:

- `https://eletrotecnico.vercel.app/`
- `https://eletrotecnico.vercel.app/admin`
- `https://eletrotecnico.vercel.app/downloads`

## Variaveis de ambiente

Se usar persistencia em producao, configure no Vercel:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
