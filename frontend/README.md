# Network Visualization Frontend

## Overview
This React single-page application is the operator console for the platform. It walks new deployments through setup, authenticates users, and visualizes data supplied by the backend and Windows agent.

## Core screens
- Setup wizard: collects the MongoDB URI and admin credentials, then calls `POST /api/setup`.
- Login: exchanges credentials for a JWT via `POST /login` and guards protected routes in `App.jsx`.
- Dashboard: summarises managed versus unmanaged devices and shows system tables powered by `/api/visualizer-data` and `/api/system`.
- Network Visualizer: renders a radial network map from `/api/visualizer-data` with unmanaged hosts flagged via `noAgent`.
- Devices and Task Manager: provide per-device system details and historical process snapshots fetched from `/api/system` and `/api/tasks/:deviceId`.
- USB control: lists pending, approved, denied, and blocked devices from `/api/usb` endpoints.
- Logs, Issues, and Features: surface operational context; issues/features leverage sample data in `src/devices.js` until the backend endpoints are wired.

## Technology
- React 18 + Vite
- Routing: `react-router-dom`
- Visuals: `react-force-graph-2d`, `reactflow`, `react-grid-layout`, `d3`, `framer-motion`, `lucide-react`
- HTTP clients: `fetch` and `axios`

## Prerequisites
- Node.js 18+ (or the version specified in the root tooling) and npm available on the workstation.
- Access to the backend API (defaults to `http://localhost:5000`) so routes can load data during development.
- Recommended: a configured `.env` or Vite environment variables if you plan to override API URLs.

## Backend integration
- Targets `http://localhost:5000` by default. Update the hard-coded URLs (search for `localhost:5000`) if the API runs elsewhere.
- Consumes backend collections populated by the agent and scanner: `visualizer-data`, `system`, `tasks`, `logs`, `scan`, and the USB endpoints.
- Stores the JWT from `/login` in `localStorage` to keep navigation within protected routes.

## Getting started
1. `npm install`
2. `npm run dev`
3. Open the Vite URL (defaults to `http://localhost:5173`) and complete the setup flow before visiting authenticated routes.

## Structure highlights
- `src/App.jsx` wires routing, authentication guards, and the primary layout shell.
- `src/components/` holds feature domains such as `dashboard`, `visualizer`, `devices`, `usb`, `scan`, and supporting navigation.
- `src/devices.js` provides placeholder issues and log data during early development.

## Interaction with other codebases
- Reads telemetry, inventory, USB policy, and authentication data from the Node.js backend.
- Presents insights collected by the Python agent and the backend's continuous network scanner within a single operator experience.
