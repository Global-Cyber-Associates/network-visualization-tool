// systemLogs.js
const systemLogs = [
  // --- Security: Logons / Logoffs ---
  {
    id: 1,
    eventId: 4624,
    type: "Logon",
    subtype: "Interactive",
    user: "Alice",
    device: "DESKTOP-01",
    domain: "CORP",
    time: "2025-09-26T07:52:13Z",
    ip: "192.168.1.10",
    workstation: "DESKTOP-01",
    status: "Success",
    source: "Security",
    detail: "User logged on interactively.",
    icon: "🔑"
  },
  {
    id: 2,
    eventId: 4625,
    type: "Logon",
    subtype: "Network",
    user: "Bob",
    device: "LAPTOP-DEV",
    domain: "CORP",
    time: "2025-09-26T08:15:02Z",
    ip: "203.0.113.22",
    workstation: "LAPTOP-DEV",
    status: "Failure",
    reason: "Bad password",
    source: "Security",
    detail: "Failed network logon from remote IP.",
    icon: "❌"
  },
  {
    id: 3,
    eventId: 4634,
    type: "Logoff",
    user: "Alice",
    device: "DESKTOP-01",
    time: "2025-09-26T17:30:45Z",
    status: "Success",
    source: "Security",
    detail: "Interactive logoff.",
    icon: "🔒"
  },

  // --- RDP / Remote Sessions ---
  {
    id: 4,
    eventId: 4624,
    type: "Logon",
    subtype: "RemoteInteractive",
    user: "Admin",
    device: "RDP-SERVER-01",
    domain: "CORP",
    time: "2025-09-26T09:05:18Z",
    ip: "198.51.100.5",
    workstation: "RDP-SERVER-01",
    status: "Success",
    source: "Security",
    detail: "User logged on via RDP (Remote Desktop).",
    icon: "🖥️"
  },

  // --- USB events (connect / disconnect) ---
  {
    id: 5,
    type: "USB Connected",
    user: "Alice",
    device: "DESKTOP-01",
    time: "2025-09-26T09:12:34Z",
    usbId: "USB\\VID_0781&PID_5567\\4C530001230910113337",
    vendor: "SanDisk",
    product: "Cruzer Blade 16GB",
    action: "Connected",
    source: "System",
    status: "Info",
    detail: "Removable storage attached; drive assigned: E:\\",
    icon: "🔌"
  },
  {
    id: 6,
    type: "USB Disconnected",
    user: "Alice",
    device: "DESKTOP-01",
    time: "2025-09-26T09:45:01Z",
    usbId: "USB\\VID_0781&PID_5567\\4C530001230910113337",
    vendor: "SanDisk",
    product: "Cruzer Blade 16GB",
    action: "Disconnected",
    source: "System",
    status: "Info",
    detail: "Removable storage removed.",
    icon: "❎"
  },

  // --- Application installs / uninstalls / updates ---
  {
    id: 7,
    eventId: 11707,
    type: "Application Installed",
    user: "Alice",
    device: "DESKTOP-01",
    time: "2025-09-26T10:02:00Z",
    application: "Zoom",
    version: "5.14.9",
    installer: "MSI",
    source: "Setup",
    status: "Installed",
    detail: "Zoom MSI installer completed.",
    icon: "⬇️"
  },
  {
    id: 8,
    eventId: 1033,
    type: "Application Uninstalled",
    user: "Bob",
    device: "LAPTOP-DEV",
    time: "2025-09-26T11:22:10Z",
    application: "OldApp",
    version: "1.2.3",
    source: "Setup",
    status: "Removed",
    detail: "User uninstalled deprecated software.",
    icon: "🗑️"
  },
  {
    id: 9,
    eventId: 19,
    type: "Windows Update",
    user: "System",
    device: "DESKTOP-01",
    time: "2025-09-26T03:05:00Z",
    update: "Security Update KB5013456",
    source: "System",
    status: "Installed",
    detail: "System installed security update and rebooted.",
    icon: "⬆️"
  },

  // --- Ports opened / closed (firewall / service) ---
  {
    id: 10,
    type: "Port Opened",
    user: "System",
    device: "SERVER-DB",
    time: "2025-09-26T01:10:22Z",
    port: 1433,
    protocol: "TCP",
    process: "sqlservr.exe",
    pid: 4320,
    action: "Listen",
    source: "Network",
    status: "Info",
    detail: "SQL Server listening on TCP 1433.",
    icon: "🔌"
  },
  {
    id: 11,
    type: "Firewall Rule Added",
    user: "Admin",
    device: "SERVER-DB",
    time: "2025-09-26T01:11:00Z",
    ruleName: "Allow_SQL_1433",
    direction: "Inbound",
    port: 1433,
    protocol: "TCP",
    action: "Allow",
    source: "Windows Firewall",
    status: "Success",
    detail: "Created inbound rule for SQL Server.",
    icon: "🧱"
  },
  {
    id: 12,
    type: "Port Closed",
    user: "System",
    device: "LAPTOP-DEV",
    time: "2025-09-26T14:45:00Z",
    port: 3389,
    protocol: "TCP",
    process: "TermService",
    action: "Closed",
    source: "Network",
    status: "Info",
    detail: "RDP service stopped and port closed.",
    icon: "🔒"
  },

  // --- Process start / stop (detailed) ---
  {
    id: 13,
    eventId: 4688,
    type: "Process Created",
    user: "Alice",
    device: "DESKTOP-01",
    time: "2025-09-26T10:15:20Z",
    process: "C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE",
    pid: 15432,
    parentProcess: "explorer.exe",
    commandLine: "\"C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE\" \"C:\\Users\\Alice\\Documents\\Budget.xlsx\"",
    source: "Security",
    status: "Running",
    icon: "⚙️",
    detail: "User opened Excel with Budget.xlsx"
  },
  {
    id: 14,
    eventId: 4689,
    type: "Process Terminated",
    user: "Alice",
    device: "DESKTOP-01",
    time: "2025-09-26T10:47:01Z",
    process: "EXCEL.EXE",
    pid: 15432,
    exitCode: 0,
    source: "Security",
    status: "Exited",
    icon: "🛑",
    detail: "Excel process exited normally."
  },
  {
    id: 15,
    eventId: 4688,
    type: "Process Created",
    user: "Bob",
    device: "LAPTOP-DEV",
    time: "2025-09-26T12:34:12Z",
    process: "C:\\Program Files\\Mozilla Firefox\\firefox.exe",
    pid: 20120,
    parentProcess: "explorer.exe",
    commandLine: "\"C:\\Program Files\\Mozilla Firefox\\firefox.exe\"",
    source: "Security",
    status: "Running",
    icon: "🌐",
    detail: "User opened Firefox."
  },

  // --- Service events (start/stop/crash) ---
  {
    id: 16,
    eventId: 7036,
    type: "Service Status",
    user: "System",
    device: "DESKTOP-01",
    time: "2025-09-26T02:05:00Z",
    serviceName: "Windows Update",
    statusDetail: "The Windows Update service entered the running state.",
    source: "Service Control Manager",
    status: "Running",
    icon: "🔁"
  },
  {
    id: 17,
    eventId: 7031,
    type: "Service Crash",
    user: "System",
    device: "DESKTOP-01",
    time: "2025-09-26T16:50:30Z",
    serviceName: "SomeThirdPartySvc",
    statusDetail: "Service terminated unexpectedly. Restarting the service.",
    source: "Service Control Manager",
    status: "Error",
    icon: "⚠️"
  },

  // --- Scheduled task events ---
  {
    id: 18,
    eventId: 106,
    type: "Task Started",
    user: "SYSTEM",
    device: "SERVER-DB",
    taskName: "\\Backup\\NightlyDBBackup",
    time: "2025-09-26T02:00:00Z",
    status: "Running",
    source: "TaskScheduler",
    icon: "🗓️",
    detail: "Scheduled DB backup started."
  },
  {
    id: 19,
    eventId: 201,
    type: "Task Completed",
    user: "SYSTEM",
    device: "SERVER-DB",
    taskName: "\\Backup\\NightlyDBBackup",
    time: "2025-09-26T02:15:20Z",
    status: "Success",
    source: "TaskScheduler",
    icon: "✅",
    detail: "Backup finished, size: 3.2GB"
  },

  // --- Registry changes (suspicious / config) ---
  {
    id: 20,
    type: "Registry Modified",
    user: "Admin",
    device: "DESKTOP-01",
    time: "2025-09-26T11:05:00Z",
    registryKey: "HKLM\\SOFTWARE\\Company\\FeatureX",
    action: "SetValue",
    valueName: "Enabled",
    oldValue: "0",
    newValue: "1",
    source: "Sysmon / Audit",
    status: "Success",
    icon: "🧾",
    detail: "FeatureX enabled by admin."
  },

  // --- Driver install / hardware events ---
  {
    id: 21,
    eventId: 20001,
    type: "Driver Installed",
    user: "Alice",
    device: "DESKTOP-01",
    time: "2025-09-26T11:30:45Z",
    driver: "NVIDIA Geforce Driver",
    version: "537.23",
    source: "Setup",
    status: "Installed",
    icon: "🖥️",
    detail: "Graphics driver installed."
  },

  // --- Disk / Volume events (low space, mount) ---
  {
    id: 22,
    eventId: 1002,
    type: "Disk Space Warning",
    user: "System",
    device: "SERVER-DB",
    time: "2025-09-26T05:00:00Z",
    volume: "C:",
    freeSpaceMB: 512,
    thresholdMB: 1024,
    status: "Warning",
    source: "System",
    icon: "💾",
    detail: "Low disk space on C: (512MB free)."
  },

  // --- Network anomalies / scanning detected ---
  {
    id: 23,
    type: "Port Scan Detected",
    user: "Unknown",
    device: "SERVER-WEB",
    time: "2025-09-26T13:05:12Z",
    srcIP: "198.51.100.238",
    ports: [80, 443, 8080, 3306],
    action: "Detected",
    source: "IDS",
    status: "Alert",
    icon: "🚨",
    detail: "Multiple connection attempts to common service ports."
  },

  // --- Windows Defender / Malware events ---
  {
    id: 24,
    eventId: 1116,
    type: "Malware Detected",
    user: "System",
    device: "DESKTOP-01",
    time: "2025-09-26T15:30:00Z",
    malware: "Trojan.Generic",
    action: "Quarantined",
    source: "Windows Defender",
    status: "Quarantined",
    icon: "🛡️",
    detail: "Malware quarantined by real-time protection."
  },

  // --- Audit: user privilege change / group membership ---
  {
    id: 25,
    eventId: 4728,
    type: "Group Membership Added",
    user: "Admin",
    device: "DC-01",
    time: "2025-09-26T08:45:00Z",
    targetUser: "Eve",
    group: "Remote Desktop Users",
    source: "Security",
    status: "Success",
    icon: "👥",
    detail: "Eve added to Remote Desktop Users by Admin."
  },

  // --- Application-specific logs (DB, Web server) ---
  {
    id: 26,
    type: "Database Backup",
    user: "SYSTEM",
    device: "SERVER-DB",
    time: "2025-09-26T02:15:20Z",
    dbName: "production",
    file: "D:\\backups\\prod_20250926.bak",
    durationSec: 920,
    sizeMB: 3280,
    status: "Success",
    source: "SQLServerAgent",
    icon: "💽",
    detail: "Nightly production DB backup completed."
  },

  // --- Network share access / file access auditing ---
  {
    id: 27,
    eventId: 4663,
    type: "File Access",
    user: "Alice",
    device: "DESKTOP-01",
    time: "2025-09-26T10:15:10Z",
    file: "\\\\fileserver\\finance\\Q3\\budget.xlsx",
    action: "Read",
    source: "Security",
    status: "Success",
    icon: "📄",
    detail: "User read finance document over SMB."
  },

  // --- Scheduled install of MSI by user (e.g., packaging) ---
  {
    id: 28,
    eventId: 11724,
    type: "MSI Install",
    user: "DevOps",
    device: "BUILD-SERVER",
    time: "2025-09-26T06:30:00Z",
    msiPackage: "company-agent-2.3.0.msi",
    source: "MsiInstaller",
    status: "Installed",
    icon: "📦"
  },

  // --- Power events (sleep / wake) ---
  {
    id: 29,
    eventId: 1,
    type: "System Sleep",
    user: "System",
    device: "LAPTOP-DEV",
    time: "2025-09-26T20:00:00Z",
    reason: "User initiated",
    source: "Kernel-Power",
    status: "Succeeded",
    icon: "💤"
  },
  {
    id: 30,
    eventId: 1,
    type: "System Wake",
    user: "Bob",
    device: "LAPTOP-DEV",
    time: "2025-09-27T07:20:01Z",
    reason: "Wake on lid open",
    source: "Kernel-Power",
    status: "Succeeded",
    icon: "🌅"
  },

  // --- Security: credential dumping / suspicious process (simulated) ---
  {
    id: 31,
    type: "Suspicious Process",
    user: "Unknown",
    device: "DESKTOP-01",
    time: "2025-09-26T16:20:42Z",
    process: "mimic-tool.exe",
    pid: 27612,
    parent: "svchost.exe",
    action: "Blocked",
    source: "EDR",
    status: "Blocked",
    icon: "🚫",
    detail: "EDR blocked suspicious credential access."
  },

  // --- Security: account lockout after failed attempts ---
  {
    id: 32,
    eventId: 4740,
    type: "Account Lockout",
    user: "Bob",
    device: "LAPTOP-DEV",
    time: "2025-09-26T08:18:12Z",
    source: "Security",
    status: "Locked",
    detail: "Account locked due to repeated failed logon attempts.",
    icon: "🔒"
  },

  // --- Network mapping / VPN connect ---
  {
    id: 33,
    type: "VPN Connected",
    user: "Eve",
    device: "LAPTOP-REMOTE",
    time: "2025-09-26T06:05:40Z",
    gateway: "vpn.corp.example.com",
    ipAssigned: "10.8.0.45",
    source: "VPNClient",
    status: "Connected",
    icon: "🔐"
  },

  // --- Windows Error Reporting (application crash dumps) ---
  {
    id: 34,
    eventId: 1001,
    type: "Application Crash Dump",
    user: "Alice",
    device: "DESKTOP-01",
    application: "Excel.exe",
    faultModule: "MSO.DLL",
    errorCode: "0xc0000005",
    time: "2025-09-26T12:00:20Z",
    source: "Windows Error Reporting",
    status: "Reported",
    icon: "💥",
    detail: "Application terminated unexpectedly. Crash report sent."
  },

  // --- PowerShell script execution (audit) ---
  {
    id: 35,
    eventId: 4104,
    type: "PowerShell Script Block",
    user: "Admin",
    device: "DESKTOP-01",
    time: "2025-09-26T11:45:05Z",
    script: "Invoke-CompanyAgent -Install -Quiet",
    source: "PowerShell",
    status: "Executed",
    icon: "📜",
    detail: "PowerShell command executed by Admin."
  },

  // --- WMI / Configuration changes ---
  {
    id: 36,
    type: "WMI Change",
    user: "System",
    device: "DESKTOP-01",
    time: "2025-09-26T13:22:00Z",
    class: "Win32_Service",
    change: "Service parameter updated: Recovery=Restart",
    source: "Configuration",
    status: "Success",
    icon: "⚙️"
  },

  // --- Group policy / domain join events ---
  {
    id: 37,
    eventId: 1030,
    type: "Group Policy",
    user: "System",
    device: "DESKTOP-01",
    time: "2025-09-26T07:55:00Z",
    action: "Applied",
    gpo: "Corp-Desktop-Security",
    source: "GroupPolicy",
    status: "Success",
    icon: "📜"
  },

  // --- Audit log: user created local account ---
  {
    id: 38,
    eventId: 4720,
    type: "User Created",
    user: "Admin",
    device: "DESKTOP-01",
    time: "2025-09-26T11:10:00Z",
    newUser: "contractor01",
    source: "Security",
    status: "Success",
    icon: "🆕",
    detail: "Local account contractor01 created for temporary contractor access."
  },

  // --- Tamper / integrity events (file replaced) ---
  {
    id: 39,
    type: "File Modified",
    user: "Unknown",
    device: "SERVER-WEB",
    time: "2025-09-26T02:20:14Z",
    file: "C:\\inetpub\\wwwroot\\index.php",
    action: "Modified",
    source: "FileIntegrityMonitor",
    status: "Alert",
    icon: "⚠️",
    detail: "Web root file checksum changed unexpectedly."
  },

  // --- Application telemetry / user actions (open app list) ---
  {
    id: 40,
    type: "App Launched",
    user: "Alice",
    device: "DESKTOP-01",
    process: "C:\\Program Files\\Slack\\slack.exe",
    time: "2025-09-26T09:18:22Z",
    pid: 11820,
    source: "AppUsage",
    status: "Started",
    icon: "💬",
    detail: "User opened Slack."
  },
  {
    id: 41,
    type: "App Launched",
    user: "Bob",
    device: "LAPTOP-DEV",
    process: "C:\\Program Files\\Docker\\Docker Desktop.exe",
    time: "2025-09-26T08:40:05Z",
    pid: 9124,
    source: "AppUsage",
    status: "Started",
    icon: "🐳",
    detail: "User started Docker Desktop."
  },

  // --- Browser downloads / network file transfer ---
  {
    id: 42,
    type: "Download",
    user: "Bob",
    device: "LAPTOP-DEV",
    time: "2025-09-26T12:03:11Z",
    url: "https://example.com/tools/tool.exe",
    file: "C:\\Users\\Bob\\Downloads\\tool.exe",
    source: "Browser",
    status: "Downloaded",
    icon: "⬇️",
    detail: "User downloaded executable from external website."
  },

  // --- System integrity: signed driver blocked ---
  {
    id: 43,
    type: "Driver Blocked",
    user: "System",
    device: "DESKTOP-01",
    time: "2025-09-26T14:55:00Z",
    driver: "unknowndriver.sys",
    vendor: "UnknownVendor",
    source: "DriverVerifier",
    status: "Blocked",
    icon: "⛔",
    detail: "Unsigned driver prevented from loading."
  },

  // --- Firewall changes by admin ---
  {
    id: 44,
    type: "Firewall Rule Modified",
    user: "NetworkAdmin",
    device: "SERVER-DB",
    time: "2025-09-26T01:30:00Z",
    ruleName: "Allow_SQL_1433",
    change: "Changed action from Allow to Block",
    source: "Windows Firewall",
    status: "Success",
    icon: "🛡️"
  },

  // --- LDAP / Active Directory authentication (if domain) ---
  {
    id: 45,
    type: "AD Auth",
    user: "Eve",
    device: "LAPTOP-DEV",
    time: "2025-09-26T08:22:40Z",
    domainController: "DC-01.corp.example.com",
    status: "Success",
    source: "AD",
    icon: "🏷️",
    detail: "Kerberos ticket issued for user."
  },

  // --- System install logs (OS feature added) ---
  {
    id: 46,
    type: "Feature Installed",
    user: "System",
    device: "DESKTOP-01",
    time: "2025-09-26T04:00:00Z",
    feature: "Windows Subsystem for Linux",
    status: "Installed",
    source: "Setup",
    icon: "🐧"
  },

  // --- Corrupted file / disk I/O error ---
  {
    id: 47,
    eventId: 51,
    type: "Disk I/O Error",
    user: "System",
    device: "FILE-SERVER",
    time: "2025-09-26T03:50:18Z",
    volume: "D:",
    errorCode: "0x0000000E",
    source: "Ntfs",
    status: "Error",
    icon: "❗",
    detail: "I/O error while reading cluster; possible disk fault."
  },

  // --- Browser process spawning (suspicious child process) ---
  {
    id: 48,
    type: "Child Process",
    user: "Bob",
    device: "LAPTOP-DEV",
    time: "2025-09-26T12:03:20Z",
    parentProcess: "firefox.exe",
    childProcess: "cmd.exe",
    pid: 20500,
    source: "ProcessMonitor",
    status: "Alert",
    icon: "⚠️",
    detail: "Browser spawned command shell via downloaded executable."
  },

  // --- Certificate / TLS issues ---
  {
    id: 49,
    type: "Certificate Expired",
    user: "System",
    device: "WEB-GATEWAY",
    time: "2025-09-26T00:00:00Z",
    certThumbprint: "AB12CD34EF56...",
    subject: "www.example.com",
    status: "Expired",
    source: "Schannel",
    icon: "🔐",
    detail: "TLS certificate expired."
  },

  // --- App auto-update triggered ---
  {
    id: 50,
    type: "App Auto-Update",
    user: "System",
    device: "DESKTOP-01",
    time: "2025-09-26T04:10:00Z",
    application: "CompanyAgent",
    versionFrom: "2.2.0",
    versionTo: "2.3.0",
    status: "Updated",
    source: "AppUpdater",
    icon: "⚙️"
  },

  // --- System audit flush / log cleared (possible tamper) ---
  {
    id: 51,
    eventId: 1102,
    type: "Audit Log Cleared",
    user: "Admin",
    device: "DESKTOP-01",
    time: "2025-09-26T18:00:00Z",
    source: "Security",
    status: "Actioned",
    icon: "🧹",
    detail: "Security log cleared by Admin."
  },

  // --- External USB mass storage scanned by AV (on connect) ---
  {
    id: 52,
    type: "On-Access Scan",
    user: "System",
    device: "DESKTOP-01",
    time: "2025-09-26T09:13:10Z",
    target: "E:\\",
    result: "No threats found",
    source: "Windows Defender",
    status: "Clean",
    icon: "🔍",
    detail: "Removable media scanned on insertion."
  },

  // --- User changed password ---
  {
    id: 53,
    eventId: 4723,
    type: "Password Change",
    user: "Alice",
    device: "DESKTOP-01",
    time: "2025-09-26T08:30:00Z",
    source: "Security",
    status: "Successful",
    detail: "User changed password successfully.",
    icon: "🔑"
  },

  // --- Local group policy modified (security baseline) ---
  {
    id: 54,
    type: "Local Policy Modified",
    user: "Admin",
    device: "DESKTOP-01",
    time: "2025-09-26T11:00:00Z",
    policy: "Account lockout threshold",
    previous: "10",
    new: "5",
    source: "GroupPolicy",
    status: "Success",
    icon: "⚙️",
    detail: "Tightened account lockout policy."
  },

  // --- Application configuration changed ---
  {
    id: 55,
    type: "Config Change",
    user: "DevOps",
    device: "BUILD-SERVER",
    time: "2025-09-26T06:45:00Z",
    application: "CI Runner",
    change: "Runner token rotated",
    source: "Application",
    status: "Success",
    icon: "🔁"
  },

  // --- LDAP / AD: Kerberos renewal failed (ticket) ---
  {
    id: 56,
    type: "Kerberos Renewal Failed",
    user: "Charlie",
    device: "SERVER-DB",
    time: "2025-09-26T09:40:00Z",
    reason: "KDC unreachable",
    source: "Security",
    status: "Failure",
    icon: "❗"
  },

  // --- File create in temp with suspicious extension ---
  {
    id: 57,
    type: "File Created",
    user: "Bob",
    device: "LAPTOP-DEV",
    time: "2025-09-26T12:03:15Z",
    file: "C:\\Users\\Bob\\AppData\\Local\\Temp\\rundll32.exe.tmp",
    action: "Created",
    source: "FileMonitor",
    status: "Alert",
    icon: "⚠️",
    detail: "Executable-like file created in user temp folder."
  },

  // --- System health check: kernel patch applied ---
  {
    id: 58,
    type: "Patch Applied",
    user: "System",
    device: "DESKTOP-01",
    time: "2025-09-26T04:05:00Z",
    patch: "KB5013456",
    status: "Applied",
    source: "Windows Update",
    icon: "🔧"
  },

  // --- SMB share created / permission changed ---
  {
    id: 59,
    type: "SMB Share Created",
    user: "StorageAdmin",
    device: "FILE-SERVER",
    time: "2025-09-26T07:20:00Z",
    shareName: "\\\\fileserver\\projectX",
    permissions: "Read: DeptX; Write: DeptX",
    source: "SMB",
    status: "Created",
    icon: "📁"
  },

  // --- System time changed (admin) ---
  {
    id: 60,
    eventId: 4616,
    type: "System Time Changed",
    user: "Admin",
    device: "DESKTOP-01",
    time: "2025-09-26T08:00:00Z",
    oldTime: "2025-09-26T07:59:58Z",
    newTime: "2025-09-26T08:00:00Z",
    source: "System",
    status: "Success",
    icon: "⏰"
  },

  // --- Multiple failed SSH login attempts to local SFTP (app-level) ---
  {
    id: 61,
    type: "SFTP Login Failed",
    user: "Unknown",
    device: "FILE-SERVER",
    time: "2025-09-26T02:35:00Z",
    srcIP: "203.0.113.99",
    usernameTried: "root",
    attempts: 6,
    source: "SFTPService",
    status: "Blocked",
    icon: "🚫"
  },

  // --- System boot config change (BCD) attempted ---
  {
    id: 62,
    type: "BCD Modification",
    user: "Admin",
    device: "DESKTOP-01",
    time: "2025-09-26T05:10:00Z",
    change: "Debug option enabled",
    source: "System",
    status: "Success",
    icon: "🛠️"
  },

  // --- Audit: scheduled removal of user account (future) ---
  {
    id: 63,
    type: "Account Scheduled Removal",
    user: "Admin",
    device: "DESKTOP-01",
    targetUser: "contractor01",
    scheduledTime: "2025-10-01T00:00:00Z",
    time: "2025-09-26T11:12:00Z",
    source: "Security",
    status: "Scheduled",
    icon: "🗓️"
  },

  // --- Browser extension installed (user action) ---
  {
    id: 64,
    type: "Browser Extension Installed",
    user: "Alice",
    device: "DESKTOP-01",
    time: "2025-09-26T09:20:40Z",
    browser: "Chrome",
    extensionName: "Productivity Booster",
    source: "Browser",
    status: "Installed",
    icon: "🔌"
  },

  // --- Remote software deployment push ---
  {
    id: 65,
    type: "Remote Deploy",
    user: "ITDeploy",
    device: "LAPTOP-DEV",
    time: "2025-09-26T22:00:00Z",
    package: "company-agent-2.3.0",
    method: "Intune",
    status: "Pushed",
    source: "MDM",
    icon: "📡"
  },

  // --- Process with network connection (captured) ---
  {
    id: 66,
    type: "Process Network Connection",
    user: "Bob",
    device: "LAPTOP-DEV",
    time: "2025-09-26T12:03:25Z",
    process: "tool.exe",
    pid: 20505,
    remoteIP: "45.33.32.10",
    remotePort: 443,
    protocol: "TCP",
    source: "NetMon",
    status: "Established",
    icon: "🌐",
    detail: "User-run process connected to external host over TLS."
  },

  // --- User removed from privileged group (audit) ---
  {
    id: 67,
    eventId: 4729,
    type: "Group Membership Removed",
    user: "Admin",
    device: "DC-01",
    time: "2025-09-26T15:05:00Z",
    targetUser: "tempadmin",
    group: "Administrators",
    source: "Security",
    status: "Success",
    icon: "🔧",
    detail: "Temporary admin privileges revoked."
  },

  // --- Background sync / cloud storage upload ---
  {
    id: 68,
    type: "Cloud Sync",
    user: "Alice",
    device: "DESKTOP-01",
    time: "2025-09-26T10:20:00Z",
    service: "OneDrive",
    file: "C:\\Users\\Alice\\Documents\\report.docx",
    action: "Upload",
    source: "CloudClient",
    status: "Success",
    icon: "☁️"
  },

  // --- Application license activation ---
  {
    id: 69,
    type: "App License Activated",
    user: "Alice",
    device: "DESKTOP-01",
    time: "2025-09-26T10:05:00Z",
    application: "Office365",
    licenseKeySuffix: "XXXX-YYYY",
    source: "Application",
    status: "Activated",
    icon: "🔑"
  },

  // --- System event: TPM / Secure Boot check ---
  {
    id: 70,
    type: "TPM Health Check",
    user: "System",
    device: "DESKTOP-01",
    time: "2025-09-26T04:20:00Z",
    tpmVersion: "2.0",
    secureBoot: true,
    source: "System",
    status: "OK",
    icon: "🔐"
  },

  // --- Final example: user exported logs to file (audit) ---
  {
    id: 71,
    type: "Audit Export",
    user: "Admin",
    device: "DESKTOP-01",
    time: "2025-09-26T18:05:00Z",
    exportFile: "C:\\Temp\\audit_20250926.json",
    format: "JSON",
    source: "Security",
    status: "Completed",
    icon: "📤",
    detail: "Admin exported security audit logs for review."
  }
];

export default systemLogs;
