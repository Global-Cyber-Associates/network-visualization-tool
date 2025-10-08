# system_basic.py
import platform
import psutil
import socket
import uuid
import json
from typing import Dict, Any, Optional

def get_system_info() -> Dict[str, Any]:
    """
    Return basic system info:
    - hostname
    - OS type and version
    - CPU cores
    - RAM
    - Disk storage
    - Current user
    """
    # Host and OS
    hostname = socket.gethostname()
    os_type = platform.system()
    os_version = platform.version()
    os_release = platform.release()

    # CPU
    cpu_info = {
        "physical_cores": psutil.cpu_count(logical=False),
        "logical_cores": psutil.cpu_count(logical=True),
        "cpu_freq_mhz": psutil.cpu_freq().current if psutil.cpu_freq() else None,
    }

    # Memory
    vm = psutil.virtual_memory()
    memory_info = {
        "total_ram": vm.total,
        "available_ram": vm.available,
        "used_ram": vm.used,
        "ram_percent": vm.percent,
    }

    # Disk
    disk_info = {}
    for part in psutil.disk_partitions(all=False):
        usage = psutil.disk_usage(part.mountpoint)
        disk_info[part.device] = {
            "mountpoint": part.mountpoint,
            "fstype": part.fstype,
            "total": usage.total,
            "used": usage.used,
            "free": usage.free,
            "percent": usage.percent,
        }

    # Users
    users = [u.name for u in psutil.users()]

    # Machine ID
    machine_id = str(uuid.getnode())

    info: Dict[str, Any] = {
        "hostname": hostname,
        "os_type": os_type,
        "os_version": os_version,
        "os_release": os_release,
        "cpu": cpu_info,
        "memory": memory_info,
        "disk": disk_info,
        "users": users,
        "machine_id": machine_id,
    }

    return info

def system_info_json(obj: Optional[Dict[str, Any]] = None, indent: int = 2) -> str:
    if obj is None:
        obj = get_system_info()
    return json.dumps(obj, indent=indent, default=str)
