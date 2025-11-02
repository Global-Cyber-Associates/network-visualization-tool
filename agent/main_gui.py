import sys
import tkinter as tk
from tkinter import ttk, messagebox
import threading
import queue
import json
import os
from pathlib import Path

# Import agent functions
from functions.ports import scan_ports
from functions.sender import send_scan_results, set_base_api_url
from functions.system import get_system_info
from functions.taskmanager import collect_process_info
from functions.installed_apps import get_installed_apps

# ---------- Helpers ----------
def resource_path(relative_path: str) -> str:
    """Get path inside bundle or filesystem."""
    try:
        base_path = sys._MEIPASS  # type: ignore
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)


CONFIG_FILENAME = "agent_config.json"


def load_config():
    try:
        with open(CONFIG_FILENAME, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def save_config(cfg):
    with open(CONFIG_FILENAME, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2)


# ---------- Background worker ----------
def run_agent_jobs(cfg, progress_queue: queue.Queue):
    """Run selected scans according to cfg and emit progress messages."""
    try:
        api_url = cfg.get("api_url") or "http://localhost:5000/api"
        set_base_api_url(api_url)
        progress_queue.put(("status", "Starting agent..."))

        # --- Port Scan ---
        if cfg.get("do_port_scan", True):
            progress_queue.put(("status", "Running port scan..."))
            target_ip = cfg.get("port_target", "127.0.0.1")
            port_range = cfg.get("port_range", "1-1024")
            ports = scan_ports(target_ip, port_range)
            progress_queue.put(("log", f"Port results: {len(ports)} entries"))
            send_scan_results(ports, endpoint_path="ports")
            progress_queue.put(("status", "Port scan complete."))

        # --- System Info ---
        if cfg.get("do_system_info", True):
            progress_queue.put(("status", "Collecting system info..."))
            sysinfo = get_system_info()
            progress_queue.put(("log", f"System info keys: {', '.join(list(sysinfo.keys())[:5])}"))
            send_scan_results(sysinfo, endpoint_path="system")
            progress_queue.put(("status", "System info sent."))

        # --- Task Manager (fixed version) ---
        if cfg.get("do_task_manager", False):
            progress_queue.put(("status", "Collecting task manager data..."))
            task_data = collect_process_info()

            # Build payload just like CLI version
            sysinfo = get_system_info()
            device_id = (
                cfg.get("device_id")
                or sysinfo.get("machine_id")
                or sysinfo.get("hostname")
                or "unknown-device"
            )

            applications = task_data.get("applications", [])
            background_processes = task_data.get("background_processes", [])

            task_payload = {
                "deviceId": device_id,
                "applications": applications,
                "background_processes": background_processes,
            }

            progress_queue.put(
                ("log", f"Applications: {len(applications)}, Background: {len(background_processes)}")
            )
            send_scan_results(task_payload, endpoint_path="tasks")
            progress_queue.put(("status", "Task manager data sent."))

        # --- Installed Apps ---
        if cfg.get("do_installed_apps", False):
            progress_queue.put(("status", "Collecting installed apps..."))
            apps = get_installed_apps()
            device_id = cfg.get("device_id", "default-device")

            if isinstance(apps, list):
                payload = {
                    "deviceId": device_id,
                    "applications": apps,
                }
                progress_queue.put(("log", f"Installed apps count: {len(apps)}"))
                send_scan_results(payload, endpoint_path="installed-apps")
            else:
                send_scan_results(apps, endpoint_path="installed-apps")

            progress_queue.put(("status", "Installed apps sent."))

        progress_queue.put(("done", "All selected operations completed."))

    except Exception as e:
        progress_queue.put(("error", str(e)))


# ---------- GUI Application ----------
class WizardApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("System Agent Setup")
        self.geometry("640x420")
        self.resizable(False, False)

        self.config = load_config()
        self.progress_queue = queue.Queue()

        self.container = ttk.Frame(self)
        self.container.pack(fill="both", expand=True, padx=12, pady=12)

        self.frames = {}
        for F in (WelcomePage, SettingsPage, OptionsPage, SummaryPage, RunPage):
            page = F(parent=self.container, controller=self)
            self.frames[F.__name__] = page
            page.grid(row=0, column=0, sticky="nsew")

        self.show_frame("WelcomePage")

    def show_frame(self, page_name):
        frame = self.frames[page_name]
        frame.event_generate("<<ShowFrame>>")
        frame.tkraise()


# ---------- Pages ----------
class WelcomePage(ttk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller
        ttk.Label(self, text="Welcome to System Agent", font=("Segoe UI", 18)).pack(pady=20)
        ttk.Label(self, text="This wizard will help you configure the agent.").pack(pady=6)
        ttk.Button(self, text="Start", command=lambda: controller.show_frame("SettingsPage")).pack(pady=20)
        ttk.Button(self, text="Exit", command=controller.destroy).pack(side="bottom", pady=10)


class SettingsPage(ttk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller
        ttk.Label(self, text="Settings", font=("Segoe UI", 16)).pack(pady=12)

        frm = ttk.Frame(self)
        frm.pack(padx=10, pady=6, fill="x")

        ttk.Label(frm, text="API Base URL").grid(row=0, column=0, sticky="w", padx=4, pady=4)
        self.api_var = tk.StringVar(value=controller.config.get("api_url", "http://localhost:5000/api"))
        ttk.Entry(frm, textvariable=self.api_var, width=60).grid(row=0, column=1, pady=4, padx=4)

        ttk.Label(frm, text="Port scan target").grid(row=1, column=0, sticky="w", padx=4, pady=4)
        self.target_var = tk.StringVar(value=controller.config.get("port_target", "127.0.0.1"))
        ttk.Entry(frm, textvariable=self.target_var).grid(row=1, column=1, sticky="w", padx=4)

        ttk.Label(frm, text="Port range").grid(row=2, column=0, sticky="w", padx=4, pady=4)
        self.range_var = tk.StringVar(value=controller.config.get("port_range", "1-1024"))
        ttk.Entry(frm, textvariable=self.range_var).grid(row=2, column=1, sticky="w", padx=4)

        nav = ttk.Frame(self)
        nav.pack(side="bottom", fill="x", pady=10)
        ttk.Button(nav, text="Back", command=lambda: controller.show_frame("WelcomePage")).pack(side="left", padx=10)
        ttk.Button(nav, text="Next", command=self.save_and_next).pack(side="right", padx=10)

    def save_and_next(self):
        c = self.controller
        c.config["api_url"] = self.api_var.get().strip()
        c.config["port_target"] = self.target_var.get().strip()
        c.config["port_range"] = self.range_var.get().strip()
        save_config(c.config)
        c.show_frame("OptionsPage")


class OptionsPage(ttk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller
        ttk.Label(self, text="Select which scans to run", font=("Segoe UI", 16)).pack(pady=12)

        self.do_port = tk.BooleanVar(value=controller.config.get("do_port_scan", True))
        self.do_system = tk.BooleanVar(value=controller.config.get("do_system_info", True))
        self.do_tasks = tk.BooleanVar(value=controller.config.get("do_task_manager", False))
        self.do_apps = tk.BooleanVar(value=controller.config.get("do_installed_apps", False))

        ttk.Checkbutton(self, text="Port scan", variable=self.do_port).pack(anchor="w", padx=12, pady=6)
        ttk.Checkbutton(self, text="System information", variable=self.do_system).pack(anchor="w", padx=12, pady=6)
        ttk.Checkbutton(self, text="Task manager data", variable=self.do_tasks).pack(anchor="w", padx=12, pady=6)
        ttk.Checkbutton(self, text="Installed applications", variable=self.do_apps).pack(anchor="w", padx=12, pady=6)

        nav = ttk.Frame(self)
        nav.pack(side="bottom", fill="x", pady=10)
        ttk.Button(nav, text="Back", command=lambda: controller.show_frame("SettingsPage")).pack(side="left", padx=10)
        ttk.Button(nav, text="Next", command=self.save_and_next).pack(side="right", padx=10)

    def save_and_next(self):
        c = self.controller
        c.config["do_port_scan"] = self.do_port.get()
        c.config["do_system_info"] = self.do_system.get()
        c.config["do_task_manager"] = self.do_tasks.get()
        c.config["do_installed_apps"] = self.do_apps.get()
        save_config(c.config)
        c.show_frame("SummaryPage")


class SummaryPage(ttk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller
        ttk.Label(self, text="Summary", font=("Segoe UI", 16)).pack(pady=12)
        self.summary_txt = tk.Text(self, height=10, width=70, state="disabled", wrap="word")
        self.summary_txt.pack(padx=10, pady=6)

        nav = ttk.Frame(self)
        nav.pack(side="bottom", fill="x", pady=10)
        ttk.Button(nav, text="Back", command=lambda: controller.show_frame("OptionsPage")).pack(side="left", padx=10)
        ttk.Button(nav, text="Run", command=lambda: controller.show_frame("RunPage")).pack(side="right", padx=10)
        self.bind("<<ShowFrame>>", self.on_show_frame)
        self._last_cfg = None

    def on_show_frame(self, event=None):
        cfg = self.controller.config
        if cfg == self._last_cfg:
            return
        self._last_cfg = dict(cfg)
        lines = [
            f"API URL: {cfg.get('api_url')}",
            f"Port scan: {'Yes' if cfg.get('do_port_scan') else 'No'} (target: {cfg.get('port_target')}, range: {cfg.get('port_range')})",
            f"System info: {'Yes' if cfg.get('do_system_info') else 'No'}",
            f"Task manager: {'Yes' if cfg.get('do_task_manager') else 'No'}",
            f"Installed apps: {'Yes' if cfg.get('do_installed_apps') else 'No'}",
        ]
        self.summary_txt.configure(state="normal")
        self.summary_txt.delete("1.0", "end")
        self.summary_txt.insert("end", "\n".join(lines))
        self.summary_txt.configure(state="disabled")


class RunPage(ttk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller
        ttk.Label(self, text="Run Agent", font=("Segoe UI", 16)).pack(pady=12)
        self.status_label = ttk.Label(self, text="Ready")
        self.status_label.pack(pady=8)
        self.log_box = tk.Text(self, height=10, width=70, state="disabled", wrap="word")
        self.log_box.pack(padx=10, pady=6)

        btn_frame = ttk.Frame(self)
        btn_frame.pack(fill="x", pady=8)
        ttk.Button(btn_frame, text="Back", command=lambda: controller.show_frame("SummaryPage")).pack(side="left", padx=6)
        ttk.Button(btn_frame, text="Start", command=self.start_execution).pack(side="right", padx=6)

        self.check_progress_loop()

    def append_log(self, text):
        self.log_box.configure(state="normal")
        self.log_box.insert("end", text + "\n")
        self.log_box.see("end")
        self.log_box.configure(state="disabled")

    def check_progress_loop(self):
        try:
            while True:
                msg_type, content = self.controller.progress_queue.get_nowait()
                if msg_type == "status":
                    self.status_label.config(text=content)
                elif msg_type == "log":
                    self.append_log(content)
                elif msg_type == "error":
                    messagebox.showerror("Error", content)
                    self.status_label.config(text="Error")
                elif msg_type == "done":
                    messagebox.showinfo("Done", content)
                    self.status_label.config(text="Done")
        except queue.Empty:
            pass
        self.after(300, self.check_progress_loop)

    def start_execution(self):
        self.log_box.configure(state="normal")
        self.log_box.delete("1.0", "end")
        self.log_box.configure(state="disabled")
        cfg = dict(self.controller.config)
        worker = threading.Thread(target=run_agent_jobs, args=(cfg, self.controller.progress_queue), daemon=True)
        worker.start()
        self.status_label.config(text="Running...")


# ---------- Run ----------
if __name__ == "__main__":
    app = WizardApp()
    app.mainloop()
