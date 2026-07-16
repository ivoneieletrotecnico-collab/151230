# Configurar MCP Supabase no Cursor — Nexus IA

Guia para conectar o **Cursor** ao Supabase self-hosted do projeto **Nexus Inteligência Artificial** em:

| Recurso | URL |
|---|---|
| **Dashboard (Studio)** | https://supabase.appsbrasil.store/project/default |
| **API base** | `https://supabase.appsbrasil.store` |
| **Endpoint MCP (self-hosted)** | `https://supabase.appsbrasil.store/mcp` *(bloqueado por padrão)* |

> **Situação atual:** neste workspace o Cursor só tem os servidores MCP `cursor-ide-browser` e `cursor-app-control`. O Supabase MCP **não está configurado** — siga este guia para adicioná-lo.

---

## O que é o Supabase MCP?

O [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) permite que o agente do Cursor interaja com o banco e o projeto Supabase por ferramentas padronizadas, por exemplo:

- Listar tabelas, extensões e migrations
- Executar SQL (`execute_sql`)
- Aplicar migrations (`apply_migration`)
- Consultar logs, configurações e documentação (no ambiente cloud)

Documentação oficial: [Supabase MCP Server](https://supabase.com/docs/guides/ai-tools/mcp)

---

## Supabase Cloud vs self-hosted (appsbrasil.store)

| Aspecto | Supabase Cloud (`supabase.com`) | Self-hosted (`supabase.appsbrasil.store`) |
|---|---|---|
| **Endpoint MCP** | `https://mcp.supabase.com/mcp` | `https://supabase.appsbrasil.store/mcp` |
| **Autenticação** | OAuth no browser ou Personal Access Token (PAT) | Sem OAuth; acesso por IP restrito + túnel SSH |
| **Pacote `npx @supabase/mcp-server-supabase`** | ✅ Funciona (Management API cloud) | ❌ **Não funciona** — PAT é da conta supabase.com |
| **Ferramentas disponíveis** | Conjunto completo (~20+ tools) | **Subconjunto limitado** |
| **Expor na internet** | Sim (com OAuth/PAT) | **Não recomendado** — bloqueado por padrão no Kong |

**Conclusão para o Nexus IA:** como o Supabase está em `appsbrasil.store`, use o endpoint HTTP self-hosted (`/mcp`) com túnel SSH — **não** o pacote npm nem `mcp.supabase.com`.

---

## Pré-requisitos

1. **Node.js 18+** instalado (necessário para alguns clientes MCP; o Cursor usa transporte HTTP nativo)
2. **Acesso SSH** ao servidor que hospeda o Supabase (para túnel)
3. **Permissão de admin** no servidor para editar `kong.yml` ou `envoy/lds.template.yaml` (se o MCP ainda estiver bloqueado)
4. **Cursor** atualizado (Settings → Tools & MCP)

---

## Passo 1 — Habilitar MCP no servidor self-hosted

Por padrão, o Kong/Envoy **nega** todas as conexões em `/mcp`. Isso é intencional por segurança.

Guia oficial: [Enabling MCP Server Access (self-hosting)](https://supabase.com/docs/guides/self-hosting/enable-mcp)

### 1.1 Descobrir o IP do gateway Docker

No servidor que roda os containers Supabase:

```bash
docker inspect supabase-kong \
  --format '{{range .NetworkSettings.Networks}}{{println .Gateway}}{{end}}'
```

Anote o IP (ex.: `172.18.0.1`).

### 1.2 Liberar acesso no Kong

Edite `./volumes/api/kong.yml` no servidor:

1. Comente a seção `request-termination` que bloqueia `/mcp`
2. Descomente a seção com `ip-restriction` e `cors`
3. Adicione o IP do gateway Docker na lista `allow`
4. Reinicie o gateway: `sh run.sh restart kong`

> **Importante:** não remova `deny: []` e não exponha `/mcp` publicamente sem restrição de IP.

### 1.3 Testar (após túnel SSH — passo 2)

```bash
curl http://localhost:8080/mcp \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "MCP-Protocol-Version: 2025-06-18" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{"elicitation":{}},"clientInfo":{"name":"test","title":"Test","version":"1.0.0"}}}'
```

Resposta JSON-RPC indica que o MCP está ativo.

---

## Passo 2 — Criar túnel SSH (recomendado)

O MCP self-hosted **não deve** ficar aberto na internet. Acesse via túnel:

```bash
ssh -L localhost:8080:localhost:8000 SEU_USUARIO@SEU_SERVIDOR_APPSBRASIL
```

- `8080` = porta local no seu PC
- `8000` = porta da API/Kong no servidor Supabase
- Mantenha o terminal aberto enquanto usar o MCP no Cursor

Se a instância usa HTTPS na porta 443 via proxy reverso, ajuste o mapeamento conforme a arquitetura do servidor (ex.: `443:443` ou `8080:8000`).

---

## Passo 3 — Configurar no Cursor

### Onde colocar o arquivo

| Escopo | Caminho |
|---|---|
| **Só este projeto (Nexus IA)** | `g:\Videos e matriais\Arsenal\Projeto page\.cursor\mcp.json` |
| **Todos os projetos** | `C:\Users\User\.cursor\mcp.json` |

O Cursor mescla config global + projeto; o do projeto tem prioridade.

### Opção A — Interface gráfica

1. Abra **Cursor Settings** (`Ctrl + ,`)
2. Vá em **Tools & MCP** (ou **Features → MCP Servers**)
3. Clique em **Add new MCP server**
4. Cole a configuração JSON (veja snippets abaixo)
5. Ative o toggle do servidor `supabase-nexus-ia`
6. Se necessário: **Reload Window** (`Ctrl+Shift+P` → *Reload Window*)

### Opção B — Arquivo `.cursor/mcp.json`

Crie a pasta `.cursor` na raiz do projeto (se não existir) e o arquivo `mcp.json`.

---

## Snippets `mcp.json` para Cursor

### Recomendado — self-hosted via túnel SSH (Nexus IA)

Use enquanto o túnel SSH do Passo 2 estiver ativo:

```json
{
  "mcpServers": {
    "supabase-nexus-ia": {
      "url": "http://localhost:8080/mcp?read_only=true"
    }
  }
}
```

Parâmetros úteis na URL (mesmos da documentação cloud):

| Parâmetro | Exemplo | Efeito |
|---|---|---|
| `read_only=true` | `?read_only=true` | SQL somente leitura; bloqueia DDL/DML destrutivo |
| `features=database,docs` | `?features=database,docs` | Limita grupos de ferramentas |

Exemplo combinado:

```json
{
  "mcpServers": {
    "supabase-nexus-ia": {
      "url": "http://localhost:8080/mcp?read_only=true&features=database,docs"
    }
  }
}
```

### Alternativa — URL direta (somente se o servidor já liberar seu IP)

> ⚠️ **Não recomendado** para produção. O endpoint público costuma retornar **403** até o Kong ser configurado.

```json
{
  "mcpServers": {
    "supabase-appsbrasil": {
      "url": "https://supabase.appsbrasil.store/mcp?read_only=true"
    }
  }
}
```

### Referência — Supabase Cloud (NÃO usar para appsbrasil.store)

Estas configs funcionam **apenas** com projetos em `supabase.com`:

**HTTP remoto (OAuth no browser):**

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=SEU_PROJECT_REF&read_only=true"
    }
  }
}
```

**Stdio via npx (Personal Access Token):**

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=SEU_PROJECT_REF"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "COLE_SEU_PAT_AQUI"
      }
    }
  }
}
```

