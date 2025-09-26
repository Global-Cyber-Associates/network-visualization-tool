import React from "react";
import "./dashboard.css"; // import external CSS

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <p>
        Welcome to the dashboard page. The sidebar stays fixed on the left and
        this content adjusts properly to the right.
      </p>
    </div>
  );
};

export default Dashboard;
