"use client";

import { unlockVoice } from "@/lib/voice";

interface NavigationProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

const navItems = [
  { id: "home", icon: "HM", label: "HOME" },
  { id: "gym", icon: "GY", label: "GYM" },
  { id: "worlds", icon: "WD", label: "WORLDS" },
  { id: "skills", icon: "SK", label: "SKILLS" },
];

export function Navigation({ currentScreen, onNavigate }: NavigationProps) {
  return (
    <nav className="nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-btn ${currentScreen === item.id ? "active" : ""}`}
          onClick={() => {
            console.info(`[nav] tap ${item.id} -> unlockVoice()`);
            unlockVoice();
            onNavigate(item.id);
          }}
        >
          <span className="icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
