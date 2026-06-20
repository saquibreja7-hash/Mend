"use client";

import React, { useState, useRef, useEffect } from "react";

interface VentWallProps {
  onVentComplete: () => void;
}

const distortionKeywords = [
  "always",
  "never",
  "forever",
  "nothing",
  "everything",
  "ruined",
  "worst",
  "impossible",
  "hopeless",
  "hate",
];

class Particle {
  originX: number;
  originY: number;
  x: number;
  y: number;
  size: number;
  alpha: number;
  effect: string;
  vx: number = 0;
  vy: number = 0;
  hue: number = 0;
  life: number = 0;
  maxLife: number = 0;
  gravity?: number;
  bounce?: number;
  color?: string;

  constructor(x: number, y: number, effect: string) {
    this.originX = x;
    this.originY = y;
    this.x = x;
    this.y = y;
    this.size = Math.random() * 2.5 + 0.8;
    this.alpha = 1;
    this.effect = effect;

    if (effect === "burn") {
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = -Math.random() * 2 - 1.5;
      this.hue = Math.random() * 30 + 10;
      this.life = Math.random() * 60 + 40;
      this.maxLife = this.life;
    } else if (effect === "shatter") {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 3;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 1.5;
      this.gravity = 0.25;
      this.bounce = Math.random() * 0.4 + 0.2;
      this.life = Math.random() * 80 + 60;
      this.maxLife = this.life;
      this.color = "#0891b2";
    } else if (effect === "space") {
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = -Math.random() * 0.8 - 0.3;
      this.life = Math.random() * 120 + 80;
      this.maxLife = this.life;
      this.color = `rgba(124, 58, 237, ${Math.random() * 0.6 + 0.4})`;
    }
  }

  update(width: number, height: number) {
    this.life--;
    this.alpha = Math.max(0, this.life / this.maxLife);

    if (this.effect === "burn") {
      this.x += this.vx;
      this.y += this.vy;
      this.vx += (Math.random() - 0.5) * 0.3;
      const ratio = this.life / this.maxLife;
      if (ratio > 0.6) {
        this.color = `rgba(255, ${Math.floor(100 + ratio * 155)}, 30, ${this.alpha})`;
      } else if (ratio > 0.3) {
        this.color = `rgba(255, ${Math.floor(ratio * 200)}, 10, ${this.alpha})`;
      } else {
        this.color = `rgba(80, 80, 80, ${this.alpha})`;
      }
    } else if (this.effect === "shatter") {
      this.vy += this.gravity || 0;
      this.x += this.vx;
      this.y += this.vy;
      const bottomOffset = height - 10;
      if (this.y > bottomOffset) {
        this.y = bottomOffset;
        this.vy = -this.vy * (this.bounce || 0.4);
        this.vx *= 0.8;
      }
    } else if (this.effect === "space") {
      this.x += this.vx;
      this.y += this.vy;
      this.vx += Math.sin(this.life * 0.05) * 0.02;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    if (this.effect === "burn") {
      ctx.fillStyle = this.color || "rgba(255,100,0,1)";
    } else if (this.effect === "shatter") {
      ctx.fillStyle = `rgba(8, 145, 178, ${this.alpha})`;
    } else if (this.effect === "space") {
      ctx.fillStyle = this.color || "rgba(124,58,237,1)";
    }
    ctx.fill();
  }
}

export default function VentWall({ onVentComplete }: VentWallProps) {
  const [text, setText] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [ventOpacity, setVentOpacity] = useState(1);
  const [detectedDistortions, setDetectedDistortions] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    // Cognitive Distortion Real-time Check
    const textLower = text.toLowerCase();
    const matched = distortionKeywords.filter((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      return regex.test(textLower);
    });
    setDetectedDistortions(matched);
  }, [text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleAction = (effect: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      return;
    }
    triggerVentAnimation(trimmed, effect);
  };

  const triggerVentAnimation = (ventText: string, effect: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDisabled(true);
    setVentOpacity(0);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas based on container
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    const offCanvas = document.createElement("canvas");
    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;
    const octx = offCanvas.getContext("2d");
    if (!octx) return;

    octx.font = '600 16px "Inter", sans-serif';
    octx.fillStyle = "#ffffff";
    octx.textAlign = "left";
    octx.textBaseline = "top";

    const words = ventText.split(" ");
    let line = "";
    const x = 30;
    let y = 40;
    const maxWidth = canvas.width - 60;
    const lineHeight = 24;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = octx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        octx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    octx.fillText(line, x, y);

    const imgData = octx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    particles.current = [];

    const step = 3;
    for (let py = 0; py < canvas.height; py += step) {
      for (let px = 0; px < canvas.width; px += step) {
        const idx = (py * canvas.width + px) * 4;
        if (data[idx + 3] > 128) {
          particles.current.push(new Particle(px, py, effect));
        }
      }
    }

    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    loopVentAnimation(effect);
  };

  const loopVentAnimation = (effect: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeParticles = false;

    particles.current.forEach((p) => {
      if (p.life > 0) {
        p.update(canvas.width, canvas.height);
        p.draw(ctx);
        activeParticles = true;
      }
    });

    if (activeParticles) {
      animationFrameId.current = requestAnimationFrame(() => loopVentAnimation(effect));
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setText("");
      setVentOpacity(1);
      setDisabled(false);
      onVentComplete();
    }
  };

  return (
    <div id="vent-mode-content">
      <div className="section-header">
        <h2>Release the Weight</h2>
        <p>Write it all out. No filter, no judgment. Let it go.</p>
      </div>
      <div className="vent-area-container">
        <textarea
          ref={textareaRef}
          id="vent-input"
          placeholder="Type your feelings, anger, or unsent messages here... nobody else will ever read this."
          maxLength={1000}
          value={text}
          onChange={handleTextChange}
          disabled={disabled}
          style={{
            opacity: ventOpacity,
            transition: "opacity 0.5s ease",
            animation: isShaking ? "bounce 0.4s ease" : "none",
          }}
        ></textarea>
        <div className="char-counter">
          <span id="vent-char-count">{text.length}</span>/1000
        </div>
      </div>

      {detectedDistortions.length > 0 && (
        <div
          id="vent-distortion-badge"
          style={{
            background: "#fef2f2",
            border: "1px solid #fee2e2",
            borderRadius: "12px",
            padding: "10px 14px",
            fontSize: "0.78rem",
            color: "#b91c1c",
            marginTop: "10px",
            lineHeight: "1.45",
          }}
        >
          ⚠️ <strong>Thought distortion:</strong> Your vent contains absolute words like (
          <em>{detectedDistortions.join(", ")}</em>). CBT reminds us that pain triggers
          all-or-nothing thoughts. You feel this way now, but it will change.
        </div>
      )}

      <div className="vent-actions">
        <button
          className="btn-vent burn"
          disabled={disabled}
          onClick={() => handleAction("burn")}
        >
          <span className="btn-icon">🔥</span>
          <span className="btn-text">Burn It</span>
        </button>
        <button
          className="btn-vent shatter"
          disabled={disabled}
          onClick={() => handleAction("shatter")}
        >
          <span className="btn-icon">💎</span>
          <span className="btn-text">Shatter It</span>
        </button>
        <button
          className="btn-vent space"
          disabled={disabled}
          onClick={() => handleAction("space")}
        >
          <span className="btn-icon">✨</span>
          <span className="btn-text">To Space</span>
        </button>
      </div>

      <div className="canvas-container">
        <canvas ref={canvasRef} id="vent-canvas"></canvas>
      </div>
    </div>
  );
}
