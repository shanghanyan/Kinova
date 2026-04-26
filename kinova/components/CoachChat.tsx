"use client";

import { FormEvent, useState } from "react";
import {
  clearConversationMemory,
  generateAndSpeakCoachReply,
  unlockVoice,
  type ChatMessage,
} from "@/lib/voice";

interface CoachChatProps {
  sessionId?: string;
}

export function CoachChat({ sessionId = "coach-main" }: CoachChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    console.info("[coach-chat] submit -> unlockVoice()");
    unlockVoice();
    setLoading(true);
    setError(null);
    try {
      const { messages: next } = await generateAndSpeakCoachReply(input, {
        sessionId,
        systemPrompt:
          "You are Kinova's coach. Give only the final answer in 1-2 concise sentences. Never include analysis, internal reasoning, or planning text.",
      });
      setMessages(next);
      setInput("");
    } catch {
      setError("Chat failed. Confirm K2THINK_API_KEY in .env.local and restart dev server.");
    } finally {
      setLoading(false);
    }
  };

  const onClear = () => {
    clearConversationMemory(sessionId);
    setMessages([]);
    setError(null);
  };

  return (
    <div className="card mt-6">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-display text-[11px] tracking-[0.1em] text-[var(--muted)]">COACH CHAT</div>
        <button className="btn btn-ghost px-3 py-1 text-[10px]" onClick={onClear} type="button">
          CLEAR MEMORY
        </button>
      </div>
      <div className="mb-3 max-h-40 space-y-2 overflow-auto rounded-lg bg-black/20 p-2 text-sm">
        {messages.length === 0 && <div className="text-[var(--muted)]">No history yet. Ask your coach anything.</div>}
        {messages
          .filter((m) => m.role !== "system")
          .map((m, i) => (
            <div key={`${m.role}-${i}`} className={m.role === "user" ? "text-cyan-200" : "text-emerald-200"}>
              <span className="mr-1 font-display text-[10px] uppercase opacity-80">{m.role}:</span>
              {m.content}
            </div>
          ))}
      </div>
      {error && <div className="mb-2 text-xs text-amber-300">ALERT: {error}</div>}
      <form className="flex gap-2" onSubmit={onSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="How can I improve today's form?"
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface2)] px-3 py-2 text-sm outline-none"
        />
        <button className="btn btn-pow px-4 py-2 text-[10px]" disabled={loading} type="submit">
          {loading ? "THINKING..." : "SEND"}
        </button>
      </form>
    </div>
  );
}
