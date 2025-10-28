import React from "react";

export default function VisualizerControls({
  loading,
  message,
  showDesc,
  setShowDesc,
  handleRunVisualizer,
}) {
  return (
    <div className="visualizer-controls">
      <button className="desc-toggle-btn" onClick={() => setShowDesc((p) => !p)}>
        {showDesc ? "Hide Descriptions" : "Show Descriptions"}
      </button>

      <button
        className="reset-btn"
        onClick={() => {
          localStorage.removeItem("devicePositions");
          window.location.reload();
        }}
      >
        Reset Layout
      </button>

      {message && <p className="status-msg">{message}</p>}
    </div>
  );
}
