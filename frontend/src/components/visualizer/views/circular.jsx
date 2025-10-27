import React, { useState, useEffect } from "react";
import "./circular.css";

export default function CircularLayout({ devices, links, draggedNode, setDraggedNode, showDesc }) {
  const [positions, setPositions] = useState({});
  const [size, setSize] = useState({ width: 800, height: 400 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // 🌀 Compute circular positions
  useEffect(() => {
    if (!devices || devices.length === 0) return;

    const computePositions = () => {
      const W = window.innerWidth * 0.7;
      const H = window.innerHeight * 0.6;
      setSize({ width: W, height: H });

      const newPos = {};
      const hub = devices.find((d) => d.type === "router") || devices[0];
      const others = devices.filter((d) => d.id !== hub.id);

      const cx = W / 2;
      const cy = H / 2;
      const radius = Math.min(W, H) * 0.35;

      newPos[hub.id] = { x: cx, y: cy };

      others.forEach((dev, i) => {
        const angle = (i / others.length) * Math.PI * 2;
        newPos[dev.id] = {
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
        };
      });

      setPositions(newPos);
    };

    computePositions();
    window.addEventListener("resize", computePositions);
    return () => window.removeEventListener("resize", computePositions);
  }, [devices]);

  // 🖱️ Drag handlers
  const handleMouseDown = (id, e) => {
    e.stopPropagation();
    const svg = e.target.ownerSVGElement;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursor = pt.matrixTransform(svg.getScreenCTM().inverse());
    const pos = positions[id];
    setDraggedNode(id);
    setOffset({ x: pos.x - cursor.x, y: pos.y - cursor.y });
  };

  const handleMouseMove = (e) => {
    if (!draggedNode) return;
    const svg = e.target.ownerSVGElement || e.target;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursor = pt.matrixTransform(svg.getScreenCTM().inverse());
    setPositions((prev) => ({
      ...prev,
      [draggedNode]: { x: cursor.x + offset.x, y: cursor.y + offset.y },
    }));
  };

  const handleMouseUp = () => setDraggedNode(null);

  return (
    <svg
      className="visualizer-svg"
      width={size.width}
      height={size.height}
      viewBox={`0 0 ${size.width} ${size.height}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <defs>
        <linearGradient id="link-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3db2ff" />
          <stop offset="100%" stopColor="#00bfff" />
        </linearGradient>
        <radialGradient id="hub-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb347" />
          <stop offset="100%" stopColor="#ffcc33" />
        </radialGradient>
      </defs>

      {/* 🔗 Links */}
      {links.map((link, idx) => {
        const a = positions[link.from];
        const b = positions[link.to];
        if (!a || !b) return null;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2 - 40;
        return (
          <path
            key={idx}
            d={`M ${a.x},${a.y} Q ${mx},${my} ${b.x},${b.y}`}
            stroke="url(#link-gradient)"
            strokeWidth="2"
            fill="none"
          />
        );
      })}

      {/* 💻 / 🛜 Nodes */}
      {devices.map((d) => {
        const pos = positions[d.id];
        if (!pos) return null;
        const radius = d.type === "router" ? 28 : 20;
        const fillColor = d.type === "router" ? "url(#hub-gradient)" : d.noAgent ? "#ff4d4f" : "#00bfff";
        const statusText = d.noAgent ? "No Agent" : d.status;

        return (
          <g
            key={d.id}
            transform={`translate(${pos.x}, ${pos.y})`}
            onMouseDown={(e) => handleMouseDown(d.id, e)}
            style={{ cursor: "grab" }}
          >
            <circle r={radius} fill={fillColor} />
            <text
              x="0"
              y="6"
              textAnchor="middle"
              fontSize="18"
              fill="#fff"
              fontWeight={700}
              pointerEvents="none"
            >
              {d.icon}
            </text>

            {showDesc && (
              <foreignObject x={-100} y={radius + 8} width={200} height={80} pointerEvents="none">
                <div className="node-label">
                  <div className="node-name">{d.name}</div>
                  <div className="node-ip">{d.ip}</div>
                  <div className={`node-status ${d.noAgent ? "no-agent" : "online"}`}>
                    {statusText}
                  </div>
                </div>
              </foreignObject>
            )}
          </g>
        );
      })}
    </svg>
  );
}
