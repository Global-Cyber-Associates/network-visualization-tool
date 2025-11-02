import ctypes
from ctypes import wintypes
import wmi
import os
import time
import requests
import tkinter as tk
from tkinter import messagebox
from dotenv import load_dotenv
import subprocess

# -----------------------------
# Load environment
# -----------------------------
load_dotenv()

API_BASE = os.getenv("API_BASE")
if not API_BASE:
    raise ValueError("❌ Missing API_BASE in .env file!")

API_BASE = API_BASE.rstrip("/") + "/usb"

GENERIC_READ = 0x80000000
GENERIC_WRITE = 0x40000000
FILE_SHARE_READ = 0x00000001
FILE_SHARE_WRITE = 0x00000002
OPEN_EXISTING = 3
IOCTL_DISMOUNT_VOLUME = 0x00090020
IOCTL_STORAGE_EJECT_MEDIA = 0x2D4808

kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)


# -----------------------------
# Core eject helpers
# -----------------------------
def open_volume(drive_letter):
    path = f"\\\\.\\{drive_letter}:"
    handle = kernel32.CreateFileW(
        path,
        GENERIC_READ | GENERIC_WRITE,
        FILE_SHARE_READ | FILE_SHARE_WRITE,
        None,
        OPEN_EXISTING,
        0,
        None,
    )
    if handle == -1:
        raise ctypes.WinError(ctypes.get_last_error())
    return handle


def dismount_and_eject(handle):
    bytes_returned = wintypes.DWORD()
    kernel32.DeviceIoControl(handle, IOCTL_DISMOUNT_VOLUME, None, 0, None, 0, ctypes.byref(bytes_returned), None)
    kernel32.DeviceIoControl(handle, IOCTL_STORAGE_EJECT_MEDIA, None, 0, None, 0, ctypes.byref(bytes_returned), None)
    kernel32.CloseHandle(handle)


def force_eject_drive(drive_letter):
    try:
        subprocess.run(
            ["powershell", "-Command",
             f"(Get-WmiObject Win32_Volume -Filter \"DriveLetter='{drive_letter}:'\").Eject()"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
    except Exception as e:
        print(f"⚠️ Force eject fallback failed: {e}")


# -----------------------------
# Device enumeration
# -----------------------------
def list_usb_drives():
    drives = []
    c = wmi.WMI()
    for disk in c.Win32_DiskDrive(InterfaceType="USB"):
        try:
            for part in disk.associators("Win32_DiskDriveToDiskPartition"):
                for logical in part.associators("Win32_LogicalDiskToPartition"):
                    drives.append({
                        "drive_letter": logical.DeviceID[0],
                        "model": disk.Model,
                        "pnpid": disk.PNPDeviceID.upper()
                    })
        except Exception:
            continue
    return drives


# -----------------------------
# Backend communication
# -----------------------------
def get_approved_list():
    try:
        res = requests.get(f"{API_BASE}/approved", timeout=5)
        if res.status_code == 200:
            return {a["pnpid"] for a in res.json()}
    except Exception as e:
        print(f"⚠️ Failed to fetch approved list: {e}")
    return set()


def send_request_to_backend(username, model, pnpid, drive):
    try:
        data = {"username": username, "model": model, "pnpid": pnpid, "drive": drive}
        res = requests.post(f"{API_BASE}/request", json=data, timeout=5)
        return res.status_code in (200, 400)
    except Exception as e:
        print(f"⚠️ Failed to send request to backend: {e}")
        return False


# -----------------------------
# UI notifications (optional)
# -----------------------------
def notify_revoked(model, drive_letter):
    root = tk.Tk()
    root.withdraw()
    messagebox.showwarning(
        "USB Revoked",
        f"Access revoked by admin for:\n\nModel: {model}\nDrive: {drive_letter}:",
    )
    root.destroy()


# -----------------------------
# Main USB monitor entrypoint
# -----------------------------
def monitor_usb_devices(interval=3):
    print("🔒 USB Blocker Agent started. Monitoring continuously...\n")
    seen_devices = set()
    approved_cache = set()
    USERNAME = os.getlogin()

    while True:
        connected = list_usb_drives()
        current_ids = {usb["pnpid"] for usb in connected}
        approved_now = get_approved_list()
        new_devices = [usb for usb in connected if usb["pnpid"] not in seen_devices]

        # New USBs
        for usb in new_devices:
            print(f"\nDetected: {usb['model']} ({usb['drive_letter']}:)")

            if usb["pnpid"] in approved_now:
                print(f"✔️ Approved USB: {usb['pnpid']}")
                approved_cache.add(usb["pnpid"])
                continue

            # Unauthorized eject
            try:
                handle = open_volume(usb["drive_letter"])
                dismount_and_eject(handle)
                print(f"❌ Unauthorized device ejected: {usb['drive_letter']}:")
            except Exception as e:
                print(f"⚠️ Normal eject failed: {e}. Trying force eject...")
                force_eject_drive(usb["drive_letter"])
                print(f"💥 Force ejection attempted for {usb['drive_letter']}:")
            
            if send_request_to_backend(USERNAME, usb["model"], usb["pnpid"], usb["drive_letter"]):
                print("📤 Approval request sent to backend.")

        # Revoked devices
        for usb in connected:
            if usb["pnpid"] in approved_cache and usb["pnpid"] not in approved_now:
                try:
                    handle = open_volume(usb["drive_letter"])
                    dismount_and_eject(handle)
                    print(f"🚫 Revoked device ejected: {usb['drive_letter']}:")
                    notify_revoked(usb["model"], usb["drive_letter"])
                    approved_cache.discard(usb["pnpid"])
                except Exception as e:
                    print(f"⚠️ Failed eject revoked device: {e}")
                    force_eject_drive(usb["drive_letter"])
                    print(f"💥 Force ejection fallback executed for {usb['drive_letter']}:")

        seen_devices = current_ids
        time.sleep(interval)
