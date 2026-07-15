# Nexus IA — Status do Deploy

Atualizado em: 15/07/2026

## O que foi automatizado nesta sessão

| Etapa | Status | Detalhe |
|---|---|---|
| `npm run build` | OK | `dist/` gerado com sucesso |
| Git inicializado + commit | OK | Commit `30c4556` — "Nexus IA: deploy prep com Vercel, Supabase e landing page rebrandada" |
| Push GitHub | Parcial | Branch `nexus-ia-static-deploy` publicada (ver abaixo) |
| Dev server | OK | `http://localhost:3000` responde HTTP 200 (porta já em uso por instância anterior) |
| Supabase test/migrate | Pendente | `SUPABASE_SERVICE_ROLE_KEY` vazio no `.env` |

## Repositório GitHub

- **URL:** https://github.com/ivoneieletrotecnico-collab/151230
- **Branch publicada:** `nexus-ia-static-deploy` (landing estática Nexus IA + infra Vercel/Supabase)
- **Branch remota existente:** `main` (projeto React/Vite com painel admin — histórico diferente)

### Por que não foi para `main` direto?

O `main` remoto já contém commits (`dc33ff7` em diante) com estrutura React/Vite (`src/App.tsx`, `admin-panel.html`, etc.). O push direto foi rejeitado. A versão local (HTML estático rebrandado) foi enviada para a branch `nexus-ia-static-deploy` para revisão/merge sem force push.

**Abrir PR:** https://github.com/ivoneieletrotecnico-collab/151230/pull/new/nexus-ia-static-deploy

## Pré-requisito Git (Windows / drive G:)

Execute **uma vez** no PowerShell se o Git reclamar de "dubious ownership":

```powershell
git config --global --add safe.directory "G:/Videos e matriais/Arsenal/Projeto page"
```

Alternativa sem alterar config global (usar em cada comando):

```powershell
git -c safe.directory="G:/Videos e matriais/Arsenal/Projeto page" status
```

## O que você ainda precisa fazer manualmente

### 1. Chave Supabase (obrigatório para API de downloads/contatos)

1. Acesse https://supabase.appsbrasil.store/project/default/settings/api
2. Copie a chave **service_role** (não a `anon`)
3. Cole em `.env`:

```env
SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui
```

4. Teste e migre:

```powershell
cd "g:\Videos e matriais\Arsenal\Projeto page"
npm run supabase:test
npm run supabase:migrate
```

Guia completo: `CONFIGURAR-SUPABASE-APPSBRASIL.md`

### 2. Variáveis no Vercel

No painel do projeto Vercel → **Settings → Environment Variables**, adicione:

| Variável | Valor |
|---|---|
| `SUPABASE_URL` | `https://supabase.appsbrasil.store` |
| `SUPABASE_SERVICE_ROLE_KEY` | (sua chave service_role) |
| `SUPABASE_DOWNLOADS_TABLE` | `downloads` |
| `SUPABASE_CONTACT_REQUESTS_TABLE` | `contact_requests` |

Opcional (painel admin futuro):

| Variável | Valor |
|---|---|
| `ADMIN_EMAIL` | seu e-mail |
| `ADMIN_PASSWORD` | senha forte |
| `ADMIN_SESSION_SECRET` | string aleatória longa |

### 3. Conectar Vercel ao GitHub

1. Importe o repositório `ivoneieletrotecnico-collab/151230` no Vercel
2. Escolha a branch: `nexus-ia-static-deploy` (ou faça merge na `main` antes)
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy

### 4. Decidir estratégia de branches

Escolha uma opção:

- **A)** Manter `main` como React/Vite e usar `nexus-ia-static-deploy` para a landing estática
- **B)** Fazer merge via PR e resolver conflitos (muitos arquivos divergem)
- **C)** Substituir `main` — **não recomendado** sem backup; exigiria force push

### 5. Identidade Git (se novos commits falharem)

```powershell
git config user.email "ivonei.energia@gmail.com"
git config user.name "Ivonei Eletricista"
```

(Use `--global` se quiser para todos os repositórios.)

## Comandos úteis

```powershell
cd "g:\Videos e matriais\Arsenal\Projeto page"

# Desenvolvimento local
npm run dev          # http://localhost:3000
npm run build        # gera dist/
npm run preview      # serve dist/

# Git (após safe.directory)
git status
git push origin main:nexus-ia-static-deploy
```

## Contato configurado na landing

- WhatsApp: `5574988259925`
- E-mail: `ivonei.energia@gmail.com`

## Arquivos sensíveis

- `.env` está no `.gitignore` — **nunca** commitar chaves
- `.env.example` é o template seguro para o repositório
