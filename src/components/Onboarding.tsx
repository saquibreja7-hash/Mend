"use client";

import React, { useState } from "react";
import { triggerHaptic } from "@/utils/haptics";

interface OnboardingProps {
  onComplete: (username: string) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [name, setName] = useState("");

  const handleNext = () => {
    triggerHaptic(15);
    if (currentSlide < 2) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      onComplete(name.trim());
    }
  };

  const handleBack = () => {
    triggerHaptic(10);
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const slides = [
    {
      icon: "💔",
      title: "Welcome to Mend",
      desc: "Heartbreak is a deep physical and emotional withdrawal. You are not weak; your brain is retraining itself. Mend is a secure, 100% private space to help you navigate this transition.",
    },
    {
      icon: "🧭",
      title: "Science-Backed Healing",
      desc: "Use five core guides to reclaim your peace: Vent feelings (CBT thought challenger), Truths (No-Contact clock & boundary list), Heal (mood tracking & daily routines), Breathe (panic relievers), and Vault (letters to your future self).",
    },
    {
      icon: "🌱",
      title: "Make it Personal",
      desc: "To customize your companion environment, let us know what to call you (optional):",
    },
  ];

  const slide = slides[currentSlide];

  return (
    <div className="panic-overlay-screen" style={{ zIndex: 10500 }}>
      <div
        className="panic-overlay-content"
        style={{
          maxWidth: "380px",
          width: "90%",
          padding: "30px 24px",
          borderRadius: "32px",
          background: "var(--bg-overlay-card)",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Carousel Icon */}
        <div
          className="brand-heart"
          style={{
            fontSize: "3.2rem",
            marginBottom: "16px",
            animation: currentSlide === 0 ? "pulse-heart 2.2s ease-in-out infinite" : "none",
          }}
        >
          {slide.icon}
        </div>

        {/* Slide Title */}
        <h2
          style={{
            fontFamily: "var(--font-head)",
            fontSize: "1.45rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: "12px",
            letterSpacing: "0.5px",
          }}
        >
          {slide.title}
        </h2>

        {/* Slide Description */}
        <p
          style={{
            fontSize: "0.86rem",
            color: "var(--text-secondary)",
            lineHeight: "1.55",
            marginBottom: "24px",
            height: "90px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {slide.desc}
        </p>

        {/* Name Input on Slide 3 */}
        {currentSlide === 2 && (
          <div style={{ width: "100%", marginBottom: "24px" }}>
            <input
              type="text"
              placeholder="Your name or nickname..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "14px",
                border: "1px solid var(--border)",
                background: "rgba(0, 0, 0, 0.03)",
                fontSize: "0.9rem",
                textAlign: "center",
              }}
              onKeyPress={(e) => e.key === "Enter" && handleNext()}
            />
          </div>
        )}

        {/* Indicator dots */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "30px" }}>
          {slides.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: idx === currentSlide ? "24px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background: idx === currentSlide ? "#202020" : "var(--border)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Button controls */}
        <div style={{ display: "flex", gap: "10px", width: "100%" }}>
          {currentSlide > 0 ? (
            <button
              className="btn-secondary"
              style={{
                flex: 1,
                background: "rgba(0, 0, 0, 0.04)",
                padding: "12px",
                borderRadius: "14px",
              }}
              onClick={handleBack}
            >
              Back
            </button>
          ) : null}
          <button
            className="btn-primary"
            style={{
              flex: 2,
              padding: "12px",
              borderRadius: "14px",
            }}
            onClick={handleNext}
          >
            {currentSlide === 2 ? "Let's Heal" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
