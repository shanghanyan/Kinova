"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { BossScreen } from "@/components/screens/BossScreen";
import { DanceScreen } from "@/components/screens/DanceScreen";
import { GymScreen } from "@/components/screens/GymScreen";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { SkillsScreen } from "@/components/screens/SkillsScreen";
import { WorldsScreen } from "@/components/screens/WorldsScreen";
import type { GameState, World } from "@/lib/types";
import type { SetData } from "@/components/PoseCamera";
import { logRepEvent, logSetCompleteEvent, saveGameState } from "@/lib/storage";

const INITIAL_STATE: GameState = {
  creature: { name: "DRAKELLE", state: "idle" },
  level: 1,
  xp: 0,
  xpMax: 500,
  streak: 0,
  reps: 0,
  stats: { pow: 0, agi: 0, sta: 0 },
  missions: [
    { icon: "A", label: "Complete 20 Reps", desc: "Any strength exercise", xp: 50, done: false },
    { icon: "B", label: "Dance Session", desc: "Any world, 3 min", xp: 40, done: false },
    { icon: "C", label: "Maintain Streak", desc: "Train today", xp: 30, done: false },
  ],
  activeSkills: [],
  totalSessions: 0,
};

export default function App() {
  const [screen, setScreen] = useState("home");
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);

  const handleRep = ({ stat, xp }: { stat: string | null; xp: number }) => {
    logRepEvent({ stat, xp });
    setGameState((prev) => {
      const next = { ...prev, reps: prev.reps + 1, xp: Math.min(prev.xpMax, prev.xp + xp) };
      if (stat === "pow" || stat === "agi" || stat === "sta") {
        next.stats = { ...next.stats, [stat]: Math.min(100, next.stats[stat] + 2) };
      }
      next.creature = { ...prev.creature, state: stat ? "energized" : "idle" };
      setTimeout(() => {
        setGameState((s) => ({ ...s, creature: { ...s.creature, state: "idle" } }));
      }, 800);
      return next;
    });
  };

  const handleEvolve = () => {
    setGameState((prev) => ({
      ...prev,
      level: prev.level + 1,
      xp: 0,
      stats: { pow: 20, agi: 20, sta: 20 },
      creature: { ...prev.creature, state: "evolving" },
    }));
  };

  const handleSetComplete = (data: SetData) => {
    logSetCompleteEvent(data);
    setGameState((prev) => ({
      ...prev,
      totalSessions: (prev.totalSessions ?? 0) + 1,
      lastSessionAt: Date.now(),
      streak: prev.lastSessionAt ? Math.max(prev.streak, 1) : Math.max(prev.streak, 1),
    }));
  };

  const handleToggleSkill = (skillId: string) => {
    setGameState((prev) => {
      const active = prev.activeSkills.includes(skillId);
      return {
        ...prev,
        activeSkills: active
          ? prev.activeSkills.filter((id) => id !== skillId)
          : [...prev.activeSkills, skillId].slice(-3),
      };
    });
  };

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  return (
    <div className="app relative h-screen w-screen overflow-hidden">
      <div className={`screen ${screen === "home" ? "active" : ""}`}>
        <HomeScreen state={gameState} onNav={setScreen} />
      </div>
      <div className={`screen ${screen === "gym" ? "active" : ""}`}>
        <GymScreen
          state={gameState}
          onRep={handleRep}
          onNav={setScreen}
          onSetComplete={handleSetComplete}
          isActive={screen === "gym"}
        />
      </div>
      <div className={`screen ${screen === "worlds" ? "active" : ""}`}>
        <WorldsScreen
          state={gameState}
          onNav={setScreen}
          onSelectWorld={(w) => {
            setSelectedWorld(w);
            setScreen("dance");
          }}
        />
      </div>
      {selectedWorld && (
        <div className={`screen ${screen === "dance" ? "active" : ""}`}>
          <DanceScreen
            world={selectedWorld}
            state={gameState}
            onRep={handleRep}
            onNav={setScreen}
            isActive={screen === "dance"}
          />
        </div>
      )}
      <div className={`screen ${screen === "boss" ? "active" : ""}`}>
        <BossScreen state={gameState} onRep={handleRep} onEvolve={handleEvolve} onNav={setScreen} />
      </div>
      <div className={`screen ${screen === "skills" ? "active" : ""}`}>
        <SkillsScreen state={gameState} onNav={setScreen} onToggleSkill={handleToggleSkill} />
      </div>
      <Navigation currentScreen={screen} onNavigate={setScreen} />
    </div>
  );
}
