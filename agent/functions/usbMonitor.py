# functions/usbMonitor.py
import time
import psutil
from typing import List, Dict, Callable, Optional

connected_devices = set()

def get_usb_devices_once() -> Dict[str, List[str]]:
    """
    Return a snapshot of currently connected removable devices as:
    {"connected_devices": [device_paths...]}
    """
    devices = []
    try:
        devices = [d.device for d in psutil.disk_partitions(all=False) if "removable" in getattr(d, "opts", "")]
    except Exception:
        # Fallback: on Windows opts may not include 'removable' reliably; attempt simple drive-letter check
        try:
            devices = [d.device for d in psutil.disk_partitions(all=False)]
        except Exception:
            devices = []
    return {"connected_devices": devices}

def monitor_usb_devices(callback: Optional[Callable[[Dict], None]] = None, interval: float = 3.0):
    """
    Long-running monitor that detects added/removed removable devices.
    - callback: optional callable that will be invoked with {"added": [...], "removed":[...], "snapshot": [...]}
      If callback is None, the function yields the same dict each time a change is detected.
    - interval: seconds between polls
    Usage:
      - With callback: monitor_usb_devices(lambda d: print(d))
      - As generator: for change in monitor_usb_devices_generator(): handle(change)
    NOTE: This function does NOT send data anywhere; caller handles sending.
    """
    global connected_devices
    try:
        connected_devices = set(get_usb_devices_once().get("connected_devices", []))
    except Exception:
        connected_devices = set()

    if callback:
        while True:
            try:
                snapshot = set(get_usb_devices_once().get("connected_devices", []))
                added = list(snapshot - connected_devices)
                removed = list(connected_devices - snapshot)
                if added or removed:
                    payload = {"added": added, "removed": removed, "snapshot": list(snapshot)}
                    try:
                        callback(payload)
                    except Exception:
                        pass
                connected_devices.clear()
                connected_devices.update(snapshot)
                time.sleep(interval)
            except Exception:
                time.sleep(interval)
    else:
        # generator-style
        while True:
            snapshot = set(get_usb_devices_once().get("connected_devices", []))
            added = list(snapshot - connected_devices)
            removed = list(connected_devices - snapshot)
            if added or removed:
                payload = {"added": added, "removed": removed, "snapshot": list(snapshot)}
                connected_devices.clear()
                connected_devices.update(snapshot)
                yield payload
            time.sleep(interval)
