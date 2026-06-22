# Ivonei Ferreira Eletrotecnico

Landing page estatica para divulgacao de servicos eletricos.

## Repositorio atual

`https://github.com/ivoneieletrotecnico-collab/151230`

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

Para persistir dados em producao, conecte uma integracao Redis no Vercel que forneca
`UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`.
