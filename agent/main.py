# main.py
from functions.ports import scan_ports
from functions.sender import send_scan_results
from functions.system import get_system_info
import json

if __name__ == "__main__":
    # --- Port scan ---
    target_ip = "127.0.0.1"
    port_range = "1-1024"

    print("\n[*] Scanning localhost, please wait...\n")
    port_results = scan_ports(target_ip, port_range)
    print("[*] Port Scan Results:\n")
    print(port_results)

    send_scan_results(port_results, endpoint_path="ports")

    # --- System info ---
    print("\n[*] Collecting system information...\n")
    system_data = get_system_info()
    system_json = json.dumps(system_data, indent=2)
    print("[*] System Information:\n")
    print(system_json)

    send_scan_results(system_data, endpoint_path="system")
