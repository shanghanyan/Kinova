"use client";

import type { GameState, SetData } from "@/lib/types";

const GAME_STATE_KEY = "kinova.gameState.v1";
const EVENT_LOG_KEY = "kinova.sessionEvents.v1";

type SessionEvent =
  | { type: "rep"; ts: number; xp: number; stat: string | null }
  | { type: "set_complete"; ts: number; reps: number; avgFormScore: number };

export function loadGameState(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
}

export function logRepEvent(payload: { xp: number; stat: string | null }): void {
  appendEvent({ type: "rep", ts: Date.now(), xp: payload.xp, stat: payload.stat });
}

export function logSetCompleteEvent(data: SetData): void {
  appendEvent({
    type: "set_complete",
    ts: Date.now(),
    reps: data.reps,
    avgFormScore: data.avgFormScore,
  });
}

function appendEvent(event: SessionEvent): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(EVENT_LOG_KEY);
    const events = raw ? (JSON.parse(raw) as SessionEvent[]) : [];
    const next = [...events.slice(-199), event];
    window.localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(next));
  } catch {
    // Ignore localStorage failures.
  }
}
