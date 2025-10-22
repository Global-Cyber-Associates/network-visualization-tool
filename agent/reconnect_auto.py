import subprocess
import ctypes
import sys
import re

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except Exception:
        return False

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, shell=False)

def get_last_disabled_interface():
    # Try to find the first "Disconnected" interface
    result = run(['netsh', 'interface', 'show', 'interface'])
    if result.returncode != 0:
        print("Failed to list interfaces:", result.stderr)
        sys.exit(1)
    lines = result.stdout.splitlines()
    for line in lines:
        if "Disconnected" in line:
            parts = re.split(r'\s{2,}', line.strip())
            if len(parts) >= 4:
                iface_name = parts[-1]
                return iface_name
    print("No disconnected interface found.")
    sys.exit(1)

def enable_interface(name):
    print(f"Re-enabling interface: {name}")
    res = run(['netsh', 'interface', 'set', 'interface', name, 'enable'])
    if res.returncode == 0:
        print("✅ Interface enabled successfully.")
    else:
        print("❌ Failed to enable interface:", res.stderr.strip())

def main():
    if not is_admin():
        print("⚠️  Run this script as Administrator.")
        sys.exit(1)

    iface = get_last_disabled_interface()
    enable_interface(iface)

if __name__ == "__main__":
    main()
