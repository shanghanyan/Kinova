"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getVoiceDiagnosticsSnapshot,
  subscribeVoiceDiagnostics,
  type VoiceDiagnosticsSnapshot,
  type VoiceDiagnosticEvent,
} from "@/lib/voice";

const INITIAL_SNAPSHOT: VoiceDiagnosticsSnapshot = {
  supported: false,
  unlocked: false,
  queueLength: 0,
  active: false,
  voicesCount: 0,
  selectedVoiceName: null,
  paused: false,
  pending: false,
  speaking: false,
  events: [],
};

function formatTime(ms: number): string {
  const date = new Date(ms);
  return date.toLocaleTimeString(undefined, { hour12: false });
}

export function VoiceDiagnostics() {
  const [snapshot, setSnapshot] = useState<VoiceDiagnosticsSnapshot>(INITIAL_SNAPSHOT);

  useEffect(() => {
    setSnapshot(getVoiceDiagnosticsSnapshot());
    return subscribeVoiceDiagnostics(() => {
      setSnapshot(getVoiceDiagnosticsSnapshot());
    });
  }, []);

  const voiceEvents = useMemo(() => {
    return snapshot.events
      .filter((event) => event.type === "utterance_start" || event.type === "utterance_end" || event.type === "utterance_error")
      .slice(-8);
  }, [snapshot.events]);

  return (
    <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface2)] p-3">
      <div className="mb-2 font-display text-[10px] tracking-[0.08em] text-[var(--muted)]">VOICE DIAGNOSTICS</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>supported: {snapshot.supported ? "yes" : "no"}</div>
        <div>unlocked: {snapshot.unlocked ? "yes" : "no"}</div>
        <div>voices: {snapshot.voicesCount}</div>
        <div>selected: {snapshot.selectedVoiceName ?? "default"}</div>
        <div>paused: {snapshot.paused ? "yes" : "no"}</div>
        <div>pending: {snapshot.pending ? "yes" : "no"}</div>
        <div>speaking: {snapshot.speaking ? "yes" : "no"}</div>
        <div>queue: {snapshot.queueLength}</div>
      </div>
      <div className="mt-3 font-display text-[10px] tracking-[0.08em] text-[var(--muted)]">EVENT TIMESTAMPS</div>
      <div className="mt-1 max-h-28 space-y-1 overflow-auto rounded bg-black/20 p-2 text-xs">
        {voiceEvents.length === 0 && <div className="text-[var(--muted)]">No speech events yet.</div>}
        {voiceEvents.map((event: VoiceDiagnosticEvent) => (
          <div key={`${event.at}-${event.type}`}>
            [{formatTime(event.at)}] {event.type}: {event.detail}
          </div>
        ))}
      </div>
    </div>
  );
}
