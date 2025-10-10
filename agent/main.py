# agent/main.py
from functions.ports import scan_ports
from functions.sender import send_scan_results
from functions.system import get_system_info
from functions.network_scan import scan_network  # ← use your existing file
import json

if __name__ == "__main__":
    # --- Port Scan ---
    target_ip = "127.0.0.1"
    port_range = "1-1024"

    print("\n[*] Scanning localhost ports...\n")
    port_results = scan_ports(target_ip, port_range)
    print("[*] Port Scan Results:\n")
    print(port_results)
    send_scan_results(port_results, endpoint_path="ports")

    # --- System Info ---
    print("\n[*] Collecting system information...\n")
    system_data = get_system_info()
    print("[*] System Information:\n")
    print(json.dumps(system_data, indent=2))
    send_scan_results(system_data, endpoint_path="system")

    # --- Network Scan ---
    print("\n[*] Starting network scan...\n")
    network_results = scan_network()   # ← uses auto-detect subnet
    print("[*] Network Scan Results:\n")
    print(json.dumps(network_results, indent=2))
    send_scan_results(network_results, endpoint_path="network-scan")

    print("\n✅ All scan data collected and sent to backend.")
