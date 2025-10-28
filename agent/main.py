from functions.ports import scan_ports
from functions.sender import send_scan_results
from functions.system import get_system_info
# from functions.network_scan import scan_network
from functions.taskmanager import collect_process_info
from functions.installed_apps import get_installed_apps

import json

if __name__ == "__main__":
    # --- 1. Port Scan ---
    target_ip = "127.0.0.1"
    port_range = "1-1024"

    print("\n[*] Scanning localhost ports...\n")
    port_results = scan_ports(target_ip, port_range)
    print("[*] Port Scan Results:\n", json.dumps(port_results, indent=2))
    send_scan_results(port_results, endpoint_path="ports")

    # --- 2. System Info ---
    print("\n[*] Collecting system information...\n")
    system_data = get_system_info()
    print("[*] System Information:\n", json.dumps(system_data, indent=2))
    send_scan_results(system_data, endpoint_path="system")

    # Extract deviceId
    device_id = system_data.get("machine_id") or system_data.get("hostname") or "unknown-device"

<<<<<<< HEAD
    #--- 3. Installed Apps Data ---
    print("\n[*] Collecting installed applications...\n")
    apps = get_installed_apps()
    send_scan_results({"deviceId": device_id, "applications": apps}, endpoint_path="installed-apps")
=======
    # --- 3. Network Scan ---
    # print("\n[*] Starting network scan...\n")
    # network_results = scan_network()
    # print("[*] Network Scan Results:\n", json.dumps(network_results, indent=2))
    # send_scan_results(network_results, endpoint_path="network-scan")
>>>>>>> 7be118d587a8453d5027fabb8b677f953ea805e9

    # # --- 4. Task Manager Data ---
    # print("\n[*] Collecting task manager data...\n")
    # task_data = collect_process_info()
    # applications = task_data.get("applications", [])
    # background_processes = task_data.get("background_processes", [])




    # task_payload = {
    #     "deviceId": device_id,
    #     "applications": applications,
    #     "background_processes": background_processes
    # }

    # print("[*] Task Manager Data Payload:\n", json.dumps(task_payload, indent=2))
    # send_scan_results(task_payload, endpoint_path="tasks")

    print("\n✅ All scan data collected and sent to backend.")
