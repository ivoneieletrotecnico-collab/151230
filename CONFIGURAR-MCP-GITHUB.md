# Configurar GitHub MCP no Cursor — Nexus IA

Guia passo a passo para habilitar o **servidor MCP oficial do GitHub** no Cursor e permitir que o agente trabalhe com repositórios, issues, pull requests e mais — direto no chat.

| Recurso | URL |
|---|---|
| **Repositório do projeto** | https://github.com/ivoneieletrotecnico-collab/151230 |
| **Servidor MCP oficial** | https://github.com/github/github-mcp-server |
| **Guia oficial (Cursor)** | https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-cursor.md |

---

## Status atual nesta máquina

| Item | Status |
|---|---|
| GitHub MCP no Cursor | **Não habilitado** — só `cursor-ide-browser` e `cursor-app-control` estão ativos |
| `gh` CLI | Instalado (v2.86.0), mas **não autenticado** |
| Docker | **Não instalado** — use o servidor remoto (recomendado) |

> O pacote npm `@modelcontextprotocol/server-github` está **descontinuado** desde abril/2025. Use apenas o servidor oficial.

---

## Passo 1 — Abrir configuração MCP no Cursor

1. Abra o Cursor
2. Vá em **Settings** (engrenagem) → **Tools & Integrations** → **MCP**
3. Clique em **Add new MCP server** ou edite o arquivo de configuração diretamente

**Onde salvar a configuração:**

| Escopo | Arquivo | Quando usar |
|---|---|---|
| Global (todos os projetos) | `C:\Users\User\.cursor\mcp.json` | Recomendado — token pessoal não vai para o Git |
| Só este projeto | `.cursor/mcp.json` na raiz do projeto | Compartilhar setup com a equipe (sem token!) |

---

## Passo 2 — Escolher método de instalação

### Opção A — Servidor remoto (recomendado)

Não precisa de Docker. Funciona nesta máquina. Requer Cursor **v0.48.0+**.

Cole em `~/.cursor/mcp.json` (ou `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "github": {
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer SEU_GITHUB_PAT"
      }
    }
  }
}
```

Substitua `SEU_GITHUB_PAT` pelo seu Personal Access Token (Passo 3).

**Variante mais segura** — token via variável de ambiente do Windows (não coloque o PAT no JSON):

```json
{
  "mcpServers": {
    "github": {
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${env:GITHUB_TOKEN}"
      }
    }
  }
}
```

Defina a variável no PowerShell (sessão atual):

```powershell
$env:GITHUB_TOKEN = "ghp_seu_token_aqui"
```

Para persistir no Windows: **Configurações do Sistema → Variáveis de ambiente** → nova variável de usuário `GITHUB_TOKEN`.

### Opção B — Servidor local via Docker (alternativa)

Só use se tiver **Docker Desktop** instalado e em execução. Nesta máquina o Docker **não está disponível**.

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "SEU_GITHUB_PAT"
      }
    }
  }
}
```

### Opção C — OAuth via Docker (sem colar PAT)

Abre login no navegador na primeira execução. Também exige Docker:

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-p",
        "127.0.0.1:8085:8085",
        "-e",
        "GITHUB_OAUTH_CALLBACK_PORT",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_OAUTH_CALLBACK_PORT": "8085"
      }
    }
  }
}
```

---

## Passo 3 — Autenticação (GitHub PAT)

O servidor MCP do GitHub exige um **Personal Access Token**. O `gh auth login` autentica o CLI, mas o MCP usa o PAT no `mcp.json` (ou variável `GITHUB_TOKEN`).

### Criar o token

1. Acesse https://github.com/settings/personal-access-tokens/new
2. Escolha **Fine-grained token** (recomendado) ou **Classic token**
3. Selecione o repositório `ivoneieletrotecnico-collab/151230` (ou todos que precisar)
4. Permissões mínimas sugeridas para o Nexus IA:

| Permissão | Para quê |
|---|---|
| **Contents** (Read and write) | Ler arquivos, commits, branches |
| **Pull requests** (Read and write) | Abrir, revisar e mergear PRs |
| **Issues** (Read and write) | Criar e gerenciar issues |
| **Metadata** (Read) | Informações básicas do repo |
| **Actions** (Read) — opcional | Ver status de CI/CD no Vercel/GitHub Actions |

Para token **Classic**, marque o escopo `repo` (cobre a maioria das operações).

5. Gere o token e copie (começa com `ghp_` ou `github_pat_`)
6. Cole no `mcp.json` ou na variável `GITHUB_TOKEN`

