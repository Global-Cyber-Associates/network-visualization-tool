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

  // ----------------------------------
  // Fetch Devices by Status
  // ----------------------------------
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes, deniedRes, blockedRes] = await Promise.all([
        axios.get(`${API_BASE}/pending`),
        axios.get(`${API_BASE}/approved`),
        axios.get(`${API_BASE}/denied`),
        axios.get(`${API_BASE}/blocked`),
      ]);

      setDevices({
        pending: pendingRes.data || [],
        approved: approvedRes.data || [],
        denied: deniedRes.data || [],
        blocked: blockedRes.data || [],
      });
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to fetch USB devices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // ----------------------------------
  // Handle Status Change
  // ----------------------------------
  const updateStatus = async (pnpid, action) => {
    setLoading(true);
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
      await fetchDevices();
    } catch (err) {
      console.error(`${action} failed:`, err);
      alert(`Action failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // Render Table
  // ----------------------------------
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
            <td colSpan="6" style={{ textAlign: "center" }}>
              No {type} devices
            </td>
          </tr>
        ) : (
          list.map((device) => (
            <tr key={device._id}>
              <td>{device.username}</td>
              <td
                style={{ wordBreak: "break-all" }}
                title={device.pnpid} // hover shows full ID
              >
                {device.pnpid?.length > 12
                  ? `${device.pnpid.slice(0, 12)}...`
                  : device.pnpid}
              </td>
              <td>{device.model}</td>
              <td>{device.drive || "-"}</td>
              <td className={`status-${device.status}`}>{device.status}</td>
              <td>
                {type === "pending" && (
                  <>
                    <button
                      className="allow-btn"
                      disabled={loading}
                      onClick={() => updateStatus(device.pnpid, "approve")}
                    >
                      Approve
                    </button>
                    <button
                      className="deny-btn"
                      disabled={loading}
                      onClick={() => updateStatus(device.pnpid, "deny")}
                    >
                      Deny
                    </button>
                    <button
                      className="block-btn"
                      disabled={loading}
                      onClick={() => updateStatus(device.pnpid, "block")}
                    >
                      Block
                    </button>
                  </>
                )}

                {type === "approved" && (
                  <button
                    className="block-btn"
                    disabled={loading}
                    onClick={() => updateStatus(device.pnpid, "block")}
                  >
                    Block
                  </button>
                )}

                {type === "blocked" && (
                  <button
                    className="allow-btn"
                    disabled={loading}
                    onClick={() => updateStatus(device.pnpid, "unblock")}
                  >
                    Unblock
                  </button>
                )}

                {type === "denied" && (
                  <button
                    className="allow-btn"
                    disabled={loading}
                    onClick={() => updateStatus(device.pnpid, "approve")}
                  >
                    Re-Approve
                  </button>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  // ----------------------------------
  // UI Render
  // ----------------------------------
  return (
    <div className="usb-control-page">
      <Sidebar />
      <div className="usb-control">
        <h1>USB Access Control</h1>

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
          {loading ? <p>Loading...</p> : renderTable(devices[activeTab] || [], activeTab)}
        </div>
      </div>
    </div>
  );
};

export default UsbControl;
