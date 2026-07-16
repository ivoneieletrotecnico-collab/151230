# Deploy manual das Edge Functions FluxoIA

Copie o conteudo de `supabase/.deploy/functions/` para o servidor self-hosted:

```bash
scp -r supabase/.deploy/functions/* usuario@servidor:/opt/supabase/docker/volumes/functions/
ssh usuario@servidor 'cd /opt/supabase/docker && docker compose restart functions --no-deps'
```

Ou defina no .env:

```
SUPABASE_SSH_HOST=seu.servidor
SUPABASE_SSH_USER=root
SUPABASE_FUNCTIONS_PATH=/opt/supabase/docker/volumes/functions
```

Funcoes: auth, downloads, contact-requests, users
URL base: https://supabase.appsbrasil.store/functions/v1/
