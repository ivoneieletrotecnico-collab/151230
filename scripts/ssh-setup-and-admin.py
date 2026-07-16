#!/usr/bin/env python3
"""SSH: add authorized_keys, configure functions env, restart container. No secret output."""
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
ENV_FILE = ROOT / '.env'

HOST = '76.13.163.185'
USER = 'root'
PASSWORD = os.environ.get('SSH_PASS', '')
PUBLIC_KEY = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICyZqXEAGpEbz48KGxI58gBoZqDFjn5O6SKy/ck+kkdi'
FUNCTIONS_PATH = '/data/coolify/services/trnrt2q82d5v3rygega7jisi/volumes/functions'


def load_dotenv(path: Path) -> dict:
    data = {}
    if not path.exists():
        return data
    for line in path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, _, v = line.partition('=')
        data[k.strip()] = v.strip().strip('"').strip("'")
    return data


def run(client, cmd, label=''):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=180)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    code = stdout.channel.recv_exit_status()
    if label:
        print(f'[{label}] exit={code}')
    if out:
        print(out[:5000])
    if err:
        print('STDERR:', err[:1500])
    return code, out


def redact(key, val):
    if not val:
        return '(empty)'
    if any(x in key for x in ('PASSWORD', 'SECRET', 'KEY', 'TOKEN')):
        return f'(set,len={len(val)})'
    return val[:80]


def main():
    dotenv = load_dotenv(ENV_FILE)
    password = PASSWORD or dotenv.get('SSH_PASS', '')
    if not password:
        print('ERR: SSH password missing')
        sys.exit(1)

    admin_email = dotenv.get('ADMIN_EMAIL') or 'ivoneifs@gmail.com'
    admin_password = dotenv.get('ADMIN_PASSWORD') or 'Miguel151230@#'
    session_secret = dotenv.get('ADMIN_SESSION_SECRET', '')
    service_key = dotenv.get('SUPABASE_SERVICE_ROLE_KEY', '')

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=password, timeout=30, allow_agent=False, look_for_keys=False)
    print(f'OK: SSH {HOST}')

    run(client, 'mkdir -p /root/.ssh && chmod 700 /root/.ssh')
    _, out = run(client, f'grep -F "{PUBLIC_KEY.split()[1]}" /root/.ssh/authorized_keys 2>/dev/null || true')
    if PUBLIC_KEY.split()[1] not in out:
        run(client, f'echo "{PUBLIC_KEY}" >> /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys')
        print('OK: pubkey added')
    else:
        print('OK: pubkey exists')

    _, containers = run(client, "docker ps --format '{{.Names}}'")
    fn_container = ''
    for name in containers.split('\n'):
        if 'function' in name.lower():
            fn_container = name.strip()
            break
    if not fn_container:
        print('ERR: no functions container')
        sys.exit(2)
    print(f'OK: container={fn_container}')

    _, env_out = run(client, f"docker inspect {fn_container} --format '{{{{range .Config.Env}}}}{{{{println .}}}}{{{{end}}}}'")
    env_map = {}
    for line in env_out.split('\n'):
        if '=' in line:
            k, _, v = line.partition('=')
            env_map[k] = v

    for k in sorted(env_map):
        if k.startswith(('ADMIN_', 'SUPABASE_')):
            print(f'  before {k}={redact(k, env_map[k])}')

    updates = {}
    if not env_map.get('ADMIN_EMAIL'):
        updates['ADMIN_EMAIL'] = admin_email
    if not env_map.get('ADMIN_PASSWORD'):
        updates['ADMIN_PASSWORD'] = admin_password
    if not env_map.get('ADMIN_SESSION_SECRET') and session_secret:
        updates['ADMIN_SESSION_SECRET'] = session_secret
    if not env_map.get('SUPABASE_SERVICE_ROLE_KEY') and service_key:
        updates['SUPABASE_SERVICE_ROLE_KEY'] = service_key
    if not env_map.get('SUPABASE_URL'):
        updates['SUPABASE_URL'] = 'http://kong:8000'

    if updates:
        # Locate coolify service dir
        service_dir = '/data/coolify/services/trnrt2q82d5v3rygega7jisi'
        env_path = f'{service_dir}/.env'
        _, existing = run(client, f'test -f {env_path} && cat {env_path} || echo ""')
        lines = [ln for ln in existing.split('\n') if ln.strip()]
        kv = {}
        for ln in lines:
            if '=' in ln and not ln.strip().startswith('#'):
                k, _, v = ln.partition('=')
                kv[k.strip()] = v
        kv.update(updates)
        new_env = '\n'.join(f'{k}={v}' for k, v in sorted(kv.items())) + '\n'
        sftp = client.open_sftp()
        with sftp.file('/tmp/fluxoia-coolify.env', 'w') as f:
            f.write(new_env)
        sftp.close()
        run(client, f'cp {env_path} {env_path}.bak-fluxoia-$(date +%Y%m%d%H%M%S) 2>/dev/null || true')
        run(client, 'cp /tmp/fluxoia-coolify.env ' + env_path)
        print(f'OK: updated {env_path} ({len(updates)} keys)')

        # Recreate only functions service via compose in service dir
        compose = f'{service_dir}/docker-compose.yml'
        run(client, f'test -f {compose} && cd {service_dir} && docker compose up -d --no-deps --force-recreate $(docker compose config --services 2>/dev/null | grep -i function | head -1) 2>&1 || docker restart {fn_container}')
    else:
        run(client, f'docker restart {fn_container}', 'restart')
        print('OK: env complete, restarted')

    run(client, f'ls -la {FUNCTIONS_PATH}/ | head -15', 'functions_list')

    # verify after restart
    import time
    time.sleep(4)
    _, env_after = run(client, f"docker inspect {fn_container} --format '{{{{range .Config.Env}}}}{{{{println .}}}}{{{{end}}}}'")
    env_map2 = {}
    for line in env_after.split('\n'):
        if '=' in line:
            k, _, v = line.partition('=')
            env_map2[k] = v
    for k in sorted(env_map2):
        if k.startswith(('ADMIN_', 'SUPABASE_')):
            print(f'  after {k}={redact(k, env_map2[k])}')

    client.close()
    print('DONE')


if __name__ == '__main__':
    main()
