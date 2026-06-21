# 🚀 INÍCIO RÁPIDO - Deploy Automático GitHub + Netlify

## ✅ O QUE JÁ ESTÁ PRONTO

- ✅ `index-static.html` - Site completo em HTML puro (pode copiar e usar!)
- ✅ `netlify.toml` - Configuração Netlify
- ✅ `.gitignore` - Arquivos ignorados
- ✅ Site já publicado: https://ivonei-eletrotecnico.netlify.app/

---

## 🎯 OPÇÃO 1: Usar o Arquivo HTML Diretamente no Netlify

### Via Drag & Drop (Mais Simples)

1. Abra https://app.netlify.com
2. Faça login
3. Arraste o arquivo `index-static.html` para dentro da tela
4. Renomeie para `index.html` se necessário
5. Pronto! Site publicado em segundos

**Desvantagem:** Deploy manual (sem automação)

---

## 🔄 OPÇÃO 2: Deploy Automático via GitHub (RECOMENDADO)

### Passo 1: Criar Repositório no GitHub

Abra o PowerShell nesta pasta e execute:

```powershell
# Inicializar repositório Git
git init

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "Site Ivonei Ferreira Eletrotécnico - HTML estático"
```

### Passo 2: Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `ivonei-eletrotecnico`
3. Deixe como **Público**
4. NÃO adicione README, .gitignore ou licença
5. Clique em **Create repository**

### Passo 3: Conectar Local com GitHub

Copie os comandos que aparecem na tela do GitHub (algo como):

```powershell
git remote add origin https://github.com/SEU_USUARIO/ivonei-eletrotecnico.git
git branch -M main
git push -u origin main
```

### Passo 4: Conectar Netlify ao GitHub

1. Acesse https://app.netlify.com
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Escolha **"Deploy with GitHub"**
4. Autorize o Netlify a acessar seus repositórios
5. Selecione o repositório `ivonei-eletrotecnico`
6. Configurações:
   - **Branch:** `main`
   - **Build command:** deixe vazio
   - **Publish directory:** `.`
7. Clique em **"Deploy site"**

### Passo 5: Configurar para usar index-static.html

No Netlify, após deploy:

1. Vá em **Site settings** → **Build & deploy** → **Post processing**
2. Adicione um redirect em **Redirects and rewrites**:
   ```
   /*    /index-static.html    200
   ```

**OU MELHOR:** Renomeie o arquivo localmente:

```powershell
# Renomear o arquivo
move index-static.html index.html

# Commit e push
git add .
git commit -m "Renomear para index.html"
git push
```

---

## ✨ PRONTO! Deploy Automático Funcionando

Agora, toda vez que você fizer uma alteração:

```powershell
# 1. Edite o arquivo index.html

# 2. Faça commit
git add .
git commit -m "Atualização do site"

# 3. Push (dispara deploy automático!)
git push
```

**O Netlify detecta automaticamente e publica em segundos!** ⚡

---

## 📱 URLs

- **Seu site:** https://ivonei-eletrotecnico.netlify.app/
- **GitHub:** https://github.com/SEU_USUARIO/ivonei-eletrotecnico
- **Netlify Dashboard:** https://app.netlify.com

---

## 🆘 Problemas Comuns

### "git não é reconhecido"
Instale o Git: https://git-scm.com/download/win

### "Permission denied" no GitHub
Configure suas credenciais:
```powershell
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### Site não atualiza
- Verifique se o push foi bem-sucedido
- Veja o log de deploy no Netlify
- Limpe o cache do navegador (Ctrl+Shift+R)

---

## 🎉 Benefícios do Deploy Automático

- ✅ Alterações publicadas em segundos
- ✅ Histórico completo de versões (Git)
- ✅ Possibilidade de reverter mudanças
- ✅ HTTPS gratuito e automático
- ✅ CDN global (site rápido em todo mundo)
- ✅ Deploy Preview para cada commit
- ✅ Certificado SSL renovado automaticamente

---

## 💡 Dica Extra: Domínio Personalizado

1. No Netlify: **Domain settings**
2. Clique em **Add custom domain**
3. Digite seu domínio (ex: `ivoneiferreira.com.br`)
4. Siga as instruções para configurar DNS

**Custo:** Apenas o registro do domínio (Netlify é gratuito!)
