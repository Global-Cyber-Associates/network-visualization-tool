// src/navigation/Sidebar.jsx
import React from "react";
import "./sidenav.css";

function Sidebar({ active, setActive }) {
  const navItems = [
    { number: 1, label: "Visualizer" },
    { number: 2, label: "Devices" },
    { number: 3, label: "Logs & Activity" },
    { number: 4, label: "Issues" },
    { number: 5, label: "Upgrade" }
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
