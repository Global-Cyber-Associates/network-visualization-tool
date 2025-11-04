# Network Visualization Backend

## Overview
This Express + MongoDB service is the hub that links the Windows agent, the continuous network scanner, and the React dashboard. It handles setup, authentication, telemetry ingestion, USB policy, and the datasets the frontend renders.

## Responsibilities
- Exposes REST APIs under `/api` for system, port, task, installed-app, log, scan, and USB management.
- Provides setup endpoints that write `config.json`, connect to MongoDB, and bootstrap an admin account.
- Issues and validates JWTs for the web console and records audit events through `utils/logger.js`.
- Runs the continuous discovery loop in `visualizer-script/`, spawning `scanner_service.py` and reconciling the results with agent data.

## Technology
- Node.js 18+, Express 5, Mongoose, MongoDB, `cors`, `body-parser`, `bcrypt`, `jsonwebtoken`, `dotenv`.
- Python 3 with `netifaces` and `mac-vendor-lookup` for the network scanner spawned by `visualizer-script/visualizerScanner.js`.
- Data models live in `models/` and cover users, logs, system inventory, tasks, port scans, USB devices, and visualizer documents.

## Prerequisites
- Node.js 18 or newer plus npm available on the development machine.
- A reachable MongoDB instance (local or hosted) whose URI will be written to `backend/config.json` during setup.
- Python 3.10+ installed and on the PATH so the continuous scanner can spawn `python` processes.
- Ability to `pip install netifaces mac-vendor-lookup` in the Python environment used by the scanner loop.
- `.env` file containing at least `JWT_SECRET` before starting the server.

## Configuration
- The setup flow (frontend `/setup` or `POST /api/setup`) writes `backend/config.json` with the `mongoURI` the server and scanner use.
- A `.env` file must define `JWT_SECRET`; other values can continue to use defaults.
- MongoDB connection is established lazily after `config.json` is present. Until then, requests are held at the setup stage.

## Key API surfaces
- Agent ingestion: `POST /api/system`, `/api/ports`, `/api/tasks`, `/api/installed-apps`.
- USB workflow: `GET /api/usb/approved`, `POST /api/usb/request`, `/api/usb/approve|deny|block|unblock`, plus `GET /api/usb` listings.
- Frontend dashboards: `GET /api/visualizer-data`, `/api/system`, `/api/tasks/:deviceId`, `/api/logs`, `/api/scan`.
- Authentication: `POST /api/auth/register`, `POST /api/auth/login`, and a legacy `POST /login` handler consumed by the current frontend.

## Visualizer pipeline
- `visualizer-script/visualizerScanner.js` waits for a valid `mongoURI`, then spawns the Python scanner.
- Each scan cycle persists detected devices to MongoDB and calls `visualizer-script/visualizer.js` to merge in agent system data.
- The resulting `VisualizerData` collection powers the frontend network graph, including a `noAgent` flag for unmanaged hosts.

## Local development
1. `npm install`
2. Create `.env` with `JWT_SECRET=your-secret`.
3. Start the server with `npm start` and complete the setup wizard (or POST to `/api/setup`) to populate `config.json`.
4. Ensure a Python interpreter plus `pip install netifaces mac-vendor-lookup` are available if you want the continuous scanner loop running.

## Interaction with other codebases
- Receives and stores telemetry emitted by the Python agent.
- Supplies REST endpoints that the React frontend calls for dashboards, device details, USB approval, login, and scanning screens.
- Launches the Python discovery scripts so unmanaged devices still surface in the frontend visualizer.
