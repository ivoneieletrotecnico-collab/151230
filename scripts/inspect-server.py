#!/usr/bin/env python3
"""Inspect Coolify/proxy config on server. No secret output."""
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
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err


def main():
    password = load_password()
    if not password:
        print('ERR: SSH password missing (SSH_PASS env or .env)')
        sys.exit(1)

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=password, timeout=30, allow_agent=False, look_for_keys=False)
    print(f'OK: connected {HOST}')

    commands = [
        "docker ps --format '{{.Names}}' | head -40",
        "docker ps --format '{{.Names}}' | grep -i function || true",
        "ls -la /data/coolify/proxy/dynamic 2>/dev/null || ls -la /data/coolify/proxy 2>/dev/null || echo 'no proxy dir'",
        "grep -rl fluxoia /data/coolify 2>/dev/null | head -20 || true",
        "grep -rl fluxoia /etc/nginx 2>/dev/null | head -10 || true",
        "test -d /root/fluxoia-fixes && ls -la /root/fluxoia-fixes || echo 'no fluxoia-fixes dir'",
        "curl -sI http://127.0.0.1:8000/storage/v1/object/public/fluxoia-site/index.html | head -5 || true",
    ]

    for cmd in commands:
        print(f'\n=== {cmd}')
        out, err = run(client, cmd)
        if out:
            print(out[:4000])
        if err:
            print('STDERR:', err[:800])

    client.close()


if __name__ == '__main__':
    main()
