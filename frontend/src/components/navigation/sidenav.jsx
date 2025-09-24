// src/navigation/Sidebar.jsx
import React from "react";
import "./sidenav.css";

function Sidebar({ active, setActive }) {
  const navItems = [
    { number: 1, label: "Authentication" },
    { number: 2, label: "Role Based Access" },
    { number: 3, label: "Devices" },
    { number: 4, label: "Ports & Vulnerabilities" },
    { number: 5, label: "Logs & Activity" },
    { number: 6, label: "Endpoint Management" },
    { number: 7, label: "Network Topology" },
    { number: 8, label: "Issues" },
  ];

  return (
    <aside className="sidebar">
      <h2 className="sidebar-logo">Network Tool</h2>
      <ul className="sidebar-nav">
        {navItems.map((item) => (
          <li
            key={item.number}
            className={active === item.number ? "active" : ""}
            onClick={() => setActive(item.number)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
