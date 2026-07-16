#!/usr/bin/env python3
"""Deploy Edge Functions bundle via SSH/SFTP (Coolify self-hosted). No secret output."""
import os
import sys
import time
from pathlib import Path

try:
    import paramiko
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'paramiko', '-q'])
    import paramiko

ROOT = Path(__file__).resolve().parents[1]
BUNDLE_DIR = ROOT / 'supabase' / 'functions-bundle'
HOST = os.environ.get('SUPABASE_SSH_HOST', '76.13.163.185')
USER = os.environ.get('SUPABASE_SSH_USER', 'root')
REMOTE_PATH = os.environ.get(
    'SUPABASE_FUNCTIONS_PATH',
    '/data/coolify/services/trnrt2q82d5v3rygega7jisi/volumes/functions',
)
FUNCTION_NAMES = ['_shared', 'auth', 'downloads', 'contact-requests', 'users']


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


def sftp_upload_dir(sftp, local_dir: Path, remote_dir: str):
    try:
        sftp.stat(remote_dir)
    except OSError:
        sftp.mkdir(remote_dir)

    for item in local_dir.iterdir():
        remote_item = f'{remote_dir}/{item.name}'
        if item.is_dir():
            sftp_upload_dir(sftp, item, remote_item)
        else:
            sftp.put(str(item), remote_item)


def run(client, cmd, label=''):
    _, stdout, stderr = client.exec_command(cmd, timeout=180)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    code = stdout.channel.recv_exit_status()
    if label:
        print(f'[{label}] exit={code}')
    if out:
        print(out[:3000])
    if err:
        print('STDERR:', err[:1000])
    return code, out


def main():
    if not BUNDLE_DIR.exists():
        print('ERR: functions-bundle ausente. Rode deploy-supabase-functions.js ou buildBundle primeiro.')
        sys.exit(1)

    password = load_password()
    if not password:
        print('ERR: SSH password missing (SSH_PASS env ou .env)')
        sys.exit(1)

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=password, timeout=30, allow_agent=False, look_for_keys=False)
    print(f'OK: SSH {HOST}')

    sftp = client.open_sftp()
    for name in FUNCTION_NAMES:
        local = BUNDLE_DIR / name
        if not local.exists():
            print(f'ERR: bundle ausente: {name}')
            sys.exit(2)
        remote = f'{REMOTE_PATH}/{name}'
        print(f'Upload {name} -> {remote}')
        sftp_upload_dir(sftp, local, remote)
    sftp.close()
    print('OK: bundle enviado')

    _, containers = run(client, "docker ps --format '{{.Names}}' | grep -i function | head -1")
    fn_container = containers.split('\n')[0].strip() if containers else ''
    if fn_container:
        run(client, f'docker restart {fn_container}', 'restart')
        time.sleep(4)
        print(f'OK: container reiniciado ({fn_container})')
    else:
        service_dir = '/data/coolify/services/trnrt2q82d5v3rygega7jisi'
        run(client, f'cd {service_dir} && docker compose restart functions 2>&1 || true', 'compose-restart')

    client.close()
    print('DONE: Edge Functions deploy via SSH')


if __name__ == '__main__':
    main()
