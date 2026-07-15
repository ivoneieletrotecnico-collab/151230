# Publicar no GitHub

Repositorio: https://github.com/ivoneieletrotecnico-collab/151230

## Pre-requisito (Windows)

Se o Git reclamar de "dubious ownership" no drive G:, execute uma vez:

```powershell
git config --global --add safe.directory "G:/Videos e matriais/Arsenal/Projeto page"
```

## Comandos

```powershell
cd "g:\Videos e matriais\Arsenal\Projeto page"

git init
git remote add origin https://github.com/ivoneieletrotecnico-collab/151230.git

git add .
git commit -m "Nexus IA: landing page com deploy Vercel e Supabase"
git branch -M main
git push -u origin main
```

## Autenticacao

O `gh` CLI nao esta autenticado nesta maquina. Opcoes:

1. `gh auth login`
2. Token pessoal do GitHub como senha no push HTTPS
3. SSH: `git@github.com:ivoneieletrotecnico-collab/151230.git`

## Apos o push

1. Configure variaveis no Vercel (ver CONFIGURAR-SUPABASE-APPSBRASIL.md)
2. Aguarde deploy automatico
3. Teste o site publicado
