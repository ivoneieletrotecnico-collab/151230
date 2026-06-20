# Ivonei Ferreira Eletrotécnico

Landing page estática para divulgação de serviços elétricos.

## Executar localmente

1. Instale as dependências:
   `npm install`
2. Inicie o servidor local:
   `npm run dev`

## Build

Gera a pasta `dist/` com `index.html` e os ativos estáticos:

`npm run build`

## Prévia do build

Serve o conteúdo gerado em `dist/`:

`npm run preview`

## Downloads sincronizados

O painel administrativo salva os downloads em um armazenamento compartilhado.
Assim, quando o administrador adiciona, edita ou remove arquivos, os usuários veem a atualização automaticamente após a próxima sincronização da página.

## Solicitações do formulário

Os envios do formulário público são registrados no painel administrativo com nome, telefone, e-mail, serviço e mensagem completa.
