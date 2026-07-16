#!/usr/bin/env python3
"""Configure fluxoia.appsbrasil.store -> Supabase Storage via Traefik (Coolify proxy)."""
import os
import sys
from pathlib import Path

try:
    import paramiko
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'paramiko', '-q'])
    import paramiko

ROOT = Path(__file__).resolve().parents[1]
HOST = os.environ.get('SUPABASE_SSH_HOST', '76.13.163.185')
USER = os.environ.get('SUPABASE_SSH_USER', 'root')
KONG_CONTAINER = 'supabase-kong-trnrt2q82d5v3rygega7jisi'
PROXY_CONTAINER = 'coolify-proxy'
PROXY_FILE = '/data/coolify/proxy/dynamic/fluxoia-site.yaml'

FLUXOIA_TRAEFIK = """# FluxoIA site — URLs amigáveis via proxy para Supabase Storage (gerenciado por scripts/setup-fluxoia-proxy.py)
http:
  routers:
    fluxoia-http:
      entryPoints:
        - http
      rule: Host(`fluxoia.appsbrasil.store`)
      middlewares:
        - redirect-to-https
      service: fluxoia-kong
    fluxoia-https-root:
      entryPoints:
        - https
      rule: Host(`fluxoia.appsbrasil.store`) && Path(`/`)
      middlewares:
        - fluxoia-to-index
        - gzip
      service: fluxoia-kong
      tls:
        certresolver: letsencrypt
      priority: 300
    fluxoia-https-admin:
      entryPoints:
        - https
      rule: Host(`fluxoia.appsbrasil.store`) && (Path(`/admin`) || Path(`/admin/`))
      middlewares:
        - fluxoia-to-admin
        - gzip
      service: fluxoia-kong
      tls:
        certresolver: letsencrypt
      priority: 300
    fluxoia-https-painel:
      entryPoints:
        - https
      rule: Host(`fluxoia.appsbrasil.store`) && (Path(`/painel`) || Path(`/painel/`))
      middlewares:
        - fluxoia-to-painel
        - gzip
      service: fluxoia-kong
      tls:
        certresolver: letsencrypt
      priority: 300
    fluxoia-https-downloads:
      entryPoints:
        - https
      rule: Host(`fluxoia.appsbrasil.store`) && (Path(`/downloads`) || Path(`/downloads/`))
      middlewares:
        - fluxoia-to-downloads
        - gzip
      service: fluxoia-kong
      tls:
        certresolver: letsencrypt
      priority: 300
    fluxoia-https-assets:
      entryPoints:
        - https
      rule: Host(`fluxoia.appsbrasil.store`)
      middlewares:
        - fluxoia-storage-prefix
        - gzip
      service: fluxoia-kong
      tls:
        certresolver: letsencrypt
      priority: 100
  middlewares:
    fluxoia-to-index:
      replacePath:
        path: /storage/v1/object/public/fluxoia-site/index.html
    fluxoia-to-admin:
      replacePath:
        path: /storage/v1/object/public/fluxoia-site/admin.html
    fluxoia-to-painel:
      replacePath:
        path: /storage/v1/object/public/fluxoia-site/painel.html
    fluxoia-to-downloads:
      replacePath:
        path: /storage/v1/object/public/fluxoia-site/downloads.html
    fluxoia-storage-prefix:
      replacePathRegex:
        regex: "^/(.*)$"
        replacement: "/storage/v1/object/public/fluxoia-site/${1}"
  services:
    fluxoia-kong:
      loadBalancer:
        servers:
          - url: http://""" + KONG_CONTAINER + """:8000
"""


def load_password() -> str:
    password = os.environ.get('SSH_PASS', '')
    if password:
        return password
    env_file = ROOT / '.env'
    if env_file.exists():
        for line in env_file.read_text(encoding='utf-8').splitlines():
            if line.startswith('SSH_PASS='):
                return line.split('=', 1)[1].strip().strip('"').strip("'")
    return ''


def run(client, cmd, label=''):
    _, stdout, stderr = client.exec_command(cmd, timeout=120)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    code = stdout.channel.recv_exit_status()
    if label:
        print(f'[{label}] exit={code}')
    if out:
        print(out[:2000])
    if err:
        print('STDERR:', err[:800])
    return code, out


def main():
    password = load_password()
    if not password:
        print('ERR: SSH password missing')
        sys.exit(1)

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=password, timeout=30, allow_agent=False, look_for_keys=False)
    print(f'OK: SSH {HOST}')

    # Patch storage HTML Content-Type if needed
    run(client, 'bash /root/fluxoia-fixes/allow-storage-html.sh 2>&1 || true', 'storage-patch')

    # Ensure coolify-proxy can reach Kong on the Supabase network
    run(
        client,
        f"docker inspect {KONG_CONTAINER} --format '{{{{range $k,$v := .NetworkSettings.Networks}}}}{{$k}}\\n{{{{end}}}}' "
        f"| while read net; do docker network connect \"$net\" {PROXY_CONTAINER} 2>/dev/null || true; done",
        'network-connect',
    )

    sftp = client.open_sftp()
    with sftp.file('/tmp/fluxoia-site.yaml', 'w') as remote:
        remote.write(FLUXOIA_TRAEFIK)
    sftp.close()
    run(client, f'cp /tmp/fluxoia-site.yaml {PROXY_FILE}')
    print(f'OK: {PROXY_FILE} escrito')

    client.close()
    print('OK: proxy fluxoia.appsbrasil.store configurado (Traefik recarrega automaticamente)')


if __name__ == '__main__':
    main()
