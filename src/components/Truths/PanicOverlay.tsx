"use client";

import React from "react";

interface PanicOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PanicOverlay({ isOpen, onClose }: PanicOverlayProps) {
  if (!isOpen) return null;

  return (
    <div id="panic-overlay" className="panic-overlay-screen">
      <div className="panic-overlay-content">
        <div className="panic-icon">⏳</div>
        <h2>PAUSE.</h2>
        <p>Before you type their name, dial their number, or check their profile...</p>
        <div className="panic-challenge">
          <p>
            Every contact resets your dopamine loop. Take <strong>3 complete deep breaths</strong>{" "}
            first. The urge will pass — it always does.
          </p>
        </div>
        <button id="btn-close-panic" className="btn-panic-confirm" onClick={onClose}>
          I Will Wait
        </button>
      </div>
    </div>
  );
}