> **Não commite tokens.** Use variáveis de ambiente ou preencha localmente.

---

## Credenciais — o que usar e o que NÃO usar

| Credencial | Onde obter | Usar no MCP self-hosted? |
|---|---|---|
| **Personal Access Token (PAT)** | supabase.com → Account → Access Tokens | ❌ Só para cloud / pacote npx |
| **Service role key** | Studio → Settings → API → `service_role` | ❌ **Não** é credencial do MCP; use no backend Nexus IA (`.env`) |
| **Anon key** | Studio → Settings → API → `anon` | ❌ Não é credencial do MCP |
| **Login Studio (e-mail/senha)** | https://supabase.appsbrasil.store | Para painel web; MCP self-hosted autentica via rede/IP, não via service_role |

Para o **Nexus IA**, continue usando `SUPABASE_SERVICE_ROLE_KEY` no `.env` da aplicação conforme `CONFIGURAR-SUPABASE-APPSBRASIL.md`. Isso é **separado** do MCP do Cursor.

---

## Ferramentas disponíveis (grupos)

No ambiente **cloud**, o MCP expõe grupos como:

| Grupo | Exemplos de ferramentas |
|---|---|
| **database** | `list_tables`, `list_extensions`, `list_migrations`, `execute_sql`, `apply_migration` |
| **docs** | Busca na documentação Supabase |
| **debugging** | Consulta de logs |
| **development** | Tipos TypeScript, branches |
| **functions** | Edge Functions |
| **storage** | Buckets e objetos |
| **account** | Listar projetos (desabilitado com `project_ref`) |

