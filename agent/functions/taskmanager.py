import psutil
import win32gui
import win32process
import time
import requests
from functions.system import get_system_info
import os

BASE_API_URL = os.getenv("API_BASE_URL", "http://localhost:5000/api")


def get_visible_windows():
    """Return a list of visible top-level application windows."""
    apps = []

    def callback(hwnd, _):
        if win32gui.IsWindowVisible(hwnd) and win32gui.GetWindowText(hwnd):
            _, pid = win32process.GetWindowThreadProcessId(hwnd)
            apps.append((pid, win32gui.GetWindowText(hwnd)))
        return True

    win32gui.EnumWindows(callback, None)
    return apps


def get_background_processes():
    """Return background processes (without visible windows)."""
    visible_pids = {pid for pid, _ in get_visible_windows()}
    bg_processes = []
    for proc in psutil.process_iter(['pid', 'name']):
        pid = proc.info['pid']
        name = proc.info['name']
        if pid not in visible_pids and name:
            bg_processes.append((pid, name))
    return bg_processes


def collect_process_info():
    """Collect applications and background processes with CPU & memory info."""
    # initialize CPU counters
    for proc in psutil.process_iter():
        try:
            proc.cpu_percent(interval=None)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    time.sleep(1)  # measure over 1 second

    output = {"applications": [], "background_processes": []}

    # Applications (visible windows)
    for pid, title in get_visible_windows():
        try:
            proc = psutil.Process(pid)
            name = proc.name()
            if not name:
                continue
            output["applications"].append({
                "pid": pid,
                "name": name,
                "title": title,
                "cpu": proc.cpu_percent(),
                "memory": round(proc.memory_percent(), 2)
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    # Background processes
    for pid, name in get_background_processes():
        try:
            proc = psutil.Process(pid)
            if not name:
                continue
            output["background_processes"].append({
                "pid": pid,
                "name": name,
                "cpu": proc.cpu_percent(),
                "memory": round(proc.memory_percent(), 2)
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    return output


def send_tasks(data):
    """Send collected task data to backend API with dynamic device ID."""
    system_info = get_system_info()
    device_id = system_info.get("machine_id") or system_info.get("hostname") or "unknown-device"

    payload = {
        "deviceId": device_id,
        "applications": data["applications"],
        "background_processes": data["background_processes"]
    }

    url = f"{BASE_API_URL}/tasks"
    try:
        response = requests.post(url, json=payload, timeout=15)
        response.raise_for_status()
        print(f"[+] Task data successfully sent to {url}")
    except requests.exceptions.RequestException as e:
        print(f"[!] Failed to send task data to {url}: {e}")


if __name__ == "__main__":
    tasks = collect_process_info()
    send_tasks(tasks)
