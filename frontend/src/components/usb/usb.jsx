import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../navigation/sidenav";
import "./usb.css";

const API_BASE = "http://localhost:5000/api/usb";

const UsbControl = () => {
  const [devices, setDevices] = useState({
    pending: [],
    approved: [],
    denied: [],
    blocked: [],
  });
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [rowAction, setRowAction] = useState(null);

  // Fetch Devices
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const endpoints = ["pending", "approved", "denied", "blocked"];
      const responses = await Promise.all(
        endpoints.map((e) => axios.get(`${API_BASE}/${e}`))
      );
      setDevices(
        endpoints.reduce((acc, key, i) => {
          acc[key] = responses[i].data || [];
          return acc;
        }, {})
      );
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to fetch USB devices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle Status Change
  const updateStatus = async (pnpid, action) => {
    setRowAction(pnpid);
    try {
      const endpointMap = {
        approve: "approve",
        deny: "deny",
        block: "block",
        unblock: "unblock",
      };
      const endpoint = endpointMap[action];
      if (!endpoint) return;

      const res = await axios.post(`${API_BASE}/${endpoint}`, { pnpid });
      console.log(res.data.message);

      // Update UI without full refetch
      setDevices((prev) => {
        const updated = { ...prev };
        for (const key in updated) {
          updated[key] = updated[key].filter((d) => d.pnpid !== pnpid);
        }

        if (action === "approve") updated.approved.push({ ...res.data.approved });
        if (action === "deny") updated.denied.push({ pnpid, status: "denied" });
        if (action === "block") updated.blocked.push({ pnpid, status: "blocked" });
        if (action === "unblock") updated.pending.push({ pnpid, status: "pending" });

        return updated;
      });
    } catch (err) {
      console.error(`${action} failed:`, err);
      alert(`Action failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setRowAction(null);
    }
  };

  // Render Table
  const renderTable = (list, type) => (
    <table className="usb-table">
      <thead>
        <tr>
          <th>User</th>
          <th>PNP ID</th>
          <th>Model</th>
          <th>Drive</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {list.length === 0 ? (
          <tr>
            <td colSpan="6" style={{ textAlign: "center", opacity: 0.6 }}>
              No {type} devices
            </td>
          </tr>
        ) : (
          list.map((device) => (
            <tr key={device._id || device.pnpid}>
              <td>{device.username || "-"}</td>
              <td title={device.pnpid}>
                {device.pnpid?.length > 12
                  ? `${device.pnpid.slice(0, 12)}...`
                  : device.pnpid}
              </td>
              <td>{device.model || "-"}</td>
              <td>{device.drive || "-"}</td>
              <td className={`status-${type}`}>{type}</td>
              <td>
                {rowAction === device.pnpid ? (
                  <span className="processing">Processing...</span>
                ) : (
                  <>
                    {type === "pending" && (
                      <>
                        <button
                          className="allow-btn"
                          onClick={() => updateStatus(device.pnpid, "approve")}
                        >
                          Approve
                        </button>
                        <button
                          className="deny-btn"
                          onClick={() => updateStatus(device.pnpid, "deny")}
                        >
                          Deny
                        </button>
                        <button
                          className="block-btn"
                          onClick={() => updateStatus(device.pnpid, "block")}
                        >
                          Block
                        </button>
                      </>
                    )}

                    {type === "approved" && (
                      <button
                        className="block-btn"
                        onClick={() => updateStatus(device.pnpid, "block")}
                      >
                        Block
                      </button>
                    )}

                    {type === "blocked" && (
                      <button
                        className="allow-btn"
                        onClick={() => updateStatus(device.pnpid, "unblock")}
                      >
                        Unblock
                      </button>
                    )}

                    {type === "denied" && (
                      <button
                        className="allow-btn"
                        onClick={() => updateStatus(device.pnpid, "approve")}
                      >
                        Re-Approve
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  return (
    <div className="usb-control-page">
      <Sidebar />
      <div className="usb-control">
        <div className="header">
          <h1>USB Access Control</h1>
          {loading && <div className="loader">⏳ Refreshing...</div>}
        </div>

        <div className="tab-header">
          {["pending", "approved", "denied", "blocked"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "tab active" : "tab"}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "pending" && "🕒 Pending"}
              {tab === "approved" && "✅ Approved"}
              {tab === "denied" && "❌ Denied"}
              {tab === "blocked" && "🚫 Blocked"}
              &nbsp;({devices[tab]?.length || 0})
            </button>
          ))}
        </div>

        <div className="tab-content">
          {renderTable(devices[activeTab] || [], activeTab)}
        </div>
      </div>
    </div>
  );
};

export default UsbControl;
