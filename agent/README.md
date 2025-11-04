# Network Visualization Agent

## Overview
The Windows-first agent runs on managed endpoints and keeps the backend informed about local network posture and device health. It performs an initial sweep when launched and keeps monitoring removable media so the web console can enforce USB policy.

## Responsibilities
- Port scanning: sweeps the configured target and port range with `python-nmap`.
- System inventory: captures OS, hardware, network interface, and uptime metrics using psutil and WMI.
- Installed applications: collects installed software so the backend can surface software exposure.
- Process snapshot: records foreground applications and background processes for the Task Manager views.
- USB enforcement: watches for new USB storage devices, ejects anything that is not approved, and raises approval requests with the backend.

## Prerequisites
- Windows host with Python 3.10+ available on the PATH.
- [Nmap](https://nmap.org/download.html) CLI installed and accessible (e.g. `winget install nmap` or `choco install nmap`) so `python-nmap` can invoke `nmap.exe`.
- Ability to install the Python dependencies listed in `requirements.txt` (administrator rights may be required for WMI access and USB eject operations).
- Optional: PyInstaller tooling if you intend to build packaged executables via the provided `.spec` files.

## Data exchange with the backend
- Defaults to `http://localhost:5000/api`; override with `API_BASE_URL` (general telemetry) and `API_BASE` (USB monitor) in `.env`.
- Submits JSON payloads to `/api/ports`, `/api/system`, `/api/installed-apps`, and `/api/tasks` by way of `functions/sender.py`.
- Polls `/api/usb/approved` to keep its approved-device cache and posts new requests to `/api/usb/request`.
- Uses the machine identifier from the system inventory as the stable device key across payloads.

## Technology
- Python 3.10+
- Key dependencies: `requests`, `python-dotenv`, `psutil`, `python-nmap`, `pywin32`, `wmi`.
- Packaged builds are configured through `main.spec`, `SystemAgent.spec`, and the GUI defined in `main_gui.py`.
- A frozen config (`dist/agent_config.json`) is bundled with PyInstaller builds and consumed by the GUI.

## Local development
1. Create and activate a virtual environment.
   ```
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Add a `.env` file with:
   ```
   API_BASE_URL=http://localhost:5000/api
   API_BASE=http://localhost:5000/api
   ```
3. Ensure `nmap --version` works in this shell, then start the agent with `python main.py`. It performs the initial scans and keeps the USB monitor thread running until you press `Ctrl+C`.

## Interaction with the rest of the system
- Every payload is persisted by the Node.js backend, which merges it with continuous network discovery results from `visualizer-script`.
- The React frontend reads the same collections to populate dashboards, drill-down device views, the Task Manager screen, and the USB approval workflow.
