# 🔑 Gerar Novo Token GitHub (Passo a Passo)

## ⚠️ Token Anterior Não Funcionou

O token fornecido não tem as permissões corretas ou está expirado.

---

## 📋 PASSO A PASSO COMPLETO

### 1️⃣ **Acesse a Página de Tokens**

Abra no navegador:
```
https://github.com/settings/tokens
```

Ou navegue manualmente:
- GitHub.com → Foto de perfil (canto superior direito)
- **Settings**
- Role até **Developer settings** (fim da barra lateral)
- **Personal access tokens** > **Tokens (classic)**

---

### 2️⃣ **Gerar Novo Token**

1. Clique em **"Generate new token"**
2. Escolha **"Generate new token (classic)"**

---

### 3️⃣ **Configurar o Token**

Preencha os campos:

**Note (nome do token):**
```
Deploy Ivonei Eletrotecnico Site
```

**Expiration (expiração):**
- Escolha: **90 days** (ou **No expiration** se preferir)

**Select scopes (permissões) - IMPORTANTE:**

✅ Marque **TODOS** estes checkboxes:

```
✅ repo (marque o principal, marca todos os sub-itens)
   ✅ repo:status
   ✅ repo_deployment
   ✅ public_repo
   ✅ repo:invite
   ✅ security_events

✅ workflow (opcional, mas recomendado)

✅ admin:repo_hook (opcional)
   ✅ write:repo_hook
   ✅ read:repo_hook
```

**MÍNIMO NECESSÁRIO:** `repo` completo

---

### 4️⃣ **Gerar e Copiar Token**

1. Role até o fim e clique em **"Generate token"**

2. **COPIE O TOKEN IMEDIATAMENTE!**
   - Ele aparece uma única vez
   - Formato: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Guarde em local seguro

---

### 5️⃣ **Usar o Token no Git**

Abra o PowerShell nesta pasta e execute:

```powershell
cd "c:\Users\User\Downloads\Meus Arquivos baixados\ivonei-ferreira-eletrotécnico"

# Remover remote antigo
git remote remove origin

# Adicionar com novo token (SUBSTITUA SEU_TOKEN_AQUI)
git remote add origin https://SEU_TOKEN_AQUI@github.com/eletrotcnico151230/ivonei-eletrotecnico.git

# Fazer push
git push -u origin main
```

**Exemplo (substitua o token):**
```powershell
git remote add origin https://SEU_TOKEN_AQUI@github.com/eletrotcnico151230/ivonei-eletrotecnico.git
```

---

## ✅ **ALTERNATIVA MAIS FÁCIL - GitHub Desktop**

Se estiver com dificuldades, use o GitHub Desktop:

1. **Baixe:** https://desktop.github.com/
2. **Instale** e faça login
3. **File** > **Add Local Repository**
4. Escolha esta pasta
5. **Publish repository**

✅ **GitHub Desktop gerencia autenticação automaticamente!**

---

## 🔒 **SEGURANÇA DO TOKEN**

### ⚠️ REVOGAR TOKEN ANTIGO

O token que você compartilhou ficou exposto. Revogue-o:

1. Acesse: https://github.com/settings/tokens
2. Encontre o token antigo
3. Clique em **"Delete"** ou **"Revoke"**

### ✅ BOAS PRÁTICAS

- ✅ Use tokens com expiração (90 dias)
- ✅ Dê nomes descritivos
- ✅ Revogue tokens que não usa mais
- ✅ Nunca compartilhe tokens publicamente
- ✅ Use GitHub Desktop quando possível

---

## 📱 **APÓS PUSH BEM-SUCEDIDO**

Quando o push funcionar, você verá:

```
Enumerating objects: 21, done.
Counting objects: 100% (21/21), done.
Delta compression using up to 8 threads
Compressing objects: 100% (18/18), done.
Writing objects: 100% (21/21), 54.32 KiB | 5.43 MiB/s, done.
Total 21 (delta 0), reused 0 (delta 0), pack-reused 0
To https://github.com/eletrotcnico151230/ivonei-eletrotecnico.git
 * [new branch]      main -> main
```

✅ **Sucesso!** Arquivos enviados para GitHub.

---

## 🌐 **PRÓXIMO PASSO: Netlify**

Depois do push bem-sucedido:

1. Acesse: https://app.netlify.com
2. **Add new site** > **Import from GitHub**
3. Autorize o Netlify
4. Selecione: **eletrotcnico151230/ivonei-eletrotecnico**
5. Configuração:
   ```
   Branch: main
   Build command: (vazio)
   Publish directory: .
   ```
6. **Deploy site**

✅ **Deploy automático configurado!**

---

## 🆘 **AINDA COM PROBLEMAS?**

### Opção A: GitHub Desktop
Mais fácil e confiável: https://desktop.github.com/

### Opção B: SSH
Configure chaves SSH (mais seguro):
```powershell
ssh-keygen -t ed25519 -C "seu@email.com"
# Adicione em: https://github.com/settings/keys
```

### Opção C: Suporte GitHub
https://support.github.com/

---

## 📊 **STATUS ATUAL**

✅ Repositório local pronto  
✅ Arquivos commitados  
✅ 19 arquivos prontos para push  
❌ Push pendente (token com permissões corretas)  

**Próximo passo:** Gerar token com permissões `repo` e fazer push!
