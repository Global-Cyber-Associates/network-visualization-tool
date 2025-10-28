import winreg
import json

def get_installed_apps():
    """Return a list of installed applications from Windows registry."""
    apps = []
    uninstall_keys = [
        r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
        r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
    ]

    for root_key in (winreg.HKEY_LOCAL_MACHINE, winreg.HKEY_CURRENT_USER):
        for sub_key in uninstall_keys:
            try:
                with winreg.OpenKey(root_key, sub_key) as key:
                    for i in range(0, winreg.QueryInfoKey(key)[0]):
                        try:
                            subkey_name = winreg.EnumKey(key, i)
                            with winreg.OpenKey(key, subkey_name) as subkey:
                                name, version, publisher = None, None, None
                                try:
                                    name = winreg.QueryValueEx(subkey, "DisplayName")[0]
                                except FileNotFoundError:
                                    continue
                                try:
                                    version = winreg.QueryValueEx(subkey, "DisplayVersion")[0]
                                except FileNotFoundError:
                                    version = "Unknown"
                                try:
                                    publisher = winreg.QueryValueEx(subkey, "Publisher")[0]
                                except FileNotFoundError:
                                    publisher = "Unknown"
                                apps.append({
                                    "name": name,
                                    "version": version,
                                    "publisher": publisher
                                })
                        except FileNotFoundError:
                            continue
            except FileNotFoundError:
                continue

    return apps


if __name__ == "__main__":
    installed = get_installed_apps()
    print(json.dumps(installed, indent=2))
