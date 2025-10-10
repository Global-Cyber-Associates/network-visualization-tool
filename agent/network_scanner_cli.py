#!/usr/bin/env python3
"""
network_scanner_cli.py

Usage:
  python network_scanner_cli.py            # interactive / auto detect
  python network_scanner_cli.py --auto     # auto-select interface
  python network_scanner_cli.py --network 192.168.1.0/24
  python network_scanner_cli.py --update-vendors  # refresh mac-vendor DB first
"""

import argparse
import ipaddress
import platform
import re
import socket
import sys
from collections import OrderedDict
from concurrent.futures import ThreadPoolExecutor, as_completed

# network / iface detection
try:
    import netifaces
except Exception:
    sys.exit("netifaces required. Install with: pip install netifaces")

# scapy
try:
    from scapy.all import ARP, Ether, srp, conf, sr1, ICMP
except Exception:
    sys.exit("scapy required. Install with: pip install scapy")

# mac vendor lookup (optional)
try:
    from mac_vendor_lookup import MacLookup
    MACLOOKUP_AVAILABLE = True
except Exception:
    MACLOOKUP_AVAILABLE = False

# ---------- Vendor lookup helpers ----------
_mac_lookup = None
_vendor_cache = {}

def normalize_mac(mac):
    """Normalize MAC to form 'aa:bb:cc:dd:ee:ff' (lowercase). Accepts bytes or strings."""
    if mac is None:
        return None
    if isinstance(mac, bytes):
        try:
            mac = mac.decode()
        except Exception:
            mac = ''.join(f"{b:02x}" for b in mac)
    mac = str(mac).strip()
    if mac == "":
        return None
    # If contains separators, normalize them
    if re.search(r'[:\-]', mac):
        parts = re.split(r'[:\-]', mac)
        if len(parts) == 6:
            return ":".join(p.zfill(2).lower() for p in parts)
    # Remove non-hex chars
    hexonly = re.sub(r'[^0-9a-fA-F]', '', mac)
    if len(hexonly) == 12:
        parts = [hexonly[i:i+2] for i in range(0, 12, 2)]
        return ":".join(p.lower() for p in parts)
    # fallback: lowercase raw
    return mac.lower()

def safe_vendor_lookup(mac):
    """Return vendor string or 'Unknown' and never raise. Uses an in-memory cache."""
    mac_n = normalize_mac(mac)
    if not mac_n:
        return "Unknown"
    if mac_n in _vendor_cache:
        return _vendor_cache[mac_n]
    vendor = "Unknown"
    if MACLOOKUP_AVAILABLE:
        global _mac_lookup
        try:
            if _mac_lookup is None:
                _mac_lookup = MacLookup()
            vendor = _mac_lookup.lookup(mac_n)
        except Exception:
            vendor = "Unknown"
    _vendor_cache[mac_n] = vendor
    return vendor

# ---------- Interface & network detection ----------
def auto_select_iface_and_network():
    """Return (iface_name, ip, netmask, network_cidr) or (None, None, None, None)."""
    for iface in netifaces.interfaces():
        addrs = netifaces.ifaddresses(iface)
        if netifaces.AF_INET in addrs:
            for entry in addrs[netifaces.AF_INET]:
                ip = entry.get("addr")
                netmask = entry.get("netmask")
                if not ip:
                    continue
                if ip.startswith("127.") or ip.startswith("169.254."):
                    continue
                try:
                    network = ipaddress.IPv4Network(f"{ip}/{netmask}", strict=False)
                except Exception:
                    continue
                return iface, ip, netmask, str(network)
    return None, None, None, None

# ---------- Scans ----------
def arp_scan(network_cidr, iface=None, timeout=2):
    """Perform ARP scan, return dict ip->mac (mac normalized)."""
    print(f"[*] Attempting ARP scan on {network_cidr} (iface={iface}) ...")
    packet = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=str(network_cidr))
    kwargs = {"timeout": timeout, "verbose": False}
    # conf.iface may be needed for windows; try to set it but catch errors
    if iface:
        try:
            conf.iface = iface
            kwargs["iface"] = iface
        except Exception:
            # don't fail; let srp try default
            pass
    try:
        answered = srp(packet, **kwargs)[0]
    except Exception as e:
        raise RuntimeError(f"ARP srp error: {e}")
    result = {}
    for sent, received in answered:
        ip = received.psrc
        mac = normalize_mac(received.hwsrc)
        result[ip] = mac
    return result

def ping_host(ip, timeout=1):
    """Ping a single host; returns True if ping responds. cross-platform wrapper."""
    param = "-n" if platform.system().lower() == "windows" else "-c"
    # On Windows -w uses ms, on Linux -W uses seconds; use best-effort
    if platform.system().lower() == "windows":
        cmd = ["ping", param, "1", "-w", str(int(timeout*1000)), ip]
    else:
        cmd = ["ping", param, "1", "-W", str(max(1, int(timeout)) ), ip]
    import subprocess
    try:
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return res.returncode == 0
    except Exception:
        return False

