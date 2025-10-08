import json
from nmap import PortScanner

def scan_ports(target="127.0.0.1", port_range="1-65535"):
    """
    Scan ports and return list of open ports with service info as JSON.
    """
    nm = PortScanner()
    nm.scan(target, port_range, arguments="-sV")
    results = []

    for host in nm.all_hosts():
        for proto in nm[host].all_protocols():
            ports = nm[host][proto].keys()
            for port in sorted(ports):
                port_info = nm[host][proto][port]
                results.append({
                    "port": port,
                    "protocol": proto,
                    "state": port_info.get("state"),
                    "service": port_info.get("name"),
                    "service_version": " ".join(
                        filter(None, [port_info.get("product"), port_info.get("version")])
                    ) or None
                })
    return json.dumps(results, indent=2)
