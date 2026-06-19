# 🚀 Guia de Deploy Automático - Netlify + GitHub

## ✅ Arquivo HTML Estático Criado

O arquivo `index-static.html` contém todo o site em um único arquivo HTML com:
- ✅ CSS embutido (sem dependências externas)
- ✅ JavaScript puro (sem React, sem Node.js)
- ✅ Totalmente funcional e responsivo
- ✅ Integração WhatsApp completa
- ✅ Formulário de contato funcional

---

## 📋 Passo a Passo para Deploy Automático

### 1️⃣ **Criar Repositório no GitHub**

```bash
# Inicializar Git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "Adicionar site estático Ivonei Ferreira Eletrotécnico"

# Criar repositório no GitHub e conectar
git remote add origin https://github.com/SEU_USUARIO/ivonei-eletrotecnico.git
git branch -M main
git push -u origin main
```

### 2️⃣ **Conectar GitHub com Netlify**

1. Acesse https://app.netlify.com
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Escolha **"GitHub"** e autorize o Netlify
4. Selecione o repositório `ivonei-eletrotecnico`
5. Configure:
   - **Branch to deploy:** `main`
   - **Build command:** (deixe vazio)
   - **Publish directory:** `.`
6. Clique em **"Deploy site"**

### 3️⃣ **Configuração Automática**

O arquivo `netlify.toml` já está configurado para:
- Publicar o diretório raiz
- Redirecionar todas as URLs para `index-static.html`
- Deploy automático a cada push no GitHub

---

## 🔄 Como Funciona o Deploy Automático

1. Você faz alterações no código localmente
2. Faz commit e push para o GitHub:
   ```bash
   git add .
   git commit -m "Atualizar conteúdo do site"
   git push
   ```
3. O Netlify detecta automaticamente o push
4. Deploy acontece em segundos
5. Site atualizado em https://ivonei-eletrotecnico.netlify.app/

---

## 🎯 Arquivos Importantes

- `index-static.html` - Site completo em HTML puro
- `netlify.toml` - Configuração do Netlify
- `.gitignore` - Arquivos ignorados pelo Git

---

## 🔧 Comandos Git Úteis

```bash
# Ver status dos arquivos
git status

# Adicionar arquivo específico
git add index-static.html

# Fazer commit
git commit -m "Descrição da alteração"

# Enviar para GitHub (dispara deploy automático)
git push

# Ver histórico
git log --oneline
```

---

## 📱 Testar o Site

Após o deploy:
- URL: https://ivonei-eletrotecnico.netlify.app/
- Testar WhatsApp: (74) 98825-9925
- Testar formulário de contato
- Testar menu mobile
- Verificar todos os links

---

## ⚙️ Configurações Opcionais no Netlify

### Domínio Personalizado
1. No Netlify, vá em **Domain settings**
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

### HTTPS
- Habilitado automaticamente pelo Netlify
- Certificado SSL gratuito renovado automaticamente

### Variáveis de Ambiente
- No Netlify: **Site settings** → **Environment variables**
- (Não necessário para este site estático)

---

## 🎉 Pronto!

Agora seu site tem:
- ✅ Deploy automático via GitHub
- ✅ HTTPS gratuito
- ✅ CDN global do Netlify
- ✅ Certificado SSL renovado automaticamente
- ✅ Atualizações instantâneas a cada push

**Qualquer alteração que você fizer e enviar para o GitHub será automaticamente publicada!**
