import React, { useState, useEffect } from "react";
import Sidebar from "../navigation/sidenav.jsx";
import FloorManager from "./view/FloorManager.jsx";
import FloorGrid from "./view/FloorGrid.jsx";
import "./visualizer.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);


export default function Visualizer() {
  const [floors, setFloors] = useState([{ id: 1, name: "Floor 1", devices: [] }]);
  const [activeFloor, setActiveFloor] = useState(1);
  const [loading, setLoading] = useState(false);


  // ✅ Fetch devices from API once
  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendUrl}/visualizer-data`);
        const data = await res.json(); 
        if (!Array.isArray(data)) return;

        // Map API response into visualizer devices
        const fetchedDevices = data.map((d, i) => ({
          id: i + 1,
          name: d.hostname || "Unknown",
          ip: d.ip || "N/A",
          mac: d.mac || "Unknown",
          noAgent: d.noAgent,
          icon: d.noAgent ? "⚠️" : "💻",
          x: (i % 6) * 120,
          y: Math.floor(i / 6) * 120,
        }));

        // Assign to floor 1
        setFloors([{ id: 1, name: "Floor 1", devices: fetchedDevices }]);
      } catch (err) {
        console.error("❌ Failed to fetch devices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const addFloor = () => {
    const newId = floors.length + 1;
    setFloors([...floors, { id: newId, name: `Floor ${newId}`, devices: [] }]);
    setActiveFloor(newId);
  };

  const updateFloorDevices = (floorId, devices) => {
    setFloors((prev) =>
      prev.map((f) => (f.id === floorId ? { ...f, devices } : f))
    );
  };

  return (
    <div className="visualizer-page">
      <Sidebar />

      <div className="visualizer-wrap">
        <div className="visualizer-header">
          <h1>Network Floor Visualizer</h1>
          <FloorManager
            floors={floors}
            activeFloor={activeFloor}
            onAdd={addFloor}
            onSwitch={setActiveFloor}
          />
        </div>

        {loading ? (
          <div className="loading">Fetching devices...</div>
        ) : (
          <FloorGrid
            key={activeFloor}
            floor={floors.find((f) => f.id === activeFloor)}
            updateDevices={(devices) => updateFloorDevices(activeFloor, devices)}
          />
        )}
      </div>
    </div>
  );
}
