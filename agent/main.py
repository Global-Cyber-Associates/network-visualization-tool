from functions.ports import scan_ports
from functions.sender import send_scan_results, set_base_api_url
from functions.system import get_system_info
from functions.taskmanager import collect_process_info
from functions.installed_apps import get_installed_apps
import json
import os

if __name__ == "__main__":
    # Load optional API override
    api_url = os.getenv("API_BASE_URL", "http://localhost:5000/api")
    set_base_api_url(api_url)

    target_ip = "127.0.0.1"
    port_range = "1-1024"

    print("\n[*] Scanning localhost ports...\n")
    port_results = scan_ports(target_ip, port_range)
    print("[*] Port Scan Results:\n", json.dumps(port_results, indent=2))
    send_scan_results(port_results, endpoint_path="ports")

    print("\n[*] Collecting system information...\n")
    system_data = get_system_info()
    print("[*] System Information:\n", json.dumps(system_data, indent=2))
    send_scan_results(system_data, endpoint_path="system")

    device_id = system_data.get("machine_id") or system_data.get("hostname") or "unknown-device"

    print("\n[*] Collecting installed applications...\n")
    apps = get_installed_apps()
    send_scan_results({"deviceId": device_id, "applications": apps}, endpoint_path="installed-apps")

    print("\n[*] Collecting task manager data...\n")
    task_data = collect_process_info()
    applications = task_data.get("applications", [])
    background_processes = task_data.get("background_processes", [])
    task_payload = {
        "deviceId": device_id,
        "applications": applications,
        "background_processes": background_processes
    }
    print("[*] Task Manager Data Payload:\n", json.dumps(task_payload, indent=2))
    send_scan_results(task_payload, endpoint_path="tasks")

    print("\n✅ All scan data collected and sent to backend.")
