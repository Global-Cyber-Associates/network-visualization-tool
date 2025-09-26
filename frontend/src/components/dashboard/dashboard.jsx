import React from "react";
import Sidebar from "../navigation/sidenav.jsx";
import "./dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <h1>Welcome</h1>
        <p>Select a section from the sidebar to view data.</p>
      </div>
    </div>
  );
};

export default Dashboard;
