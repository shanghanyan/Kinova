"use client";

interface NavigationProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

const navItems = [
  { id: "home", icon: "🏠", label: "HOME" },
  { id: "gym", icon: "💪", label: "GYM" },
  { id: "worlds", icon: "🌍", label: "WORLDS" },
  { id: "skills", icon: "🌳", label: "SKILLS" },
];

export function Navigation({ currentScreen, onNavigate }: NavigationProps) {
  return (
    <nav className="nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-btn ${currentScreen === item.id ? "active" : ""}`}
          onClick={() => onNavigate(item.id)}
        >
          <span className="icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
