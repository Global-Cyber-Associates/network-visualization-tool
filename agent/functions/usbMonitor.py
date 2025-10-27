import ctypes
from ctypes import wintypes
import wmi
import os
import time
import requests
import tkinter as tk
from tkinter import messagebox

# -----------------------------
# Windows API constants
# -----------------------------
GENERIC_READ = 0x80000000
GENERIC_WRITE = 0x40000000
FILE_SHARE_READ = 0x00000001
FILE_SHARE_WRITE = 0x00000002
OPEN_EXISTING = 3

IOCTL_DISMOUNT_VOLUME = 0x00090020
IOCTL_STORAGE_EJECT_MEDIA = 0x2D4808

kernel32 = ctypes.WinDLL('kernel32', use_last_error=True)

# -----------------------------
# Functions
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
        None
    )
    if handle == -1:
        raise ctypes.WinError(ctypes.get_last_error())
    return handle

def dismount_and_eject(handle):
    bytes_returned = wintypes.DWORD()
    kernel32.DeviceIoControl(handle, IOCTL_DISMOUNT_VOLUME, None, 0, None, 0, ctypes.byref(bytes_returned), None)
    kernel32.DeviceIoControl(handle, IOCTL_STORAGE_EJECT_MEDIA, None, 0, None, 0, ctypes.byref(bytes_returned), None)
    kernel32.CloseHandle(handle)

def list_usb_drives():
    c = wmi.WMI()
    drives = []
    for disk in c.Win32_DiskDrive(InterfaceType="USB"):
        for partition in disk.associators("Win32_DiskDriveToDiskPartition"):
            for logical in partition.associators("Win32_LogicalDiskToPartition"):
                drives.append({
                    "drive_letter": logical.DeviceID[0],
                    "model": disk.Model,
                    "pnpid": disk.PNPDeviceID.upper()
                })
    return drives

# -----------------------------
# Backend communication
# -----------------------------
API_BASE = "http://localhost:5000/api/usb"  # Backend USB API

def send_request_to_backend(username, model, pnpid, drive):
    try:
        data = {"username": username, "model": model, "pnpid": pnpid, "drive": drive}
        res = requests.post(f"{API_BASE}/request", json=data)
        return res.status_code in (200, 400)
    except Exception as e:
        print(f"⚠️ Failed to send request to backend: {e}")
        return False

def is_approved(pnpid):
    try:
        res = requests.get(f"{API_BASE}/approved")
        if res.status_code == 200:
            approved = res.json()
            return any(a['pnpid'] == pnpid for a in approved)
    except Exception as e:
        print(f"⚠️ Failed to check approval status: {e}")
    return False

# -----------------------------
# Notification popup
# -----------------------------
def notify_approval(model, drive_letter, pnpid):
    root = tk.Tk()
    root.withdraw()
    msg = (
        f"USB Approved by Admin!\n\n"
        f"Model: {model}\n"
        f"⚠️ Please unplug and re-insert the device."
    )
    messagebox.showinfo("USB Approved", msg)
    root.destroy()

# -----------------------------
# Main Monitor Loop
# -----------------------------
print("🔒 USB Blocker Agent started. Monitoring continuously...\n")
seen_devices = set()
USERNAME = os.getlogin()  # or set manually

while True:
    usb_drives = list_usb_drives()
    current_ids = {usb['pnpid'] for usb in usb_drives}

    new_devices = [usb for usb in usb_drives if usb['pnpid'] not in seen_devices]

    for usb in new_devices:
        print(f"\nDetected new USB: {usb['model']} ({usb['pnpid']}) at {usb['drive_letter']}:")

        # ✅ Check if already approved
        if is_approved(usb['pnpid']):
            print(f"✔️ USB {usb['pnpid']} is already approved. Skipping request.")
            continue

        # ❌ Block unauthorized USB immediately
        try:
            handle = open_volume(usb['drive_letter'])
            dismount_and_eject(handle)
            print(f"❌ Unauthorized USB {usb['pnpid']} removed.")
        except Exception as e:
            print(f"⚠️ Failed to remove: {e}")

        # 📤 Send request for approval
        if send_request_to_backend(USERNAME, usb['model'], usb['pnpid'], usb['drive_letter']):
            print(f"📤 Request sent to backend for approval.")

            # ⏳ Poll until approved
            while not is_approved(usb['pnpid']):
                print(f"⏳ Waiting for backend approval for {usb['pnpid']}...")
                time.sleep(3)

            # ✅ Approved
            print(f"✔️ USB {usb['pnpid']} approved by backend.")
            notify_approval(usb['model'], usb['drive_letter'], usb['pnpid'])

    seen_devices = current_ids
    time.sleep(3)
