const sampleData = {
  // 1️⃣ Visualizer
  visualizer: [
    { id: 1, name: "Workstation-01", ip: "192.168.1.10", status: "Working", vulnerable: true, icon: "💻", draggable: true },
    { id: 2, name: "Laptop-Dev-02", ip: "192.168.1.22", status: "Offline", vulnerable: false, icon: "💻", draggable: true },
    { id: 3, name: "Server-DB-01", ip: "192.168.1.5", status: "Working", vulnerable: true, icon: "🖥️", draggable: true },
    { id: 4, name: "Printer-HR-01", ip: "192.168.1.40", status: "Sleep", vulnerable: false, icon: "🖨️", draggable: true },
    { id: 5, name: "Workstation-02", ip: "192.168.1.11", status: "Working", vulnerable: true, icon: "💻", draggable: true },
    { id: 6, name: "Workstation-03", ip: "192.168.1.12", status: "Offline", vulnerable: false, icon: "💻", draggable: true }
  ],

  // 2️⃣ Devices
  devices: [
    { id: 1, name: "Workstation-01", type: "PC", ip: "192.168.1.10", status: "Working", department: "Finance", remoteActions: ["Isolate", "Kill Process", "View Logs"], icon: "💻" },
    { id: 2, name: "Laptop-Dev-02", type: "Laptop", ip: "192.168.1.22", status: "Offline", department: "Development", remoteActions: ["Isolate"], icon: "💻" },
    { id: 3, name: "Server-DB-01", type: "Server", ip: "192.168.1.5", status: "Working", department: "IT", remoteActions: ["Kill Process", "Restart Service"], icon: "🖥️" },
    { id: 4, name: "Printer-HR-01", type: "Printer", ip: "192.168.1.40", status: "Sleep", department: "HR", remoteActions: ["Restart"], icon: "🖨️" },
    { id: 5, name: "Workstation-02", type: "PC", ip: "192.168.1.11", status: "Working", department: "Sales", remoteActions: ["Isolate", "Kill Process"], icon: "💻" },
    { id: 6, name: "Workstation-03", type: "PC", ip: "192.168.1.12", status: "Offline", department: "Marketing", remoteActions: ["Isolate"], icon: "💻" }
  ],

  // 3️⃣ Logs & Activity
  logs: [
    { id: 1, type: "Login", user: "Alice", device: "Workstation-01", time: "2025-09-24 09:00", status: "Successful", icon: "🔑" },
    { id: 2, type: "Logout", user: "Bob", device: "Laptop-Dev-02", time: "2025-09-24 09:30", status: "Successful", icon: "🔒" },
    { id: 3, type: "Malicious Activity", user: "Unknown", device: "Server-DB-01", time: "2025-09-24 10:15", status: "Detected", icon: "⚠️" },
    { id: 4, type: "Process Terminated", user: "Admin", device: "Workstation-03", time: "2025-09-24 10:30", status: "Successful", icon: "🛠️" },
    { id: 5, type: "Vulnerability Detected", user: "System", device: "Workstation-01", time: "2025-09-24 11:00", status: "Detected", icon: "🛡️" }
  ],

  // 4️⃣ Issues
  issues: [
    { id: 1, title: "Agent Not Responding", device: "Laptop-Dev-02", severity: "High", icon: "⚠️" },
    { id: 2, title: "No Agent Installed", device: "Printer-HR-01", severity: "Medium", icon: "⚠️" },
    { id: 3, title: "Unauthorized Access Attempt", device: "Server-DB-01", severity: "High", icon: "🚨" }
  ],

  // 5️⃣ Upgrade (Premium Features)
  upgrade: [
    { id: 1, type: "Advanced Logs", user: "Admin", device: "Workstation-01", time: "2025-09-24 12:00", status: "Detected", icon: "📊" },
    { id: 2, type: "Extended Vulnerability Scan", device: "Server-DB-01", status: "Scheduled", icon: "🔬" },
    { id: 3, type: "Network Analytics", device: "All Devices", status: "Enabled", icon: "📈" }
  ]
};

export default sampleData;
