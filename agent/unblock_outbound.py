import subprocess

def unblock_outbound():
    try:
        # Remove the outbound block rule
        subprocess.run([
            "netsh", "advfirewall", "firewall", "delete", "rule",
            "name=BlockOutboundAll"
        ], check=True)
        print("[+] Outbound connections restored.")
    except subprocess.CalledProcessError:
        print("[-] Failed to remove outbound block rule. Try running as Administrator.")

if __name__ == "__main__":
    unblock_outbound()
