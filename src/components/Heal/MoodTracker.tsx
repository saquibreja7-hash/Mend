"use client";

import React, { useState, useEffect } from "react";
import { MoodEntry } from "@/types";
import { triggerHaptic } from "@/utils/haptics";

interface MoodTrackerProps {
  moodHistory: MoodEntry[];
  onSaveMood: (score: number) => void;
}

const moodEmojis = ["😭", "😢", "😔", "😕", "😐", "🙂", "😊", "😄", "🥰", "🌟"];

const moodLabels = [
  "Devastated",
  "Sad",
  "Heavy",
  "Confused",
  "Numb",
  "Okay",
  "Good",
  "Happy",
  "Loved",
  "Vibrant",
];

export default function MoodTracker({ moodHistory, onSaveMood }: MoodTrackerProps) {
  const [selectedScore, setSelectedScore] = useState(5);
  const [todayLogged, setTodayLogged] = useState<MoodEntry | null>(null);
  const [forceEditMode, setForceEditMode] = useState(false);
  const [trendMsg, setTrendMsg] = useState("");
  const [chartBars, setChartBars] = useState<any[]>([]);

  const getTodayDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };

  const getFormattedTodayLabel = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
    return new Date().toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    const todayStr = getTodayDateString();
    const entry = moodHistory.find((h) => h.date === todayStr) || null;
    setTodayLogged(entry);
    
    // Auto-exit edit mode when entry updates
    if (entry) {
      setSelectedScore(entry.score);
    }
    setForceEditMode(false);

    // Calculate trend
    if (entry) {
      const prevEntries = moodHistory.filter((h) => h.date !== todayStr);
      if (prevEntries.length > 0) {
        const lastEntry = prevEntries[prevEntries.length - 1];
        if (entry.score > lastEntry.score) {
          setTrendMsg("📈 You feel better than yesterday! Progress is real.");
        } else if (entry.score < lastEntry.score) {
          setTrendMsg("💤 You're lower today. Healing waves are normal — rest up.");
        } else {
          setTrendMsg("✨ Consistent energy level. Focus on small comforts today.");
        }
      } else {
        setTrendMsg("✨ First check-in! Keep logging daily to see patterns.");
      }
    }

    // Build last 7 days chart bars
    const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
    const today = new Date();
    const barsList = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      const dayLabel = daysOfWeek[d.getDay()];

      const historyEntry = moodHistory.find((h) => h.date === dateStr);
      barsList.push({
        dayLabel,
        score: historyEntry ? historyEntry.score : null,
      });
    }
    setChartBars(barsList);
  }, [moodHistory]);

  const handleSave = () => {
    triggerHaptic(20);
    onSaveMood(selectedScore);
    setForceEditMode(false);
  };

  const handleEditClick = () => {
    triggerHaptic(15);
    setForceEditMode(true);
  };

  const showInputSection = !todayLogged || forceEditMode;

  return (
    <div className="mood-card" id="mood-card">
      <div className="mood-header">
        <h3>How are you feeling?</h3>
        <span className="mood-date" id="mood-date-label">
          {getFormattedTodayLabel()}
        </span>
      </div>

      {showInputSection ? (
        <div className="mood-slider-wrap" id="mood-input-section" style={{ paddingBottom: "10px" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "14px" }}>
            Tap the emoji that fits your current state:
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "8px",
              margin: "12px 0 20px",
            }}
          >
            {moodEmojis.map((emoji, idx) => {
              const score = idx + 1;
              const isSelected = selectedScore === score;
              return (
                <button
                  key={score}
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setSelectedScore(score);
                  }}
                  style={{
                    fontSize: "1.4rem",
                    padding: "10px 4px",
                    borderRadius: "14px",
                    background: isSelected ? "var(--grad-hero)" : "var(--bg-input)",
                    color: isSelected ? "#ffffff" : "var(--text-primary)",
                    border: isSelected ? "2px solid var(--purple)" : "2px solid transparent",
                    boxShadow: isSelected ? "var(--shadow-pink)" : "none",
                    transition: "all 0.2s var(--ease-smooth)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                    cursor: "pointer",
                  }}
                >
                  <span>{emoji}</span>
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, opacity: isSelected ? 1 : 0.5 }}>
                    {score}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mood-value-display" style={{ margin: "0 0 16px" }}>
            <span id="mood-emoji-display" style={{ fontSize: "1.8rem" }}>
              {moodEmojis[selectedScore - 1]}
            </span>
            <span style={{ margin: "0 8px", fontSize: "0.9rem", fontWeight: 600 }}>
              {moodLabels[selectedScore - 1]}
            </span>
            <span id="mood-score-display" className="mood-score">
              {selectedScore}
            </span>
            <span>/10</span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-primary" id="btn-save-mood" style={{ flexGrow: 1 }} onClick={handleSave}>
              {todayLogged ? "Update Mood" : "Log Mood"}
            </button>
            {todayLogged && (
              <button
                className="btn-secondary"
                style={{ background: "rgba(0,0,0,0.04)" }}
                onClick={() => setForceEditMode(false)}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mood-logged" id="mood-logged-section" style={{ display: "block" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="mood-logged-display" style={{ borderBottom: "none", paddingBottom: 0 }}>
              <span id="mood-logged-emoji" className="mood-logged-emoji">
                {moodEmojis[todayLogged.score - 1]}
              </span>
              <div>
                <p className="mood-logged-score">
                  Today: <strong>{todayLogged.score}</strong>/10 ({moodLabels[todayLogged.score - 1]})
                </p>
                <p className="mood-trend-msg" id="mood-trend-msg" style={{ margin: "2px 0 0 0" }}>
                  {trendMsg}
                </p>
              </div>
            </div>
            <button
              className="btn-secondary-outline"
              style={{
                fontSize: "0.75rem",
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
              onClick={handleEditClick}
            >
              Edit Mood
            </button>
          </div>
        </div>
      )}

      {/* 7-day bar chart */}
      <div className="mood-chart-wrap">
        <h4>Last 7 Days</h4>
        <div className="mood-bar-chart" id="mood-bar-chart">
          {chartBars.map((bar, idx) => {
            const hasScore = bar.score !== null;
            const heightPx = hasScore ? Math.max(4, Math.round((bar.score / 10) * 44)) + 4 : 4;
            const title = hasScore
              ? `Score: ${bar.score}/10 (${moodEmojis[bar.score - 1]})`
              : "Not logged";

            return (
              <div key={idx} className="mood-bar-col">
                <div
                  className={`mood-bar ${!hasScore ? "empty" : ""}`}
                  style={{ height: `${heightPx}px` }}
                  title={title}
                ></div>
                <span className="mood-bar-label">{bar.dayLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