No **self-hosted**, a documentação oficial informa **subconjunto limitado** de ferramentas e **sem OAuth 2.1**. Espere principalmente operações de banco (`list_tables`, `execute_sql`, migrations) ligadas ao projeto `default`.

Com `read_only=true`, ferramentas mutáveis (`apply_migration`, inserts/updates/deletes via SQL) ficam bloqueadas.

---

## Limitações do self-hosted (appsbrasil.store)

1. **MCP bloqueado por padrão** — exige editar Kong/Envoy no servidor
2. **Não expor na internet** — use VPN ou túnel SSH
3. **Sem OAuth** — diferente do fluxo “clique e logue” do supabase.com
4. **Pacote npm oficial não serve** — `@supabase/mcp-server-supabase` fala com a Management API cloud
5. **Menos ferramentas** que o MCP cloud (sem account tools, branching cloud, etc.)
6. **Túnel SSH obrigatório na prática** — sem túnel, o Cursor no seu PC não alcança o Kong interno
7. **Versão do Supabase** — MCP self-hosted depende de versão recente do stack Docker; atualize se `/mcp` não existir

---

## Verificar se funcionou no Cursor

1. Túnel SSH ativo (`localhost:8080`)
2. Servidor MCP com toggle **verde** em Settings → Tools & MCP
3. No chat do Agent, pergunte por exemplo:
   - *“Liste as tabelas do banco usando o MCP Supabase”*
   - *“Quantos registros existem em `downloads`?”*
   - *“Mostre o schema da tabela `contact_requests`”*

Se aparecer erro **403** ou **connection refused**:

- Confirme o túnel SSH
- Verifique `kong.yml` / IP na whitelist
- Veja logs: `docker compose logs kong`

---

## Alternativa: MCP PostgREST (REST, não Management API)

Se não puder habilitar `/mcp` no servidor, existe o pacote [`@supabase/mcp-server-postgrest`](https://github.com/supabase/mcp/tree/main/packages/mcp-server-postgrest) para consultar dados via REST API com `anon` key (somente tabelas expostas ao PostgREST):

```json
{
  "mcpServers": {
    "supabase-postgrest": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-postgrest",
        "--api-url",
        "https://supabase.appsbrasil.store/rest/v1",
        "--api-key",
        "SUA_ANON_KEY_AQUI",
        "--schema",
        "public"
      ]
    }
  }
}
```

> Use **anon key**, não service_role, e restrinja tabelas via RLS. Adequado para leitura; não substitui o MCP completo de schema/migrations.

---

## Segurança — boas práticas

1. Sempre use `read_only=true` salvo quando precisar aplicar migration com consciência
2. Nunca commite PAT, service_role ou anon key no Git
3. Não exponha `/mcp` publicamente sem IP whitelist
4. Prefira MCP no projeto de desenvolvimento, não contra produção com dados sensíveis
5. Revise ações do agente antes de aprovar SQL de escrita

Documentação: [Security risks — Supabase MCP](https://supabase.com/docs/guides/ai-tools/mcp#security-risks)

---

## Resumo rápido — Nexus IA

| Item | Valor |
|---|---|
| Projeto Supabase | `default` |
| URL base | `https://supabase.appsbrasil.store` |
| MCP (após túnel) | `http://localhost:8080/mcp?read_only=true` |
| Arquivo Cursor | `.cursor/mcp.json` na raiz do projeto |
| Credencial MCP | Nenhuma token — túnel + IP whitelist no servidor |
| Credencial app (`.env`) | `SUPABASE_SERVICE_ROLE_KEY` (separado do MCP) |

---

## Links úteis

- [Supabase MCP — documentação oficial](https://supabase.com/docs/guides/ai-tools/mcp)
- [Habilitar MCP em self-hosting](https://supabase.com/docs/guides/self-hosting/enable-mcp)
- [Repositório supabase/mcp](https://github.com/supabase/mcp)
- [Configurar Supabase appsbrasil (Nexus IA)](./CONFIGURAR-SUPABASE-APPSBRASIL.md)
