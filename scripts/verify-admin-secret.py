#!/usr/bin/env python3
"""Verify ADMIN_SESSION_SECRET exists in functions container (no secret output)."""
import paramiko

HOST = '76.13.163.185'
USER = 'root'
PASSWORD = 'Zi8T7wTKM1o@fDbJ'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=30)

def run(cmd):
    _, stdout, stderr = client.exec_command(cmd, timeout=60)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

containers, _ = run('docker ps --format "{{.Names}}"')
names = [line for line in containers.splitlines() if 'function' in line.lower() or 'supabase' in line.lower()]
print('Containers:', names[:8])

fn = next((n for n in names if 'function' in n.lower()), names[0] if names else '')
if not fn:
    print('No functions container found')
    client.close()
    raise SystemExit(1)

print('Using container:', fn)
length, _ = run(f'docker exec {fn} printenv ADMIN_SESSION_SECRET 2>/dev/null | wc -c')
email, _ = run(f'docker exec {fn} printenv ADMIN_EMAIL 2>/dev/null')
print('ADMIN_SESSION_SECRET length:', length.strip(), 'chars (0 = missing)')
print('ADMIN_EMAIL set:', 'yes' if email else 'no')
client.close()