> **Nunca** commite o PAT no Git. O `.env` e `mcp.json` com token real devem ficar só na sua máquina.

### Autenticar o `gh` CLI (complementar)

Útil para PRs e deploy via terminal — independente do MCP:

```powershell
gh auth login
```

Siga o assistente:

1. **GitHub.com**
2. **HTTPS** (ou SSH se preferir)
3. **Login with a web browser** (mais fácil) ou cole o PAT
4. Confirme:

```powershell
gh auth status
```

---

## Passo 4 — Reiniciar e verificar

1. **Salve** o `mcp.json`
2. **Reinicie o Cursor completamente** (feche e abra de novo)
3. Vá em **Settings → Tools & Integrations → MCP Tools**
4. O servidor `github` deve aparecer com **bolinha verde** (conectado)
5. No chat/composer, verifique **Available Tools** — devem listar ferramentas do GitHub
6. Teste com: *"Liste meus repositórios no GitHub"* ou *"Mostre as branches do repositório 151230"*

---

## O que o GitHub MCP oferece (toolsets)

O agente pode usar grupos de ferramentas conforme o token permitir:

| Toolset | O que faz |
|---|---|
| `repos` | Repositórios — listar, buscar arquivos, commits, branches |
| `pull_requests` | PRs — criar, revisar, comentar, mergear |
| `issues` | Issues — criar, editar, fechar, comentar |
| `actions` | GitHub Actions — workflows, runs, jobs |
| `code_security` | Code scanning, alertas de segurança |
| `dependabot` | Alertas e PRs do Dependabot |
| `projects` | GitHub Projects (quadros) |
| `discussions` | Discussões do repositório |
| `gists` | Gists |
| `notifications` | Notificações da conta |
| `users` / `orgs` | Perfis e organizações |
| `copilot` | Ferramentas Copilot (servidor remoto) |

**Padrão (`default`):** inclui contexto, repos, issues e pull requests — suficiente para o fluxo Nexus IA.

**Somente leitura:** use URL `https://api.githubcopilot.com/mcp/readonly` se não quiser que o agente altere nada.

**Exemplo com toolsets limitados** (via header no `mcp.json`):

```json
{
  "mcpServers": {
    "github": {
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer SEU_GITHUB_PAT",
        "X-MCP-Toolsets": "repos,pull_requests,issues"
      }
    }
  }
}
```

### Exemplos do que pedir ao agente (após configurar)

- *"Abra uma PR da branch `nexus-ia-static-deploy` para `main`"*
- *"Liste os commits da branch `nexus-ia-static-deploy`"*
- *"Mostre issues abertas no repositório 151230"*
- *"Qual o status do último workflow no GitHub Actions?"*

---

## Passo 5 — Integração com o projeto Nexus IA

Depois do MCP ativo, o agente consegue ajudar com:

| Tarefa | Ferramenta MCP / CLI |
|---|---|
| Ver branch `nexus-ia-static-deploy` | `repos` + `pull_requests` |
| Criar PR para `main` | `pull_requests` ou `gh pr create` |
| Revisar conflitos entre branches | `repos` (ler arquivos) + `pull_requests` |
| Issues de deploy/bugs | `issues` |

Guia de deploy (sem MCP): `CONFIGURAR-GITHUB.md`

---

## Problemas comuns

| Problema | Solução |
|---|---|
| Servidor não aparece no MCP | Reinicie o Cursor; valide JSON em https://jsonlint.com |
| Bolinha vermelha / erro de auth | Verifique PAT, escopos e se não expirou |
| Ferramentas não listadas | Confirme Cursor v0.48+ para servidor remoto |
| Erro de conexão HTTP | Firewall/proxy; teste URL no navegador |
| Docker não encontrado | Use **Opção A** (servidor remoto) |
| `gh` não autenticado | Rode `gh auth login` (independente do MCP) |
| Token no Git por engano | Revogue o token em GitHub Settings e gere outro |

---

## Checklist rápido

- [ ] Criar PAT em https://github.com/settings/personal-access-tokens/new
- [ ] Adicionar bloco `github` em `C:\Users\User\.cursor\mcp.json`
- [ ] Reiniciar Cursor
- [ ] Bolinha verde em Settings → MCP Tools
- [ ] Testar: "Liste meus repositórios"
- [ ] (Opcional) `gh auth login` para CLI
- [ ] Seguir `CONFIGURAR-GITHUB.md` para PR e Vercel

---

## Referências oficiais

- Instalação Cursor: https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-cursor.md
- Servidor remoto: https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md
- Documentação MCP Cursor: https://docs.cursor.com/context/mcp