def ping_sweep(network_cidr, max_workers=200, timeout=0.5):
    """Ping all hosts in network concurrently; return list of ips that replied."""
    print(f"[*] Running ICMP ping sweep on {network_cidr} ...")
    alive = []
    net = ipaddress.IPv4Network(network_cidr, strict=False)
    with ThreadPoolExecutor(max_workers=max_workers) as exe:
        futures = {exe.submit(ping_host, str(ip), timeout): str(ip) for ip in net.hosts()}
        for fut in as_completed(futures):
            ip = futures[fut]
            try:
                if fut.result():
                    alive.append(ip)
            except Exception:
                pass
    return alive

# ---------- Merge & output ----------
def merge_and_dedupe(arp_map, ping_list):
    """
    Merge arp_map (ip->mac) and ping_list (ips) into OrderedDict keyed by mac or 'ping-only:ip'
    Returns OrderedDict { key -> {mac:..., ips:set(...) } }
    """
    mac_map = OrderedDict()
    # ARP entries first
    for ip, mac in arp_map.items():
        key = mac or f"unknown-mac:{ip}"
        if key not in mac_map:
            mac_map[key] = {"mac": mac, "ips": set()}
        mac_map[key]["ips"].add(ip)
    # Ping-only entries
    for ip in ping_list:
        if ip in arp_map:
            continue
        key = f"ping-only:{ip}"
        if key not in mac_map:
            mac_map[key] = {"mac": None, "ips": set()}
        mac_map[key]["ips"].add(ip)
    return mac_map

def print_results(mac_map):
    print("\nDetected devices (unique by MAC / ping-only):\n")
    header = "{:<22} {:<20} {:<30} {:<8}".format("IP(s)", "MAC", "Vendor", "Mobile")
    print(header)
    print("-" * len(header))
    for entry in mac_map.values():
        mac = entry["mac"]
        ips = ", ".join(sorted(entry["ips"]))
        if mac:
            vendor = safe_vendor_lookup(mac)
            mobile = "YES" if any(k in vendor.lower() for k in ["apple", "samsung", "xiaomi", "huawei", "oneplus", "pixel", "realme", "vivo"]) else ""
            print("{:<22} {:<20} {:<30} {:<8}".format(ips, mac, vendor, mobile))
        else:
            # ping-only
            print("{:<22} {:<20} {:<30} {:<8}".format(ips, "-", "Unknown (ping-only)", ""))

# ---------- Main ----------
def main():
    p = argparse.ArgumentParser(description="Safe network scanner with robust vendor lookup")
    p.add_argument("--auto", action="store_true", help="auto-select interface")
    p.add_argument("--network", type=str, help="explicit network CIDR (overrides auto-detect)")
    p.add_argument("--update-vendors", action="store_true", help="update local mac-vendor DB before scanning (requires internet)")
    p.add_argument("--no-arp", action="store_true", help="skip ARP scan (ping-only)")
    args = p.parse_args()

    if args.update_vendors:
        if not MACLOOKUP_AVAILABLE:
            print("[!] mac-vendor-lookup not installed. Install with: pip install mac-vendor-lookup")
        else:
            print("[*] Updating mac vendor DB (this may take a moment)...")
            try:
                MacLookup().update_vendors()
                print("[+] Vendor DB updated.")
            except Exception as e:
                print("[!] update_vendors failed:", e)

    # determine network
    iface = None; ip = None; netmask = None; network_cidr = None
    if args.network:
        network_cidr = args.network
        print(f"Using explicit network: {network_cidr}")
    else:
        if args.auto:
            iface, ip, netmask, network_cidr = auto_select_iface_and_network()
            if not network_cidr:
                print("[!] Auto-detect failed. Try passing --network 192.168.x.0/24 or run without --auto for interactive.")
                return
        else:
            # try auto as default
            iface, ip, netmask, network_cidr = auto_select_iface_and_network()
            if not network_cidr:
                print("[!] Could not detect active interface/network. Provide --network explicitly.")
                return

        print(f"Interface chosen: {iface}  IP: {ip}  Netmask: {netmask}")
        print(f"Detected network: {network_cidr}")

    arp_map = {}
    ping_list = []
    # ARP scan (if not disabled)
    if not args.no_arp:
        try:
            # scapy iface binding: try using iface; if scapy/OS can't bind it may raise — catch and fallback
            arp_map = arp_scan(network_cidr, iface=iface, timeout=2)
            if not arp_map:
                print("[!] ARP scan returned no results (will run ping sweep).")
        except Exception as e:
            print("[!] ARP scan error:", e)
    else:
        print("[*] ARP scan skipped (ping-only mode).")

    # Always run ping sweep to catch devices not responding to ARP
    try:
        ping_list = ping_sweep(network_cidr)
    except Exception as e:
        print("[!] Ping sweep error:", e)
        ping_list = []

    mac_map = merge_and_dedupe(arp_map, ping_list)
    print_results(mac_map)

if __name__ == "__main__":
    main()
