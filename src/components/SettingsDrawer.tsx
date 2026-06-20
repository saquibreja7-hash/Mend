"use client";

import React, { useState, useRef, useEffect } from "react";
import { triggerHaptic } from "@/utils/haptics";

interface SettingsDrawerProps {
  isOpen: boolean;
  username: string;
  onClose: () => void;
  onUpdateUsername: (newName: string) => void;
  onTriggerResetAll: () => void;
  onImportBackup: (backupData: Record<string, string>) => void;
}

export default function SettingsDrawer({
  isOpen,
  username,
  onClose,
  onUpdateUsername,
  onTriggerResetAll,
  onImportBackup,
}: SettingsDrawerProps) {
  const [localName, setLocalName] = useState(username);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalName(username);
  }, [username]);

  if (!isOpen) return null;

  const handleSaveName = () => {
    triggerHaptic(15);
    onUpdateUsername(localName.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExport = () => {
    triggerHaptic(20);
    try {
      const backup: Record<string, string> = {};
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("mend_")) {
          const val = localStorage.getItem(key);
          if (val !== null) backup[key] = val;
        }
      });

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mend-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export backup:", err);
    }
  };

  const handleImportClick = () => {
    triggerHaptic(10);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        // Simple validation: make sure at least some keys start with mend_
        const keys = Object.keys(data);
        const hasMendKeys = keys.some((k) => k.startsWith("mend_"));

        if (!hasMendKeys) {
          setImportError("Invalid backup file. No Mend data found.");
          return;
        }

        setImportError("");
        triggerHaptic(40);
        onImportBackup(data);
      } catch (err) {
        setImportError("Failed to parse JSON backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="panic-overlay-screen" style={{ zIndex: 10200 }}>
      <div
        className="panic-overlay-content"
        style={{
          maxWidth: "400px",
          width: "95%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
          borderRadius: "28px",
          background: "var(--bg-overlay-card)",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          textAlign: "left",
        }}
      >
        {/* Drawer Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: "1.3rem", fontWeight: 800 }}>Mend Settings</h2>
          <button
            className="btn-icon-only"
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            style={{ fontSize: "1.5rem", padding: "0 8px", cursor: "pointer", background: "transparent", border: "none" }}
          >
            &times;
          </button>
        </div>

        {/* 1. Name Profile Section */}
        <div className="identity-section-card" style={{ padding: "16px", marginBottom: "16px", background: "var(--bg-surface)" }}>
          <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 700 }}>
            Personalization
          </h4>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "10px" }}>
            Customize how your companion addresses you.
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Your name..."
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              style={{
                flexGrow: 1,
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                background: "rgba(0, 0, 0, 0.03)",
                fontSize: "0.85rem",
              }}
            />
            <button className="btn-primary" style={{ padding: "10px 16px", borderRadius: "10px", fontSize: "0.8rem" }} onClick={handleSaveName}>
              Save
            </button>
          </div>
          {saveSuccess && (
            <p style={{ fontSize: "0.75rem", color: "var(--emerald)", marginTop: "6px", fontWeight: 600 }}>
              ✓ Name updated successfully
            </p>
          )}
        </div>

        {/* 2. Backup & Restore */}
        <div className="identity-section-card" style={{ padding: "16px", marginBottom: "16px", background: "var(--bg-surface)" }}>
          <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 700 }}>
            Backup & Sync
          </h4>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "14px" }}>
            Export your data to a local file, or restore a previous backup.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-secondary" style={{ flex: 1, fontSize: "0.8rem", padding: "10px", background: "rgba(0,0,0,0.04)" }} onClick={handleExport}>
              💾 Export JSON
            </button>
            <button className="btn-secondary" style={{ flex: 1, fontSize: "0.8rem", padding: "10px", background: "rgba(0,0,0,0.04)" }} onClick={handleImportClick}>
              📤 Import Backup
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              style={{ display: "none" }}
            />
          </div>
          {importError && (
            <p style={{ fontSize: "0.75rem", color: "var(--red)", marginTop: "6px", fontWeight: 600 }}>
              ⚠️ {importError}
            </p>
          )}
        </div>

        {/* 3. Emergency Hotlines */}
        <div
          className="identity-section-card"
          style={{
            padding: "16px",
            marginBottom: "16px",
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.04), rgba(245, 158, 11, 0.03))",
            border: "1px solid rgba(239, 68, 68, 0.12)",
          }}
        >
          <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--red)", marginBottom: "8px", fontWeight: 700 }}>
            🆘 Immediate Crisis Support
          </h4>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.45", marginBottom: "12px" }}>
            If you are experiencing extreme distress or thoughts of self-harm, please reach out immediately. Help is free, confidential, and available 24/7.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <a
              href="tel:988"
              className="btn-secondary"
              style={{
                fontSize: "0.8rem",
                padding: "10px",
                textAlign: "center",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.15)",
                color: "var(--red)",
                fontWeight: 600,
                textDecoration: "none",
                display: "block",
                borderRadius: "10px",
              }}
              onClick={() => triggerHaptic(10)}
            >
              📞 Call or Text 988 (US/Canada)
            </a>
            <a
              href="https://www.crisistextline.org/"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{
                fontSize: "0.8rem",
                padding: "10px",
                textAlign: "center",
                background: "rgba(0,0,0,0.03)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                fontWeight: 600,
                textDecoration: "none",
                display: "block",
                borderRadius: "10px",
              }}
              onClick={() => triggerHaptic(10)}
            >
              💬 Text HOME to 741741 (Textline)
            </a>
          </div>
        </div>

        {/* 4. Danger Zone */}
        <div className="identity-section-card" style={{ padding: "16px", background: "rgba(239, 68, 68, 0.02)", border: "1px solid rgba(239, 68, 68, 0.08)" }}>
          <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--red)", marginBottom: "4px", fontWeight: 700 }}>
            Danger Zone
          </h4>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "12px" }}>
            This will permanently erase all journals, letters, and settings.
          </p>
          <button
            className="btn-secondary"
            style={{
              width: "100%",
              fontSize: "0.78rem",
              padding: "10px",
              background: "rgba(239, 68, 68, 0.05)",
              color: "var(--red)",
              border: "1px solid rgba(239, 68, 68, 0.12)",
              fontWeight: 600,
              borderRadius: "10px",
            }}
            onClick={onTriggerResetAll}
          >
            Delete All My Data
          </button>
        </div>
      </div>
    </div>
  );
}
