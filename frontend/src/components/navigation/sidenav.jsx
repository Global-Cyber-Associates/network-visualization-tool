// src/navigation/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./sidenav.css";

const Sidebar = () => {
  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Visualizer", path: "/visualizer" },
    { label: "Devices", path: "/devices" },
    { label: "Logs & Activity", path: "/logs" },
    { label: "Issues", path: "/issues" },
    { label: "Features", path: "/features" },
  ];

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Control Panel</h2>
      <ul className="sidebar-nav">
        {navItems.map((item, idx) => (
          <li key={idx}>
            <NavLink
              to={item.path}
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
  );
};

export default Sidebar;
