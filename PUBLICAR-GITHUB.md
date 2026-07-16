# Publicar no GitHub

Repositorio: https://github.com/ivoneieletrotecnico-collab/151230

> **Status atual:** ver `DEPLOY-STATUS.md` para o panorama completo.
> **Guia completo:** `CONFIGURAR-GITHUB.md` (PR, Vercel, gh auth) · **MCP no Cursor:** `CONFIGURAR-MCP-GITHUB.md`

## Estado atual (15/07/2026)

- Commit local criado: `Nexus IA: deploy prep com Vercel, Supabase e landing page rebrandada`
- Branch publicada: **`nexus-ia-static-deploy`** (push OK)
- Branch `main` remota ja existia com projeto React/Vite — push direto foi rejeitado (sem force push)
- PR sugerida: https://github.com/ivoneieletrotecnico-collab/151230/pull/new/nexus-ia-static-deploy

## Pre-requisito (Windows)

Se o Git reclamar de "dubious ownership" no drive G:, execute uma vez:

```powershell
git config --global --add safe.directory "G:/Videos e matriais/Arsenal/Projeto page"
```

## Comandos (novo push / atualizacao)

```powershell
cd "g:\Videos e matriais\Arsenal\Projeto page"

git add .
git commit -m "Nexus IA: atualizacao deploy"
git push origin main:nexus-ia-static-deploy
```

Para publicar na `main` (somente apos decidir merge com a versao React remota):

```powershell
git pull origin main --allow-unrelated-histories
# resolver conflitos manualmente
git push -u origin main
```

## Autenticacao

O `gh` CLI nao esta autenticado nesta maquina. Opcoes:

1. `gh auth login`
2. Token pessoal do GitHub como senha no push HTTPS
3. SSH: `git@github.com:ivoneieletrotecnico-collab/151230.git`

## Apos o push

1. Preencha `SUPABASE_SERVICE_ROLE_KEY` no `.env` e rode `npm run supabase:test` + `npm run supabase:migrate`
2. Configure variaveis no Vercel (ver `CONFIGURAR-SUPABASE-APPSBRASIL.md` e `DEPLOY-STATUS.md`)
3. Conecte o repositorio/branch no Vercel e aguarde deploy
4. Teste o site publicado
