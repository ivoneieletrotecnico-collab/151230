#!/usr/bin/env python3
"""Fix Traefik network connectivity for fluxoia proxy."""
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
KONG = 'supabase-kong-trnrt2q82d5v3rygega7jisi'
PROXY = 'coolify-proxy'


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
        print(out[:3000])
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

    _, nets = run(client, f"docker inspect {KONG} --format '{{{{json .NetworkSettings.Networks}}}}'")
    print('Kong networks:', nets[:500])

    # Connect proxy to all kong networks
    run(client, f"docker inspect {KONG} --format '{{{{range $k,$v := .NetworkSettings.Networks}}}}{{$k}}\\n{{{{end}}}}' | while read net; do docker network connect \"$net\" {PROXY} 2>/dev/null || true; done", 'connect-all')

    # Test connectivity from proxy to kong:8000
    run(client, f'docker exec {PROXY} wget -qO- --timeout=5 http://{KONG}:8000/storage/v1/object/public/fluxoia-site/index.html 2>&1 | head -c 200 || docker exec {PROXY} curl -sI --max-time 5 http://{KONG}:8000/storage/v1/object/public/fluxoia-site/index.html | head -5', 'proxy-to-kong')

    # Test external
    run(client, 'curl -sI --max-time 10 https://fluxoia.appsbrasil.store/ | head -8', 'external-test')
    run(client, 'curl -sI --max-time 10 https://supabase.appsbrasil.store/storage/v1/object/public/fluxoia-site/index.html | head -8', 'storage-direct')

    client.close()


if __name__ == '__main__':
    main()
