# 🔐 Configurar Autenticação GitHub

## ⚠️ Problema Detectado

O Git está tentando usar credenciais antigas (`ivoneifsapp`) que não têm permissão para o repositório `ivoneieletrotecnico-collab/151230`.

---

## ✅ SOLUÇÃO 1: Usar GitHub Desktop (MAIS FÁCIL)

### Passo a Passo:

1. **Baixe o GitHub Desktop**
   - https://desktop.github.com/

2. **Instale e faça login** com sua conta GitHub

3. **Adicione o repositório existente:**
   - File > Add Local Repository
   - Escolha esta pasta: `ivonei-ferreira-eletrotécnico`

4. **Publique:**
   - Clique em "Publish repository"
   - Ou em "Push origin" se já estiver conectado

**Pronto!** GitHub Desktop gerencia a autenticação automaticamente.

---

## ✅ SOLUÇÃO 2: Personal Access Token (Linha de Comando)

### Passo 1: Criar Personal Access Token

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** > **"Generate new token (classic)"**
3. Configure:
   - **Note:** `Deploy Ivonei Eletrotécnico`
   - **Expiration:** 90 days (ou No expiration)
   - **Scopes:** Marque ✅ `repo` (todos os sub-itens)
4. Clique em **"Generate token"**
5. **COPIE O TOKEN** (você não verá ele novamente!)
   - Exemplo: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxx`

### Passo 2: Usar o Token no Git

**Windows (Credential Manager):**

```powershell
# 1. Remover credencial antiga
git credential reject
host=github.com
protocol=https

# (pressione Enter duas vezes)

# 2. Fazer push novamente (vai pedir usuário/senha)
git push -u origin main

# Username: eletrotcnico151230
# Password: COLE_SEU_TOKEN_AQUI (não a senha!)
```

**OU use URL com token:**

```powershell
# Remover origin antiga
git remote remove origin

# Adicionar com token (substituir TOKEN pelo seu token)
git remote add origin https://SEU_TOKEN@github.com/ivoneieletrotecnico-collab/151230.git

# Push
git push -u origin main
```

---

## ✅ SOLUÇÃO 3: SSH (Mais Seguro)

### Passo 1: Gerar Chave SSH

```powershell
# Gerar chave SSH
ssh-keygen -t ed25519 -C "seu@email.com"

# Pressione Enter 3 vezes (aceita valores padrão)

# Copiar chave pública
Get-Content ~/.ssh/id_ed25519.pub | clip
```

### Passo 2: Adicionar no GitHub

1. Acesse: https://github.com/settings/keys
2. Clique em **"New SSH key"**
3. **Title:** `PC Ivonei`
4. **Key:** Cole a chave copiada (Ctrl+V)
5. Clique em **"Add SSH key"**

### Passo 3: Usar SSH

```powershell
# Remover origin HTTPS
git remote remove origin

# Adicionar origin SSH
git remote add origin git@github.com:ivoneieletrotecnico-collab/151230.git

# Push
git push -u origin main
```

---

## 🚀 DEPOIS QUE CONFIGURAR

Execute:

```powershell
cd "c:\Users\User\Downloads\Meus Arquivos baixados\ivonei-ferreira-eletrotécnico"
git push -u origin main
```

Se der certo, você verá:

```
Enumerating objects: 21, done.
Counting objects: 100% (21/21), done.
...
To https://github.com/ivoneieletrotecnico-collab/151230.git
 * [new branch]      main -> main
```

---

## 🌐 CONFIGURAR NETLIFY

Após o push bem-sucedido:

1. Acesse: https://app.netlify.com
2. Faça login (pode usar conta GitHub)
3. Clique: **"Add new site"** > **"Import an existing project"**
4. Escolha: **"Deploy with GitHub"**
5. Autorize o Netlify
6. Selecione: **ivoneieletrotecnico-collab/151230**
7. Configure:
   ```
   Branch to deploy: main
   Build command: (deixe vazio)
   Publish directory: .
   ```
8. Clique: **"Deploy site"**

**Pronto!** Cada push no GitHub = deploy automático! 🎉

---

## 📱 VERIFICAR SITE

Após deploy:
- URL temporária: `https://random-name-123.netlify.app`
- Renomear: Site settings > Domain management > Change site name
- Sugestão: `ivonei-eletrotecnico`

---

## 💡 COMANDOS ÚTEIS (após configurado)

```powershell
# Ver status
git status

# Fazer alterações
# 1. Edite index.html
# 2. Salve
# 3. Commit e push:
git add .
git commit -m "Atualizar conteúdo"
git push

# Deploy automático acontece em segundos!
```

---

## 🆘 AINDA COM PROBLEMAS?

**Opção A: Use GitHub Desktop**
- Mais fácil, interface gráfica
- https://desktop.github.com/

**Opção B: Entre em contato com suporte GitHub**
- https://support.github.com/

**Opção C: Crie novo repositório**
- Faça backup desta pasta
- Crie novo repo no GitHub
- Tente novamente

---

## 📋 ESTADO ATUAL

✅ Repositório Git inicializado  
✅ Arquivos commitados  
✅ Remote configurado  
✅ Branch main criada  
❌ Push pendente (problema de autenticação)

**Próximo passo:** Configurar autenticação e fazer push!
