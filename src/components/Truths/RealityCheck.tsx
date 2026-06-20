import React, { useState, useRef, useEffect } from "react";
import { triggerHaptic } from "@/utils/haptics";

interface RealityCheckProps {
  realityChecks: string[];
  onAddReality: (text: string) => void;
  onDeleteReality: (index: number) => void;
  onPanicClick: () => void;
}

export default function RealityCheck({
  realityChecks,
  onAddReality,
  onDeleteReality,
  onPanicClick,
}: RealityCheckProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    triggerHaptic(20);
    setHolding(true);
    setProgress(0);

    const startTime = Date.now();
    const duration = 1500; // 1.5s

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        triggerHaptic(60); // success haptic
        setUnlocked(true);
        setHolding(false);
        setProgress(0);
      }
    }, 30);
  };

  const cancelHold = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setHolding(false);
    setProgress(0);
  };

  useEffect(() => {
    // clean up on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAdd = () => {
    const trimmed = inputVal.trim();
    if (trimmed) {
      onAddReality(trimmed);
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
      {!unlocked ? (
        <div id="reality-lock-screen" className="reality-card lock-card">
          <div className="lock-icon-wrap">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h3>Protected Space</h3>
          <p>Your list of truths is locked. Read it when nostalgia rewrites history.</p>
          <button
            id="btn-unlock-reality"
            className="btn-primary"
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onTouchStart={startHold}
            onTouchEnd={cancelHold}
            style={{ position: "relative", overflow: "hidden" }}
          >
            <span style={{ position: "relative", zIndex: 2 }}>
              {holding ? `Hold to Unlock... (${Math.round(progress)}%)` : "Press & Hold to Unlock"}
            </span>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: `${progress}%`,
                background: "rgba(255, 255, 255, 0.25)",
                zIndex: 1,
              }}
            />
          </button>
        </div>
      ) : (
        <div id="reality-unlocked-screen" className="reality-card">
          <div className="reality-list-header">
            <h3>Why We Broke Up</h3>
            <button
              id="btn-lock-reality"
              className="btn-icon-only"
              onClick={() => setUnlocked(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
              </svg>
            </button>
          </div>
          <div className="reality-input-group">
            <input
              type="text"
              id="reality-input"
              placeholder="Add a reason or boundary..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button id="btn-add-reality" className="btn-add" onClick={handleAdd}>
              +
            </button>
          </div>
          <ul id="reality-list" className="reality-list">
            {realityChecks.length === 0 ? (
              <li className="empty-state" style={{ padding: "20px" }}>
                No realities logged. Add reminders to protect yourself when nostalgia rewrites
                history.
              </li>
            ) : (
              realityChecks.map((text, idx) => (
                <li key={idx} className="reality-item">
                  <span className="reality-item-text">{text}</span>
                  <button
                    className="btn-delete-item delete-reality"
                    style={{ border: "none", background: "transparent" }}
                    onClick={() => onDeleteReality(idx)}
                  >
                    &times;
                  </button>
                </li>
              ))
            )}
          </ul>
          <div className="panic-zone">
            <h4>Feeling the urge to text them?</h4>
            <button id="btn-panic-text" className="btn-panic" onClick={onPanicClick}>
              I want to text them
            </button>
          </div>
        </div>
      )}
    </>
  );
}
