"use client";

import React, { useState, useEffect } from "react";

interface NCCounterProps {
  ncStart: string | null;
  onStartNC: (startDate: string) => void;
  onBrokeNC: () => void;
}

export default function NCCounter({ ncStart, onStartNC, onBrokeNC }: NCCounterProps) {
  const [localInputDate, setLocalInputDate] = useState("");
  const [timeUnits, setTimeUnits] = useState({ days: 0, hours: "00", minutes: "00" });
  const [milestone, setMilestone] = useState({ msg: "", badge: "" });

  useEffect(() => {
    if (!ncStart) return;

    const updateClock = () => {
      const start = new Date(ncStart);
      const now = new Date();
      const diff = now.getTime() - start.getTime();

      if (diff < 0) {
        setTimeUnits({ days: 0, hours: "00", minutes: "00" });
        setMilestone({
          msg: "Every minute of choosing yourself is a step toward breaking the emotional link.",
          badge: "",
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeUnits({
        days,
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
      });

      // Get milestone messages & badge content
      let msg = "Keep going. Every hour of no-contact is a dopamine reset.";
      let badge = "";

      if (days >= 90) {
        msg = "🎉 90+ days! The golden standard of recovery. Your neural paths are fully rebuilt. You are free!";
        badge = "🏆 90d Legend";
      } else if (days >= 30) {
        msg = "💎 30+ days! One full month. You are reclaiming your independence and building strength.";
        badge = "💎 30d Gold";
      } else if (days >= 14) {
        msg = "⭐ 2 weeks! The physical addiction loops are breaking. Keep your self-boundaries firm.";
        badge = "🌟 14d Silver";
      } else if (days >= 7) {
        msg = "🌱 1 week! A huge milestone. You survived the initial cravings. Keep protecting your peace.";
        badge = "🌱 7d Bronze";
      } else if (days >= 3) {
        msg = "🔥 3+ days! You are weathering the absolute peak of emotional withdrawals. Stay strong.";
        badge = "🔥 3d Strong";
      } else if (days >= 1) {
        msg = "👊 24 hours of choice. The first day is done. Every hour counts as a dopamine reset.";
        badge = "👊 1d Start";
      } else {
        msg = "Every minute of choosing yourself is a step toward breaking the emotional link.";
        badge = "";
      }

      setMilestone({ msg, badge });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [ncStart]);

  const handleStart = () => {
    let startVal = localInputDate;
    if (!startVal) {
      startVal = new Date().toISOString();
    } else {
      startVal = new Date(startVal).toISOString();
    }
    onStartNC(startVal);
  };

  return (
    <div className="nc-card" id="nc-card">
      <div className="nc-card-header">
        <div className="nc-title">
          <span>🚫</span>
          <h3>No-Contact Challenge</h3>
        </div>
        {ncStart && milestone.badge && (
          <div className="nc-badge-large" id="nc-milestone-badge">
            {milestone.badge}
          </div>
        )}
      </div>

      {!ncStart ? (
        <div id="nc-setup" className="nc-setup">
          <p>Track how long you've stayed strong. When did you last have contact?</p>
          <div className="nc-input-group">
            <input
              type="datetime-local"
              id="nc-start-date"
              value={localInputDate}
              onChange={(e) => setLocalInputDate(e.target.value)}
            />
            <button className="btn-primary" id="btn-start-nc" onClick={handleStart}>
              Start Challenge
            </button>
          </div>
        </div>
      ) : (
        <div id="nc-active" className="nc-active">
          <div className="nc-clock">
            <div className="nc-clock-unit">
              <span className="nc-clock-num" id="nc-days">
                {timeUnits.days}
              </span>
              <span className="nc-clock-label">Days</span>
            </div>
            <span className="nc-clock-sep">:</span>
            <div className="nc-clock-unit">
              <span className="nc-clock-num" id="nc-hours">
                {timeUnits.hours}
              </span>
              <span className="nc-clock-label">Hours</span>
            </div>
            <span className="nc-clock-sep">:</span>
            <div className="nc-clock-unit">
              <span className="nc-clock-num" id="nc-minutes">
                {timeUnits.minutes}
              </span>
              <span className="nc-clock-label">Mins</span>
            </div>
          </div>
          <p className="nc-milestone-msg" id="nc-milestone-msg">
            {milestone.msg}
          </p>
          <button className="btn-broke-nc" id="btn-broke-nc" onClick={onBrokeNC}>
            I broke no-contact
          </button>
        </div>
      )}
    </div>
  );
}
