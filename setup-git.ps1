# Script de Configuração Git + GitHub
# Para rodar: clique com botão direito > "Executar com PowerShell"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Git - Ivonei Ferreira Site" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Git está instalado
try {
    $gitVersion = git --version
    Write-Host "✓ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git não está instalado!" -ForegroundColor Red
    Write-Host "Instale em: https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "Pressione ENTER para sair"
    exit
}

Write-Host ""
Write-Host "Configurando repositório Git..." -ForegroundColor Yellow

# Inicializar Git
if (Test-Path .git) {
    Write-Host "✓ Repositório Git já existe" -ForegroundColor Green
} else {
    git init
    Write-Host "✓ Repositório Git inicializado" -ForegroundColor Green
}

# Renomear index-static.html para index.html
if (Test-Path "index-static.html") {
    if (Test-Path "index.html") {
        Write-Host "✓ index.html já existe" -ForegroundColor Green
    } else {
        Copy-Item "index-static.html" "index.html"
        Write-Host "✓ Criado index.html a partir de index-static.html" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Configurando usuário Git..." -ForegroundColor Yellow
$userName = Read-Host "Digite seu nome"
$userEmail = Read-Host "Digite seu email"

git config user.name "$userName"
git config user.email "$userEmail"

Write-Host "✓ Usuário configurado" -ForegroundColor Green

Write-Host ""
Write-Host "Adicionando arquivos..." -ForegroundColor Yellow
git add .
Write-Host "✓ Arquivos adicionados" -ForegroundColor Green

Write-Host ""
Write-Host "Fazendo primeiro commit..." -ForegroundColor Yellow
git commit -m "Site Ivonei Ferreira Eletrotécnico - Deploy automático"
Write-Host "✓ Commit realizado" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRÓXIMOS PASSOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Crie um repositório no GitHub:" -ForegroundColor Yellow
Write-Host "   https://github.com/new" -ForegroundColor White
Write-Host ""
Write-Host "2. Nome sugerido: ivonei-eletrotecnico" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Execute estes comandos (substitua SEU_USUARIO):" -ForegroundColor Yellow
Write-Host ""
Write-Host "   git remote add origin https://github.com/SEU_USUARIO/ivonei-eletrotecnico.git" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "4. Configure Netlify:" -ForegroundColor Yellow
Write-Host "   - Acesse https://app.netlify.com" -ForegroundColor White
Write-Host "   - Add new site > Import from GitHub" -ForegroundColor White
Write-Host "   - Selecione o repositório ivonei-eletrotecnico" -ForegroundColor White
Write-Host "   - Deploy!" -ForegroundColor White
Write-Host ""
Write-Host "Documentação completa em: INICIO-RAPIDO.md" -ForegroundColor Cyan
Write-Host ""

Read-Host "Pressione ENTER para sair"
