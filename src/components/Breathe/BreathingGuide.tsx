"use client";

import React, { useState, useEffect, useRef } from "react";

const techniques = {
  box: {
    name: "Box Breathing",
    desc: "<strong>Box Breathing</strong> — Used by Navy SEALs. Inhale 4s, Hold 4s, Exhale 4s, Hold 4s. Resets the autonomic nervous system.",
    phases: [
      { text: "Breathe In...", duration: 4, scale: "scale(1.4)", bg: "rgba(255, 117, 140, 0.2)", shadow: "0 0 45px rgba(255, 117, 140, 0.4)" },
      { text: "Hold Breath...", duration: 4, scale: "scale(1.4)", bg: "rgba(138, 43, 226, 0.2)", shadow: "0 0 45px rgba(138, 43, 226, 0.4)" },
      { text: "Exhale Slow...", duration: 4, scale: "scale(1.0)", bg: "rgba(6, 182, 212, 0.2)", shadow: "0 0 25px rgba(6, 182, 212, 0.3)" },
      { text: "Hold Empty...", duration: 4, scale: "scale(1.0)", bg: "rgba(14, 10, 33, 0.3)", shadow: "0 0 15px rgba(255, 255, 255, 0.05)" }
    ]
  },
  "478": {
    name: "4-7-8 Breathing",
    desc: "<strong>4-7-8 Breathing</strong> — Dr. Andrew Weil's clinical standard. Inhale 4s, Hold 7s, Exhale 8s. Powerful natural tranquilizer for the nervous system.",
    phases: [
      { text: "Breathe In...", duration: 4, scale: "scale(1.4)", bg: "rgba(255, 117, 140, 0.2)", shadow: "0 0 45px rgba(255, 117, 140, 0.4)" },
      { text: "Hold Breath...", duration: 7, scale: "scale(1.4)", bg: "rgba(138, 43, 226, 0.2)", shadow: "0 0 45px rgba(138, 43, 226, 0.4)" },
      { text: "Exhale Slow...", duration: 8, scale: "scale(1.0)", bg: "rgba(6, 182, 212, 0.2)", shadow: "0 0 25px rgba(6, 182, 212, 0.3)" }
    ]
  },
  sigh: {
    name: "Physiological Sigh",
    desc: "<strong>Physiological Sigh</strong> — Fastest behavioral way to reduce autonomic arousal in real-time. Double inhale (long-short) 2s, Exhale 6s. Repeat 3 times.",
    phases: [
      { text: "Double Inhale...", duration: 2, scale: "scale(1.4)", bg: "rgba(255, 117, 140, 0.2)", shadow: "0 0 45px rgba(255, 117, 140, 0.4)" },
      { text: "Exhale Long...", duration: 6, scale: "scale(1.0)", bg: "rgba(6, 182, 212, 0.2)", shadow: "0 0 25px rgba(6, 182, 212, 0.3)" }
    ]
  }
};

type TechKey = keyof typeof techniques;

export default function BreathingGuide() {
  const [selectedTech, setSelectedTech] = useState<TechKey>("box");
  const [isBreathing, setIsBreathing] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [statusText, setStatusText] = useState("Ready to begin?");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cycleCountRef = useRef(0);
  const phaseIdxRef = useRef(0);
  const secondsLeftRef = useRef(4);

  const tech = techniques[selectedTech];
  const activePhase = tech.phases[phaseIdx];

  // Stop session whenever technique changes
  useEffect(() => {
    stopSession();
    const initialDuration = techniques[selectedTech].phases[0].duration;
    setSecondsLeft(initialDuration);
    secondsLeftRef.current = initialDuration;
    phaseIdxRef.current = 0;
    setPhaseIdx(0);
  }, [selectedTech]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startSession = () => {
    setIsBreathing(true);
    cycleCountRef.current = 0;
    phaseIdxRef.current = 0;
    setPhaseIdx(0);

    const initialDuration = tech.phases[0].duration;
    setSecondsLeft(initialDuration);
    secondsLeftRef.current = initialDuration;
    setStatusText(tech.phases[0].text);

    timerRef.current = setInterval(() => {
      // Countdown
      secondsLeftRef.current -= 1;

      if (secondsLeftRef.current < 0) {
        // Shift to next phase
        const nextIdx = (phaseIdxRef.current + 1) % tech.phases.length;

        // Physiological Sigh cycle limit checking (limit to 3 cycles)
        if (selectedTech === "sigh" && nextIdx === 0) {
          cycleCountRef.current += 1;
          if (cycleCountRef.current >= 3) {
            stopSession();
            setStatusText("Sigh Complete");
            return;
          }
        }

        phaseIdxRef.current = nextIdx;
        setPhaseIdx(nextIdx);

        const nextDuration = tech.phases[nextIdx].duration;
        secondsLeftRef.current = nextDuration;
        setSecondsLeft(nextDuration);
        setStatusText(tech.phases[nextIdx].text);
      } else {
        setSecondsLeft(secondsLeftRef.current);
      }
    }, 1000);
  };

  const stopSession = () => {
    setIsBreathing(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStatusText("Ready to begin?");
    const initialDuration = techniques[selectedTech].phases[0].duration;
    setSecondsLeft(initialDuration);
    secondsLeftRef.current = initialDuration;
    setPhaseIdx(0);
    phaseIdxRef.current = 0;
  };

  const handleToggle = () => {
    if (isBreathing) {
      stopSession();
    } else {
      startSession();
    }
  };

  return (
    <div id="view-breathing" className="view-section active" style={{ display: "flex" }}>
      <div className="section-header">
        <h2>Anxiety Release</h2>
        <p>Ground yourself when waves of panic or longing hit you.</p>
      </div>

      <div className="breathing-techniques">
        <button
          className={`technique-btn ${selectedTech === "box" ? "active" : ""}`}
          onClick={() => setSelectedTech("box")}
        >
          Box
        </button>
        <button
          className={`technique-btn ${selectedTech === "478" ? "active" : ""}`}
          onClick={() => setSelectedTech("478")}
        >
          4-7-8
        </button>
        <button
          className={`technique-btn ${selectedTech === "sigh" ? "active" : ""}`}
          onClick={() => setSelectedTech("sigh")}
        >
          Phys. Sigh
        </button>
      </div>

      <div className="breathing-card">
        <div className="breathing-instructions" id="breathing-text">
          {statusText}
        </div>

        <div className="breathing-circle-wrapper">
          <div
            className="breathing-circle-outer"
            id="breathing-circle"
            style={{
              transform: isBreathing ? activePhase.scale : "scale(1.0)",
              backgroundColor: isBreathing ? activePhase.bg : "rgba(138, 43, 226, 0.1)",
              boxShadow: isBreathing ? activePhase.shadow : "0 0 40px rgba(138, 43, 226, 0.2)",
              transition: "transform 1s linear, background-color 0.8s ease, box-shadow 0.8s ease",
            }}
          >
            <div className="breathing-circle-inner">
              <span id="breathing-timer">{secondsLeft}</span>
            </div>
          </div>
        </div>

        <div className="technique-info" id="technique-info">
          <p
            id="technique-description"
            dangerouslySetInnerHTML={{ __html: tech.desc }}
          ></p>
        </div>

        <div className="breathing-controls">
          <button
            id="btn-breathing"
            className="btn-primary"
            onClick={handleToggle}
            style={
              isBreathing
                ? {
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-light)",
                    boxShadow: "none",
                    color: "var(--text-secondary)",
                  }
                : {}
            }
          >
            {isBreathing ? "Stop Session" : "Start Session"}
          </button>
        </div>
      </div>
    </div>
  );
}
