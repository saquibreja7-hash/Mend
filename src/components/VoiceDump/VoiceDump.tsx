"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { VoiceEntry } from "@/types";
import { triggerHaptic } from "@/utils/haptics";
import { saveVoiceBlob, getVoiceBlob, deleteVoiceBlob } from "@/utils/voiceDB";

interface VoiceDumpProps {
  entries: VoiceEntry[];
  onSaveEntry: (entry: VoiceEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export default function VoiceDump({ entries, onSaveEntry, onDeleteEntry }: VoiceDumpProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [supported, setSupported] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setSupported(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      if (audioRef.current) audioRef.current.pause();
      // Stop mic and recorder if component unmounts mid-recording (tab switch, nav change)
      const rec = mediaRecorderRef.current;
      if (rec && rec.state !== "inactive") {
        rec.stop();
        rec.stream?.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const getMimeType = () => {
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg", "audio/mp4"];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return "";
  };

  const startRecording = async () => {
    if (isRecording) return;
    triggerHaptic(20);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
        setPermissionDenied(true);
      }
    }
  };

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return;
    triggerHaptic(25);

    const recorder = mediaRecorderRef.current;
    const duration = elapsed;

    recorder.onstop = async () => {
      const mimeType = recorder.mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const id = "voice_" + Date.now();
      const entry: VoiceEntry = {
        id,
        title: `Voice note — ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        duration,
        timestamp: Date.now(),
      };
      try {
        await saveVoiceBlob(id, blob);
        onSaveEntry(entry);
      } catch {
        // IndexedDB unavailable — entry still saved to metadata
        onSaveEntry(entry);
      }
      recorder.stream?.getTracks().forEach((t) => t.stop());
    };

    recorder.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setElapsed(0);
  }, [isRecording, elapsed, onSaveEntry]);

  const handlePlay = async (entry: VoiceEntry) => {
    if (playingId === entry.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    triggerHaptic(10);
    try {
      const blob = await getVoiceBlob(entry.id);
      if (!blob) {
        alert("Recording not found. It may have been cleared.");
        return;
      }
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      if (audioRef.current) audioRef.current.pause();

      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setPlayingId(null);
      audio.play();
      setPlayingId(entry.id);
    } catch {
      alert("Could not play this recording.");
    }
  };

  const handleDelete = async (id: string) => {
    triggerHaptic(15);
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
    try {
      await deleteVoiceBlob(id);
    } catch {
      // blob may not exist
    }
    onDeleteEntry(id);
  };

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const formatDuration = (s: number) => {
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  if (!supported) {
    return (
      <div style={{
        background: "rgba(0,0,0,0.02)",
        border: "1px solid var(--border)",
        borderRadius: "20px",
        padding: "24px",
        textAlign: "center",
        color: "var(--text-muted)",
      }}>
        <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🎙️</div>
        <p style={{ fontSize: "0.85rem" }}>Voice recording isn't supported in this browser.</p>
        <p style={{ fontSize: "0.78rem", marginTop: "6px" }}>Try Chrome or Firefox for the full experience.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(79,70,229,0.05), rgba(138,43,226,0.04))",
        border: "1px solid rgba(79,70,229,0.12)",
        borderRadius: "18px",
        padding: "16px",
      }}>
        <h3 style={{ fontFamily: "var(--font-head)", fontSize: "1rem", fontWeight: 600, marginBottom: "4px" }}>
          🎙️ Voice Dump
        </h3>
        <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
          Press record. Talk. Cry. Rant. Question.
          It stays here. It never sends.
        </p>
        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "6px" }}>
          Note: recordings are stored locally on this device and are not included in JSON backups.
        </p>
      </div>

      {/* Permission denied */}
      {permissionDenied && (
        <div style={{
          background: "rgba(239,68,68,0.05)",
          border: "1px solid rgba(239,68,68,0.15)",
          borderRadius: "14px",
          padding: "14px",
          fontSize: "0.82rem",
          color: "var(--red)",
        }}>
          Microphone access was denied. Please allow microphone access in your browser settings to use this feature.
        </div>
      )}

      {/* Recording button */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            border: "none",
            background: isRecording
              ? "linear-gradient(135deg, #ff416c, #ff4b2b)"
              : "linear-gradient(135deg, var(--pink), var(--purple))",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isRecording
              ? "0 0 30px rgba(255,65,108,0.4)"
              : "0 8px 24px rgba(255,117,140,0.25)",
            animation: isRecording ? "glow-pulse 1.5s ease-in-out infinite" : "none",
            transition: "all 0.3s var(--ease-bounce)",
          }}
        >
          {isRecording ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>

        {isRecording ? (
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "var(--font-head)",
              fontSize: "1.8rem",
              fontWeight: 800,
              color: "var(--red)",
            }}>
              {formatElapsed(elapsed)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Recording... tap to stop
            </div>
          </div>
        ) : (
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center" }}>
            {entries.length === 0 ? "Tap to start recording" : "Tap to record a new note"}
          </div>
        )}
      </div>

      {/* Entries list */}
      {entries.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h4 style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            {entries.length} {entries.length === 1 ? "recording" : "recordings"}
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
            {[...entries].reverse().map((entry) => (
              <li
                key={entry.id}
                style={{
                  background: "var(--bg-surface)",
                  border: `1px solid ${playingId === entry.id ? "rgba(79,70,229,0.25)" : "var(--border)"}`,
                  borderRadius: "14px",
                  padding: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  animation: "list-slide 0.3s ease",
                  transition: "var(--tr)",
                }}
              >
                {/* Play/stop button */}
                <button
                  onClick={() => handlePlay(entry)}
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    border: "none",
                    background: playingId === entry.id
                      ? "rgba(79,70,229,0.15)"
                      : "rgba(0,0,0,0.04)",
                    color: playingId === entry.id ? "var(--indigo)" : "var(--text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "var(--tr)",
                  }}
                >
                  {playingId === entry.id ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </button>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: "2px" }}>
                    {entry.title}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    {formatDate(entry.timestamp)} · {formatDuration(entry.duration)}
                  </div>
                </div>

                {/* Delete */}
                <button
                  className="btn-delete-item"
                  onClick={() => handleDelete(entry.id)}
                  style={{ fontSize: "1.1rem", flexShrink: 0 }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
