#!/usr/bin/env python3
"""
disconnect_windows.py
Disable (disconnect) a Windows network interface.

Usage:
  python disconnect_windows.py                 -> shows interfaces and prompts
  python disconnect_windows.py --iface "Wi-Fi" -> disables the named interface (no prompt)

Must be run as Administrator.
"""

import subprocess
import sys
import re
import argparse
import ctypes

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except Exception:
        return False

def run(cmd):
    # run list commands quietly and return result
    proc = subprocess.run(cmd, capture_output=True, text=True, shell=False)
    return proc

def list_interfaces():
    # netsh output sample columns: Admin State    State          Type             Interface Name
    res = run(['netsh', 'interface', 'show', 'interface'])
    if res.returncode != 0:
        print("Failed to list interfaces:", res.stderr.strip())
        sys.exit(1)
    lines = res.stdout.splitlines()
    # skip header lines until header found
    start = 0
    for i, line in enumerate(lines):
        if re.search(r'Admin State', line, re.I):
            start = i + 1
            break
    entries = []
    for line in lines[start:]:
        line = line.strip()
        if not line:
            continue
        # split by 2+ spaces so interface names with spaces are preserved
        cols = re.split(r'\s{2,}', line)
        # expect at least 4 columns, last is interface name
        if len(cols) >= 4:
            admin_state, state, typ, name = cols[0], cols[1], cols[2], '  '.join(cols[3:])
        elif len(cols) == 3:
            admin_state, state, name = cols[0], cols[1], cols[2]
            typ = ''
        else:
            # fallback: whole line as name
            admin_state = state = typ = ''
            name = line
        entries.append({
            'name': name.strip(),
            'admin_state': admin_state.strip(),
            'state': state.strip(),
            'type': typ.strip()
        })
    return entries

def disable_interface(name):
    print(f"Disabling interface: {name!r}")
    # Using netsh to disable
    res = run(['netsh', 'interface', 'set', 'interface', name, 'disable'])
    if res.returncode == 0:
        print("Success. Interface disabled.")
    else:
        print("Command failed. stderr:", res.stderr.strip())
        # try PowerShell fallback (best-effort)
        try:
            print("Attempting PowerShell fallback (Disable-NetAdapter)...")
            ps_cmd = ['powershell', '-Command', f"Disable-NetAdapter -Name \"{name}\" -Confirm:$false"]
            res2 = run(ps_cmd)
            if res2.returncode == 0:
                print("PowerShell fallback succeeded.")
            else:
                print("PowerShell fallback failed. stderr:", res2.stderr.strip())
        except Exception as e:
            print("Fallback failed:", e)

def main():
    if not is_admin():
        print("This script must be run as Administrator. Right-click the console and 'Run as Administrator'.")
        sys.exit(1)

    parser = argparse.ArgumentParser(description="Disable a Windows network interface")
    parser.add_argument('--iface', '-i', help='Interface name (e.g. "Wi-Fi" or "Ethernet")')
    args = parser.parse_args()

    entries = list_interfaces()
    if not entries:
        print("No interfaces found. Exiting.")
        sys.exit(1)

    if args.iface:
        # find best match
        chosen = None
        for e in entries:
            if e['name'].lower() == args.iface.lower():
                chosen = e['name']
                break
        if not chosen:
            # fuzzy match
            for e in entries:
                if args.iface.lower() in e['name'].lower():
                    chosen = e['name']
                    break
        if not chosen:
            print("Interface not found. Available interfaces:")
            for idx, e in enumerate(entries, 1):
                print(f"{idx}. {e['name']}  (Admin: {e['admin_state']}  State: {e['state']})")
            sys.exit(1)
        disable_interface(chosen)
    else:
        print("Available network interfaces:")
        for idx, e in enumerate(entries, 1):
            print(f"{idx}. {e['name']}  (Admin: {e['admin_state']}  State: {e['state']})")
        try:
            sel = int(input("Enter the number of the interface to disable (0 to cancel): ").strip())
        except Exception:
            print("Invalid input. Exiting.")
            sys.exit(1)
        if sel <= 0 or sel > len(entries):
            print("Cancelled.")
            sys.exit(0)
        chosen = entries[sel-1]['name']
        disable_interface(chosen)

if __name__ == '__main__':
    main()
