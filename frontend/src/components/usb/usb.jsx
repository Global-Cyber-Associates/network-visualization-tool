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
    const interval = setInterval(fetchDevices, 10000);
    return () => clearInterval(interval);
  }, []);

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

  const renderTable = (list, type) => (
    <div className="table-wrapper">
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
              <td colSpan="6" className="no-data">
                No {type} devices
              </td>
            </tr>
          ) : (
            list.map((device) => (
              <tr key={device._id}>
                <td>{device.username}</td>
                <td className="tooltip-container">
                  <span className="tooltip-text">{device.pnpid}</span>
                  {device.pnpid?.length > 12
                    ? `${device.pnpid.slice(0, 12)}...`
                    : device.pnpid}
                </td>
                <td>{device.model}</td>
                <td>{device.drive || "-"}</td>
                <td>
                  <span className={`status-tag ${device.status}`}>
                    {device.status}
                  </span>
                </td>
                <td>
                  {type === "pending" && (
                    <>
                      <button
                        className="action-btn approve"
                        onClick={() => updateStatus(device.pnpid, "approve")}
                        disabled={loading}
                      >
                        Approve
                      </button>
                      <button
                        className="action-btn deny"
                        onClick={() => updateStatus(device.pnpid, "deny")}
                        disabled={loading}
                      >
                        Deny
                      </button>
                      <button
                        className="action-btn block"
                        onClick={() => updateStatus(device.pnpid, "block")}
                        disabled={loading}
                      >
                        Block
                      </button>
                    </>
                  )}

                  {type === "approved" && (
                    <button
                      className="action-btn block"
                      onClick={() => updateStatus(device.pnpid, "block")}
                      disabled={loading}
                    >
                      Block
                    </button>
                  )}

                  {type === "blocked" && (
                    <button
                      className="action-btn approve"
                      onClick={() => updateStatus(device.pnpid, "unblock")}
                      disabled={loading}
                    >
                      Unblock
                    </button>
                  )}

                  {type === "denied" && (
                    <button
                      className="action-btn approve"
                      onClick={() => updateStatus(device.pnpid, "approve")}
                      disabled={loading}
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
    </div>
  );

  return (
    <div className="usb-control-container dark">
      <Sidebar />
      <main className="usb-main">
        <header className="usb-header">
          <h1>USB Access Control</h1>
          <p>Monitor and manage connected USB devices securely.</p>
        </header>

        <div className="tab-bar">
          {["pending", "approved", "denied", "blocked"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
              <span className="count">{devices[tab]?.length || 0}</span>
            </button>
          ))}
        </div>

        <section className="tab-content">
          {loading ? (
            <p className="loading">Loading...</p>
          ) : (
            renderTable(devices[activeTab], activeTab)
          )}
        </section>
      </main>
    </div>
  );
};

export default UsbControl;
