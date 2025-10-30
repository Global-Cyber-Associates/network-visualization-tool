import subprocess

def block_outbound():
    try:
        # Add a rule to block all outbound connections
        subprocess.run([
            "netsh", "advfirewall", "firewall", "add", "rule",
            "name=BlockOutboundAll",
            "dir=out", "action=block", "enable=yes"
        ], check=True)
        print("[+] All outbound connections blocked.")
    except subprocess.CalledProcessError:
        print("[-] Failed to block outbound traffic. Try running as Administrator.")

if __name__ == "__main__":
    block_outbound()
