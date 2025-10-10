# network_scanner.py
from scapy.all import ARP, Ether, srp
import ipaddress
from mac_vendor_lookup import MacLookup

def scan_network(network_cidr):
    """Scan the network and return detected devices with IP, MAC, Vendor."""
    print(f"Scanning network: {network_cidr} ...")
    
    # Create ARP request
    arp = ARP(pdst=str(network_cidr))
    ether = Ether(dst="ff:ff:ff:ff:ff:ff")
    packet = ether/arp
    
    result = srp(packet, timeout=2, verbose=0)[0]  # send packet
    
    devices = []
    
    for sent, received in result:
        ip = received.psrc
        mac = received.hwsrc
        
        try:
            vendor = MacLookup().lookup(mac)
        except:
            vendor = "Unknown"
        
        devices.append({"IP": ip, "MAC": mac, "Vendor": vendor})
    
    return devices

def print_devices(devices):
    print("\nDetected devices:")
    print("{:<16} {:<20} {:<20}".format("IP", "MAC", "Vendor"))
    print("-"*60)
    for d in devices:
        print("{:<16} {:<20} {:<20}".format(d["IP"], d["MAC"], d["Vendor"]))

if __name__ == "__main__":
    # Change this to your subnet (example: 192.168.1.0/24)
    network_cidr = ipaddress.IPv4Network("192.168.1.0/24")
    
    devices = scan_network(network_cidr)
    print_devices(devices)
