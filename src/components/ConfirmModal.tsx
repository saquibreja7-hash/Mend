"use client";

import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="panic-overlay-screen" style={{ zIndex: 10100 }}>
      <div className="panic-overlay-content" style={{ maxWidth: "340px", padding: "24px" }}>
        <div style={{ fontSize: "2rem", marginBottom: "12px" }}>⚠️</div>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "8px", fontFamily: "var(--font-head)" }}>{title}</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.45", marginBottom: "20px" }}>
          {message}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
          <button
            className="btn-primary"
            style={{ background: "var(--red)", color: "white", width: "100%", boxShadow: "none" }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            className="btn-secondary"
            style={{ width: "100%", background: "rgba(0, 0, 0, 0.04)" }}
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
