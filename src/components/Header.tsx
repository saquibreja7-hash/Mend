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
            <span id="streak-count">{streak}</span>d
          </div>
          {ncStart && (
            <div className="nc-badge" id="nc-header-badge">
              <span>🚫</span>
              <span id="nc-header-days">{ncDays}</span>d NC
            </div>
          )}
          <button
            onClick={onSettingsClick}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.1rem",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              opacity: 0.8,
            }}
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>
      <div className="healing-meter-wrap">
        <div className="healing-meter-labels">
          <span>Today's Healing</span>
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
