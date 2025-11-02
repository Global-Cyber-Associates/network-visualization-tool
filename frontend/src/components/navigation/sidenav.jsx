import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, Usb } from "lucide-react";
import "./sidenav.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Visualizer", path: "/visualizer" },
    { label: "Devices", path: "/devices" },
    { label: "Logs & Activity", path: "/logs" },
    // { label: "Issues", path: "/issues" },
    { label: "Features", path: "/features" },
    { label: "Scan", path: "/scan" },
    { label: "USB Control", path: "/usb" },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2 className="sidebar-title">Control Panel</h2>
        <ul className="sidebar-nav">
          {navItems.map((item, idx) => (
            <li key={idx}>
              <NavLink
                to={item.path}
                onClick={() => setIsOpen(false)} // close on click (mobile)
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                end
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
