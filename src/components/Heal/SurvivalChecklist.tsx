"use client";

import React, { useState } from "react";
import { SelfCareItem } from "@/types";

interface SurvivalChecklistProps {
  selfCareItems: SelfCareItem[];
  customChecklistItems: SelfCareItem[];
  onToggleItem: (id: string) => void;
  onAddCustomItem: (title: string) => void;
  onDeleteCustomItem: (id: string) => void;
}

export default function SurvivalChecklist({
  selfCareItems,
  customChecklistItems,
  onToggleItem,
  onAddCustomItem,
  onDeleteCustomItem,
}: SurvivalChecklistProps) {
  const [inputVal, setInputVal] = useState("");

  const allItems = [...selfCareItems, ...customChecklistItems];
  const total = allItems.length;
  const checkedCount = allItems.filter((i) => i.checked).length;
  const percentage = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  // SVG parameters
  const radius = 45;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  let progressMsg = "Take it one small step at a time. You can do this.";
  if (percentage === 0) {
    progressMsg = "Take it one small step at a time. You can do this.";
  } else if (percentage < 40) {
    progressMsg = "Good job starting. Every small victory counts.";
  } else if (percentage < 80) {
    progressMsg = "You are taking care of yourself. Keep going.";
  } else if (percentage < 100) {
    progressMsg = "Almost there! You are doing amazing.";
  } else {
    progressMsg = "You survived today. We are so proud of you. 🤍";
  }

  const handleAdd = () => {
    const trimmed = inputVal.trim();
    if (trimmed) {
      onAddCustomItem(trimmed);
      setInputVal("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <>
      {/* Progress Ring + Checklist */}
      <div className="progress-ring-card">
        <div className="ring-container">
          <svg className="progress-ring" width="110" height="110">
            <circle
              className="progress-ring__circle-bg"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
              fill="transparent"
              r={radius}
              cx="55"
              cy="55"
            />
            <circle
              className="progress-ring__circle"
              id="progress-circle"
              stroke="url(#progress-gradient)"
              strokeWidth="8"
              fill="transparent"
              r={radius}
              cx="55"
              cy="55"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: isNaN(offset) ? circumference : offset,
                transition: "stroke-dashoffset 0.35s",
                transform: "rotate(-90deg)",
                transformOrigin: "50% 50%",
              }}
            />
            <defs>
              <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ea2804" />
                <stop offset="100%" stopColor="#c01f00" />
              </linearGradient>
            </defs>
          </svg>
          <div className="ring-text">
            <span id="selfcare-done-count">{checkedCount}</span>/
            <span id="selfcare-total-count">{total}</span>
            <span className="ring-subtext">Done</span>
          </div>
        </div>
        <div className="progress-card-info">
          <h3>Survival Level</h3>
          <p id="selfcare-progress-msg">{progressMsg}</p>
        </div>
      </div>

      <div className="checklist-container">
        <ul id="selfcare-list" className="checklist">
          {allItems.map((item) => {
            const isCustom = item.id.startsWith("custom_");
            return (
              <li
                key={item.id}
                className={`checklist-item ${item.checked ? "checked" : ""} ${
                  isCustom ? "custom" : ""
                }`}
                onClick={() => onToggleItem(item.id)}
              >
                <div className="checkbox-custom"></div>
                <div className="checklist-item-details">
                  <span className="checklist-item-title">{item.title}</span>
                  <span className="checklist-item-desc">{item.desc}</span>
                </div>
                {isCustom && (
                  <button
                    className="btn-delete-item delete-custom-item"
                    style={{ border: "none", cursor: "pointer", background: "transparent" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCustomItem(item.id);
                    }}
                  >
                    &times;
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {/* Add custom item */}
        <div className="add-checklist-item">
          <input
            type="text"
            id="new-checklist-input"
            placeholder="Add your own healing habit..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button id="btn-add-checklist-item" className="btn-add" onClick={handleAdd}>
            +
          </button>
        </div>
      </div>
    </>
  );
}
