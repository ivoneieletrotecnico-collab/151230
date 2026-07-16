#!/usr/bin/env python3
"""Read server config files. No secret output."""
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
HOST = '76.13.163.185'
USER = 'root'


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


def run(client, cmd):
    _, stdout, stderr = client.exec_command(cmd, timeout=120)
    return stdout.read().decode('utf-8', errors='replace').strip()


def main():
    password = load_password()
    if not password:
        print('ERR: SSH password missing')
        sys.exit(1)

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=password, timeout=30, allow_agent=False, look_for_keys=False)

    files = [
        '/root/fluxoia-fixes/allow-storage-html.sh',
        '/data/coolify/proxy/dynamic/coolify.yaml',
        '/data/coolify/proxy/dynamic/default_redirect_503.yaml',
    ]
    for path in files:
        print(f'\n===== {path} =====')
        print(run(client, f'cat {path} 2>/dev/null || echo MISSING'))

    print('\n===== grep appsbrasil in proxy =====')
    print(run(client, "grep -r appsbrasil /data/coolify/proxy 2>/dev/null || true"))

    print('\n===== supabase service labels =====')
    print(run(client, "docker inspect supabase-kong-trnrt2q82d5v3rygega7jisi --format '{{json .Config.Labels}}' 2>/dev/null | python3 -m json.tool 2>/dev/null || docker inspect supabase-kong-trnrt2q82d5v3rygega7jisi --format '{{range $k,$v := .Config.Labels}}{{$k}}={{$v}}\n{{end}}'"))

    client.close()


if __name__ == '__main__':
    main()
