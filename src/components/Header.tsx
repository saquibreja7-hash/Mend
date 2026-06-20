"use client";

import React, { useEffect, useState } from "react";

interface HeaderProps {
  streak: number;
  ncStart: string | null;
  healingPercentage: number;
  onSettingsClick: () => void;
}

export default function Header({ streak, ncStart, healingPercentage, onSettingsClick }: HeaderProps) {
  const [ncDays, setNcDays] = useState<number>(0);

  useEffect(() => {
    if (!ncStart) return;

    const calculateDays = () => {
      const start = new Date(ncStart);
      const now = new Date();
      const diff = now.getTime() - start.getTime();
      if (diff < 0) {
        setNcDays(0);
      } else {
        setNcDays(Math.floor(diff / (1000 * 60 * 60 * 24)));
      }
    };

    calculateDays();
    const interval = setInterval(calculateDays, 60000); // update every minute
    return () => clearInterval(interval);
  }, [ncStart]);

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand">
          <span className="brand-heart">💔</span>
          <h1>MEND</h1>
        </div>
        <div className="header-badges">
          <div className="streak-container" id="streak-badge-container">
            <span>🔥</span>
            <span id="streak-count">{streak}</span>
            <span style={{ opacity: 0.6, fontSize: "0.7rem" }}>d</span>
          </div>
          {ncStart && (
            <div className="nc-badge" id="nc-header-badge">
              <span>🚫</span>
              <span id="nc-header-days">{ncDays}</span>
              <span style={{ opacity: 0.7, fontSize: "0.7rem" }}>NC</span>
            </div>
          )}
          <button
            onClick={onSettingsClick}
            style={{
              background: "rgba(32,32,32,0.04)",
              border: "1px solid var(--border)",
              borderRadius: "9999px",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              fontSize: "0.95rem",
              flexShrink: 0,
            }}
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>
      <div className="healing-meter-wrap" style={{ marginTop: "8px" }}>
        <div className="healing-meter-labels">
          <span>Today&apos;s Healing</span>
          <span id="healing-percentage">{healingPercentage}%</span>
        </div>
        <div className="healing-bar-bg">
          <div
            className="healing-bar-fill"
            id="healing-bar"
            style={{ width: `${healingPercentage}%` }}
          ></div>
        </div>
      </div>
    </header>
  );
}
