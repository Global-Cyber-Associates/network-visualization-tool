// src/components/Devices.jsx
import React from "react";
import Sidebar from "../navigation/sidenav";

const Features = () => {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
      color: "#0077b6"
    }}>
    <Sidebar />
      <h1>Features</h1>
    </div>
  );
};

export default Features;
