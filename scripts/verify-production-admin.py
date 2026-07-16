import json
import urllib.request

AUTH = 'https://supabase.appsbrasil.store/functions/v1/auth'
HTML = 'https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/admin.html'

req = urllib.request.Request(AUTH, headers={'Accept': 'application/json'})
with urllib.request.urlopen(req, timeout=30) as resp:
    data = json.loads(resp.read().decode())
    print('API configured:', data.get('configured'))

html = urllib.request.urlopen(HTML, timeout=30).read().decode('utf-8', errors='replace')
checks = {
    'inline api-config': 'api-config.js inline' in html,
    'inline auth v20260716b': '20260716b' in html,
    'no checkAuthSetup': 'checkAuthSetup' not in html,
    'no ADMIN_SESSION_SECRET msg': 'ADMIN_SESSION_SECRET' not in html,
    'no external auth-client.js': 'src="./auth-client.js' not in html,
}
for k, v in checks.items():
    print(f'{k}:', 'OK' if v else 'FAIL')
