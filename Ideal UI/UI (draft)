import { useState, useEffect, useRef } from "react";

// ============================================================
// DESIGN TOKENS
// ============================================================
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:ital,wght@0,300;0,500;1,400&display=swap');

  :root {
    --bg: #07090f;
    --surface: #0d1117;
    --surface2: #141b26;
    --border: rgba(255,255,255,0.07);
    --str: #ff5f2e;
    --bal: #00e5ff;
    --car: #b44fff;
    --xp: #ffe033;
    --white: #f0f4ff;
    --muted: #6b7a99;
    --success: #29ffa0;
    --font-display: 'Orbitron', monospace;
    --font-body: 'Exo 2', sans-serif;
    --glow-str: 0 0 18px rgba(255,95,46,0.5);
    --glow-bal: 0 0 18px rgba(0,229,255,0.5);
    --glow-car: 0 0 18px rgba(180,79,255,0.5);
    --glow-xp: 0 0 18px rgba(255,224,51,0.5);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--white);
    font-family: var(--font-body);
    overflow: hidden;
  }

  .app {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  /* ---- NOISE OVERLAY ---- */
  .app::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9999;
    opacity: 0.35;
  }

  /* ---- SCREEN TRANSITIONS ---- */
  .screen {
    position: absolute;
    inset: 0;
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.4s ease, transform 0.4s ease;
    pointer-events: none;
    overflow-y: auto;
  }
  .screen.active {
    opacity: 1;
    transform: translateY(0);
    pointer-events: all;
  }

  /* ---- NAV BAR ---- */
  .nav {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: 72px;
    background: rgba(13,17,23,0.92);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-around;
    z-index: 100;
    padding: 0 8px;
  }
  .nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: var(--muted);
    font-family: var(--font-display);
    font-size: 9px;
    letter-spacing: 0.08em;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 12px;
    transition: all 0.2s;
  }
  .nav-btn.active {
    color: var(--white);
    background: var(--surface2);
  }
  .nav-btn .icon { font-size: 22px; line-height: 1; }

  /* ---- BUTTONS ---- */
  .btn {
    font-family: var(--font-display);
    font-size: 11px;
    letter-spacing: 0.1em;
    font-weight: 700;
    border: none;
    cursor: pointer;
    border-radius: 12px;
    padding: 14px 28px;
    transition: all 0.2s;
    text-transform: uppercase;
  }
  .btn-str { background: var(--str); color: #fff; box-shadow: var(--glow-str); }
  .btn-bal { background: var(--bal); color: #07090f; box-shadow: var(--glow-bal); }
  .btn-car { background: var(--car); color: #fff; box-shadow: var(--glow-car); }
  .btn-xp  { background: var(--xp); color: #07090f; box-shadow: var(--glow-xp); }
  .btn-ghost { background: var(--surface2); color: var(--white); border: 1px solid var(--border); }
  .btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .btn:active { transform: translateY(0); }

  /* ---- STAT RING ---- */
  .stat-ring { position: relative; display: inline-flex; align-items: center; justify-content: center; }
  .stat-ring svg { transform: rotate(-90deg); }
  .stat-ring .ring-label {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: var(--font-display);
    font-size: 9px;
    letter-spacing: 0.06em;
    line-height: 1.2;
  }
  .stat-ring .ring-val { font-size: 16px; font-weight: 900; }

  /* ---- CARD ---- */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 20px;
  }

  /* ---- FEEDBACK CHIP ---- */
  .feedback-chip {
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 8px 20px;
    border-radius: 100px;
    animation: pop 0.3s ease;
  }
  @keyframes pop {
    0% { transform: scale(0.7); opacity: 0; }
    70% { transform: scale(1.08); }
    100% { transform: scale(1); opacity: 1; }
  }

  /* ---- CREATURE ---- */
  .creature-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .creature-svg {
    filter: drop-shadow(0 0 24px rgba(180,79,255,0.4));
    animation: float 3s ease-in-out infinite;
  }
  @keyframes float {
    0%,100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  .creature-svg.energized { animation: energized 0.5s ease, float 3s ease-in-out 0.5s infinite; }
  @keyframes energized {
    0% { filter: drop-shadow(0 0 40px var(--xp)); transform: scale(1.15); }
    100% { filter: drop-shadow(0 0 24px rgba(180,79,255,0.4)); transform: scale(1); }
  }
  .creature-svg.evolving {
    animation: evolving 2s ease forwards;
  }
  @keyframes evolving {
    0%   { filter: drop-shadow(0 0 20px var(--car)); transform: scale(1); }
    25%  { filter: drop-shadow(0 0 80px var(--xp)); transform: scale(1.3) rotate(-5deg); }
    50%  { filter: drop-shadow(0 0 120px #fff); transform: scale(1.5) rotate(5deg); }
    75%  { filter: drop-shadow(0 0 60px var(--str)); transform: scale(1.2); }
    100% { filter: drop-shadow(0 0 30px var(--car)); transform: scale(1); }
  }

  /* ---- XP BAR ---- */
  .xp-bar-wrap { background: var(--surface2); border-radius: 100px; height: 8px; overflow: hidden; }
  .xp-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--xp), var(--car));
    border-radius: 100px;
    transition: width 0.6s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow: var(--glow-xp);
  }

  /* ---- CHARGE METER ---- */
  .charge-meter {
    background: var(--surface2);
    border-radius: 20px;
    height: 24px;
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .charge-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--car), var(--xp));
    border-radius: 20px;
    transition: width 0.4s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow: 0 0 20px rgba(180,79,255,0.7);
    position: relative;
  }
  .charge-fill::after {
    content: '';
    position: absolute;
    top: 0; right: 0; bottom: 0;
    width: 40px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4));
  }

  /* ---- WORLD CARDS ---- */
  .world-card {
    border-radius: 20px;
    padding: 24px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    border: 1px solid var(--border);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .world-card:hover { transform: translateY(-4px); }
  .world-card.locked { filter: grayscale(0.6); cursor: not-allowed; opacity: 0.6; }
  .world-card .world-bg {
    position: absolute;
    inset: 0;
    opacity: 0.15;
    background-size: cover;
  }
  .world-card .world-content { position: relative; z-index: 1; }

  /* ---- CAMERA PLACEHOLDER ---- */
  .cam-feed {
    background: var(--surface2);
    border: 1px dashed var(--border);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 10px;
    color: var(--muted);
    font-family: var(--font-display);
    font-size: 11px;
    letter-spacing: 0.08em;
    position: relative;
    overflow: hidden;
  }
  .cam-feed .skeleton-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.25;
  }

  /* ---- REP COUNTER ---- */
  .rep-counter {
    font-family: var(--font-display);
    font-size: 64px;
    font-weight: 900;
    line-height: 1;
    background: linear-gradient(135deg, var(--str), var(--xp));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: repPop 0.2s ease;
  }
  @keyframes repPop {
    0% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }

  /* ---- MISSIONS ---- */
  .mission-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    background: var(--surface2);
    border-radius: 14px;
    border: 1px solid var(--border);
  }
  .mission-check {
    width: 28px; height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }

  /* ---- STREAK ---- */
  .streak-badge {
    background: linear-gradient(135deg, var(--str), var(--xp));
    border-radius: 14px;
    padding: 10px 18px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 13px;
    box-shadow: var(--glow-str);
  }

  /* ---- SCROLLBAR ---- */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  /* ---- PARTICLES ---- */
  .particle {
    position: absolute;
    width: 6px; height: 6px;
    border-radius: 50%;
    animation: particleFloat 2s ease-out forwards;
    pointer-events: none;
  }
  @keyframes particleFloat {
    0% { transform: translate(0,0) scale(1); opacity: 1; }
    100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
  }

  /* ---- EVOLUTION FLASH ---- */
  .evo-flash {
    position: fixed;
    inset: 0;
    background: #fff;
    animation: flash 0.6s ease forwards;
    z-index: 500;
    pointer-events: none;
  }
  @keyframes flash {
    0% { opacity: 0.9; }
    100% { opacity: 0; }
  }

  /* ---- BEAT INDICATOR ---- */
  .beat-dot {
    width: 12px; height: 12px;
    border-radius: 50%;
    background: var(--bal);
    animation: beat 0.5s ease infinite alternate;
    box-shadow: var(--glow-bal);
  }
  @keyframes beat {
    0% { transform: scale(0.8); opacity: 0.5; }
    100% { transform: scale(1.2); opacity: 1; }
  }

  /* ---- SKILL TREE ---- */
  .skill-node {
    width: 56px; height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    border: 2px solid var(--border);
    background: var(--surface2);
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }
  .skill-node.unlocked { border-color: var(--bal); box-shadow: var(--glow-bal); }
  .skill-node.active   { border-color: var(--xp); box-shadow: var(--glow-xp); background: var(--surface); }
  .skill-connector {
    flex: 1; height: 2px;
    background: var(--border);
  }
  .skill-connector.unlocked { background: linear-gradient(90deg, var(--bal), var(--car)); }

  /* ---- COMBO ---- */
  .combo-text {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 28px;
    background: linear-gradient(135deg, var(--xp), var(--str));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: comboIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes comboIn {
    0% { transform: scale(0) rotate(-10deg); }
    100% { transform: scale(1) rotate(0); }
  }
`;

// ============================================================
// SVG CREATURE
// ============================================================
function Creature({ size = 120, state = "idle", level = 1 }) {
  const colors = {
    1: { body: "#7b5ea7", eye: "#b44fff", accent: "#ffe033" },
    2: { body: "#2a6496", eye: "#00e5ff", accent: "#29ffa0" },
    3: { body: "#b83232", eye: "#ff5f2e", accent: "#ffe033" },
  };
  const c = colors[Math.min(level, 3)];
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 120 120"
      className={`creature-svg ${state}`}
    >
      {/* body */}
      <ellipse cx="60" cy="72" rx="36" ry="32" fill={c.body} />
      {/* head */}
      <circle cx="60" cy="42" r="28" fill={c.body} />
      {/* ears/horns */}
      <polygon points="36,22 28,4 44,16" fill={c.accent} />
      <polygon points="84,22 92,4 76,16" fill={c.accent} />
      {/* eyes */}
      <circle cx="50" cy="40" r="8" fill="#fff" />
      <circle cx="70" cy="40" r="8" fill="#fff" />
      <circle cx="52" cy="41" r="5" fill={c.eye} />
      <circle cx="72" cy="41" r="5" fill={c.eye} />
      <circle cx="53" cy="40" r="2" fill="#07090f" />
      <circle cx="73" cy="40" r="2" fill="#07090f" />
      {/* shine */}
      <circle cx="55" cy="38" r="1.5" fill="rgba(255,255,255,0.8)" />
      <circle cx="75" cy="38" r="1.5" fill="rgba(255,255,255,0.8)" />
      {/* mouth */}
      {state === "energized" || state === "evolving"
        ? <path d="M50,54 Q60,62 70,54" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        : <path d="M52,56 Q60,60 68,56" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      }
      {/* tail */}
      <path d="M90,80 Q110,90 100,110 Q90,115 85,100" fill={c.body} />
      {/* legs */}
      <ellipse cx="42" cy="100" rx="12" ry="8" fill={c.body} />
      <ellipse cx="78" cy="100" rx="12" ry="8" fill={c.body} />
      {/* level indicator */}
      {level >= 2 && <circle cx="96" cy="24" r="9" fill={c.accent} />}
      {level >= 2 && <text x="96" y="28" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#07090f">{level}</text>}
      {/* energy particles for evolving */}
      {state === "evolving" && <>
        <circle cx="20" cy="20" r="3" fill={c.accent} opacity="0.8">
          <animateTransform attributeName="transform" type="translate" values="0,0;-10,-15;-5,-25" dur="1s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.8;0.3;0" dur="1s" repeatCount="indefinite"/>
        </circle>
        <circle cx="100" cy="30" r="3" fill={c.eye} opacity="0.8">
          <animateTransform attributeName="transform" type="translate" values="0,0;10,-12;8,-22" dur="1.3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.8;0.3;0" dur="1.3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="60" cy="10" r="4" fill="#fff" opacity="0.6">
          <animateTransform attributeName="transform" type="translate" values="0,0;0,-15;0,-28" dur="0.9s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.6;0.2;0" dur="0.9s" repeatCount="indefinite"/>
        </circle>
      </>}
    </svg>
  );
}

// ============================================================
// STAT RING
// ============================================================
function StatRing({ value, max = 100, color, label, icon, size = 90 }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - value / max);
  return (
    <div className="stat-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth="8" strokeDasharray={circ} strokeDashoffset={fill}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)",
            filter: `drop-shadow(0 0 6px ${color})`
          }}
        />
      </svg>
      <div className="ring-label">
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span className="ring-val" style={{ color }}>{value}</span>
        <span style={{ color: "var(--muted)", fontSize: 8 }}>{label}</span>
      </div>
    </div>
  );
}

// ============================================================
// FEEDBACK CHIP
// ============================================================
function FeedbackChip({ text, type }) {
  const styles = {
    perfect: { background: "linear-gradient(135deg,var(--xp),var(--str))", color: "#07090f" },
    good:    { background: "var(--success)", color: "#07090f" },
    fix:     { background: "rgba(255,95,46,0.15)", color: "var(--str)", border: "1px solid var(--str)" },
    miss:    { background: "rgba(255,95,46,0.1)", color: "var(--str)", border: "1px solid var(--str)" },
  };
  return (
    <span className="feedback-chip" style={styles[type] || styles.good}>{text}</span>
  );
}

// ============================================================
// SKELETON HUMAN SVG (Pose Overlay Placeholder)
// ============================================================
function SkeletonFigure() {
  return (
    <svg width="80" height="180" viewBox="0 0 80 180" fill="none">
      {/* head */}
      <circle cx="40" cy="16" r="12" stroke="var(--bal)" strokeWidth="2" opacity="0.8"/>
      {/* spine */}
      <line x1="40" y1="28" x2="40" y2="90" stroke="var(--bal)" strokeWidth="2" opacity="0.6"/>
      {/* shoulders */}
      <line x1="10" y1="42" x2="70" y2="42" stroke="var(--bal)" strokeWidth="2" opacity="0.6"/>
      {/* left arm */}
      <line x1="10" y1="42" x2="4" y2="75" stroke="var(--bal)" strokeWidth="2" opacity="0.6"/>
      <line x1="4" y1="75" x2="0" y2="105" stroke="var(--bal)" strokeWidth="2" opacity="0.6"/>
      {/* right arm */}
      <line x1="70" y1="42" x2="76" y2="75" stroke="var(--bal)" strokeWidth="2" opacity="0.6"/>
      <line x1="76" y1="75" x2="80" y2="105" stroke="var(--bal)" strokeWidth="2" opacity="0.6"/>
      {/* hips */}
      <line x1="24" y1="90" x2="56" y2="90" stroke="var(--bal)" strokeWidth="2" opacity="0.6"/>
      {/* left leg */}
      <line x1="28" y1="90" x2="22" y2="135" stroke="var(--bal)" strokeWidth="2" opacity="0.6"/>
      <line x1="22" y1="135" x2="18" y2="175" stroke="var(--bal)" strokeWidth="2" opacity="0.6"/>
      {/* right leg */}
      <line x1="52" y1="90" x2="58" y2="135" stroke="var(--bal)" strokeWidth="2" opacity="0.6"/>
      <line x1="58" y1="135" x2="62" y2="175" stroke="var(--bal)" strokeWidth="2" opacity="0.6"/>
      {/* joints */}
      {[[10,42],[70,42],[4,75],[76,75],[40,90],[24,90],[56,90],[22,135],[58,135]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="var(--bal)" opacity="0.9"/>
      ))}
    </svg>
  );
}

// ============================================================
// HOME SCREEN
// ============================================================
function HomeScreen({ state, onNav }) {
  const { creature, stats, xp, xpMax, level, streak, missions } = state;
  const statsReady = stats.str >= 90 && stats.bal >= 90 && stats.car >= 90;
  return (
    <div style={{ padding: "24px 20px 100px", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em" }}>LEVEL {level}</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900, letterSpacing: "0.04em" }}>{creature.name}</div>
        </div>
        <div className="streak-badge">
          🔥 <span>{streak} DAY STREAK</span>
        </div>
      </div>

      {/* XP Bar */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.08em" }}>XP TO NEXT LEVEL</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 9, color: "var(--xp)" }}>{xp} / {xpMax}</span>
        </div>
        <div className="xp-bar-wrap">
          <div className="xp-bar-fill" style={{ width: `${(xp/xpMax)*100}%` }}/>
        </div>
      </div>

      {/* Creature + Stat Rings */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        <StatRing value={stats.str} color="var(--str)" label="STR" icon="💪" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Creature size={130} state={creature.state} level={level} />
          {statsReady && (
            <button className="btn btn-xp" style={{ fontSize: 10, padding: "10px 20px" }} onClick={() => onNav("boss")}>
              ⚡ READY TO EVOLVE
            </button>
          )}
        </div>
        <StatRing value={stats.bal} color="var(--bal)" label="BAL" icon="⚖️" />
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
        <StatRing value={stats.car} color="var(--car)" label="CARDIO" icon="💃" />
      </div>

      {/* Action Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 }}>
        <button className="btn btn-str" style={{ padding: "14px 8px", fontSize: 10 }} onClick={() => onNav("gym")}>
          💪 TRAIN
        </button>
        <button className="btn btn-car" style={{ padding: "14px 8px", fontSize: 10 }} onClick={() => onNav("worlds")}>
          🌍 PERFORM
        </button>
        <button className="btn btn-ghost" style={{ padding: "14px 8px", fontSize: 10 }} onClick={() => onNav("skills")}>
          🌳 SKILLS
        </button>
      </div>

      {/* Daily Missions */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", marginBottom: 14 }}>DAILY MISSIONS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {missions.map((m, i) => (
            <div className="mission-row" key={i}>
              <div className="mission-check" style={{ background: m.done ? "var(--success)" : "var(--surface)", border: m.done ? "none" : "1px solid var(--border)" }}>
                {m.done ? "✓" : m.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{m.desc}</div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--xp)" }}>+{m.xp} XP</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// GYM SCREEN
// ============================================================
function GymScreen({ state, onRep, onNav }) {
  const [feedback, setFeedback] = useState(null);
  const [combo, setCombo] = useState(0);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const exercises = ["SQUAT", "PUSH-UP", "LUNGE", "PLANK HOLD", "DEADLIFT"];
  const exercise = exercises[exerciseIdx % exercises.length];

  const handleRep = (quality) => {
    const types = {
      perfect: { text: "PERFECT!", type: "perfect", stat: "str", xp: 20 },
      good:    { text: "GOOD",     type: "good",    stat: "bal", xp: 10 },
      fix:     { text: "FIX FORM", type: "fix",     stat: null,  xp: 2  },
    };
    const f = types[quality];
    setFeedback(f);
    if (quality !== "fix") setCombo(c => c + 1);
    else setCombo(0);
    onRep(f);
    setTimeout(() => setFeedback(null), 1200);
  };

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 10 }} onClick={() => onNav("home")}>← BACK</button>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 900, letterSpacing: "0.05em" }}>GYM SESSION</div>
      </div>

      {/* Exercise title */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.12em", marginBottom: 4 }}>CURRENT EXERCISE</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900, color: "var(--str)", letterSpacing: "0.04em" }}>{exercise}</div>
      </div>

      {/* Camera feed */}
      <div className="cam-feed" style={{ height: 260, marginBottom: 16 }}>
        <div className="skeleton-overlay"><SkeletonFigure /></div>
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 32 }}>📷</span>
          <span style={{ fontSize: 10, color: "var(--muted)" }}>CAMERA FEED — AI POSE DETECTION ACTIVE</span>
        </div>
        {/* Feedback overlay */}
        {feedback && (
          <div style={{ position: "absolute", top: 20, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <FeedbackChip text={feedback.text} type={feedback.type} />
          </div>
        )}
        {/* Creature corner */}
        <div style={{ position: "absolute", bottom: 14, right: 14 }}>
          <Creature size={56} state={feedback?.type === "perfect" ? "energized" : "idle"} level={state.level} />
        </div>
        {/* Combo */}
        {combo >= 3 && (
          <div style={{ position: "absolute", top: 14, left: 14 }}>
            <div className="combo-text">x{combo} COMBO!</div>
          </div>
        )}
      </div>

      {/* Rep Counter */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 8, marginBottom: 20 }}>
        <div className="rep-counter">{state.reps}</div>
        <div style={{ fontFamily: "var(--font-display)", color: "var(--muted)", fontSize: 12 }}>REPS</div>
      </div>

      {/* Sim buttons — in real app these fire from AI analysis */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        <button className="btn btn-xp" onClick={() => handleRep("perfect")} style={{ padding: "12px 6px", fontSize: 10 }}>⚡ PERFECT</button>
        <button className="btn btn-str" onClick={() => handleRep("good")} style={{ padding: "12px 6px", fontSize: 10 }}>✓ GOOD</button>
        <button className="btn btn-ghost" onClick={() => handleRep("fix")} style={{ padding: "12px 6px", fontSize: 10 }}>⚠ FIX</button>
      </div>

      {/* Stat bars */}
      <div className="card" style={{ display: "flex", gap: 16, justifyContent: "space-around" }}>
        {[
          { label: "STR", val: state.stats.str, color: "var(--str)" },
          { label: "BAL", val: state.stats.bal, color: "var(--bal)" },
          { label: "CARD", val: state.stats.car, color: "var(--car)" },
        ].map(s => (
          <div key={s.label} style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-display)", fontSize: 9, letterSpacing: "0.08em", marginBottom: 6 }}>
              <span style={{ color: "var(--muted)" }}>{s.label}</span>
              <span style={{ color: s.color }}>{s.val}</span>
            </div>
            <div className="xp-bar-wrap">
              <div style={{ height: "100%", background: s.color, borderRadius: 100, width: `${s.val}%`, transition: "width 0.5s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: `0 0 8px ${s.color}` }}/>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-ghost" style={{ width: "100%", marginTop: 14, fontSize: 10 }}
        onClick={() => setExerciseIdx(i => i + 1)}>
        NEXT EXERCISE →
      </button>
    </div>
  );
}

// ============================================================
// WORLDS SCREEN
// ============================================================
const WORLDS = [
  {
    id: "hiphop",
    name: "CYBER STAGE",
    style: "HIP HOP",
    icon: "🤖",
    desc: "Futuristic neon-drenched arena. Lock, pop, and break through digital dimensions.",
    bg: "linear-gradient(135deg,#0d1b3e,#1a0d4d)",
    accent: "var(--bal)",
    minLevel: 1,
  },
  {
    id: "latin",
    name: "TROPICAL FEST",
    style: "LATIN",
    icon: "🌴",
    desc: "Vibrant carnival grounds. Salsa and merengue under golden light.",
    bg: "linear-gradient(135deg,#2d1a00,#3d2800)",
    accent: "var(--str)",
    minLevel: 1,
  },
  {
    id: "saber",
    name: "SABER DOJO",
    style: "SABER",
    icon: "⚔️",
    desc: "Precision movement art. Flow with blade and beat.",
    bg: "linear-gradient(135deg,#0a2a1a,#0f1f0f)",
    accent: "var(--success)",
    minLevel: 2,
  },
  {
    id: "soul",
    name: "SOUL TEMPLE",
    style: "FREESTYLE",
    icon: "🔮",
    desc: "Ancient rhythms, modern moves. Unlock pure expression.",
    bg: "linear-gradient(135deg,#2d0a2d,#1a0d1a)",
    accent: "var(--car)",
    minLevel: 3,
  },
];

function WorldsScreen({ state, onNav, onSelectWorld }) {
  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 10 }} onClick={() => onNav("home")}>← BACK</button>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 900, letterSpacing: "0.05em" }}>WORLDS</div>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", marginBottom: 16 }}>
        SELECT A DANCE WORLD — LEVEL {state.level}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {WORLDS.map(w => {
          const locked = state.level < w.minLevel;
          return (
            <div key={w.id} className={`world-card ${locked ? "locked" : ""}`}
              style={{ background: w.bg, boxShadow: locked ? "none" : `0 0 24px ${w.accent}22` }}
              onClick={() => !locked && onSelectWorld(w)}
            >
              <div className="world-content">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 9, color: w.accent, letterSpacing: "0.12em", marginBottom: 4 }}>{w.style}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 900 }}>{w.icon} {w.name}</div>
                  </div>
                  {locked && (
                    <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", fontFamily: "var(--font-display)", fontSize: 10, color: "var(--muted)" }}>
                      LVL {w.minLevel}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 10, lineHeight: 1.5 }}>{w.desc}</div>
                {!locked && (
                  <div style={{ marginTop: 14 }}>
                    <button className="btn" style={{ background: w.accent, color: "#07090f", fontSize: 10, padding: "10px 20px" }}>
                      ENTER WORLD →
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// DANCE SCREEN
// ============================================================
function DanceScreen({ world, state, onRep, onNav }) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setBeat(b => b + 1), 500);
    return () => clearInterval(id);
  }, []);

  const handleMove = (quality) => {
    const pts = { perfect: 100, good: 60, miss: 10 };
    const f = { perfect: { text: "PERFECT!", type: "perfect" }, good: { text: "NICE MOVE", type: "good" }, miss: { text: "MISS", type: "miss" } };
    setFeedback(f[quality]);
    if (quality !== "miss") setCombo(c => c + 1);
    else setCombo(0);
    setScore(s => s + pts[quality] * (combo >= 5 ? 2 : 1));
    onRep({ stat: "car", xp: pts[quality] / 10 });
    setTimeout(() => setFeedback(null), 900);
  };

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 10 }} onClick={() => onNav("worlds")}>← WORLDS</button>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 9, color: world.accent, letterSpacing: "0.1em" }}>{world.style}</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 900 }}>{world.name}</div>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900, color: "var(--xp)" }}>{score.toLocaleString()}</div>
      </div>

      {/* Beat indicator */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 14 }}>
        {[0,1,2,3].map(i => (
          <div key={i} className="beat-dot" style={{ animationDelay: `${i * 0.125}s`, background: i === (beat % 4) ? world.accent : "var(--surface2)" }}/>
        ))}
      </div>

      {/* Camera feed */}
      <div className="cam-feed" style={{ height: 240, marginBottom: 14, border: `1px dashed ${world.accent}44`, boxShadow: `0 0 30px ${world.accent}11` }}>
        <div className="skeleton-overlay" style={{ opacity: 0.3 }}><SkeletonFigure /></div>
        {/* Ghost avatar indicator */}
        <div style={{ position: "absolute", bottom: 14, left: 14, right: 14, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 9, color: world.accent, letterSpacing: "0.1em" }}>▶ GUIDE AVATAR ACTIVE</div>
        </div>
        {feedback && (
          <div style={{ position: "absolute", top: 16, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <FeedbackChip text={feedback.text} type={feedback.type} />
          </div>
        )}
        {combo >= 3 && (
          <div style={{ position: "absolute", top: 14, right: 14 }}>
            <div className="combo-text" style={{ fontSize: 20 }}>x{combo}!</div>
          </div>
        )}
        <div style={{ position: "absolute", bottom: 14, right: 14 }}>
          <Creature size={50} state={feedback?.type === "perfect" ? "energized" : "idle"} level={state.level} />
        </div>
      </div>

      {/* Move buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        <button className="btn btn-xp" onClick={() => handleMove("perfect")} style={{ padding: "12px 6px", fontSize: 10 }}>⚡ PERFECT</button>
        <button className="btn" style={{ background: world.accent, color: "#07090f", padding: "12px 6px", fontSize: 10 }} onClick={() => handleMove("good")}>✓ GOOD</button>
        <button className="btn btn-ghost" onClick={() => handleMove("miss")} style={{ padding: "12px 6px", fontSize: 10 }}>✗ MISS</button>
      </div>

      {/* Stats */}
      <div className="card" style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
        {[
          { label: "COMBO", val: `x${combo}`, color: "var(--xp)" },
          { label: "CARDIO", val: `${state.stats.car}`, color: "var(--car)" },
          { label: "SCORE", val: score.toLocaleString(), color: world.accent },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900, color: s.color }}>{s.val}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.08em" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// BOSS TRIAL SCREEN
// ============================================================
function BossScreen({ state, onRep, onEvolve, onNav }) {
  const [charge, setCharge] = useState(0);
  const [reps, setReps] = useState(0);
  const [phase, setPhase] = useState("intro"); // intro | trial | evolved | failed
  const [feedback, setFeedback] = useState(null);
  const [showFlash, setShowFlash] = useState(false);

  const handleRep = (quality) => {
    const gain = quality === "perfect" ? 8 : quality === "good" ? 4 : 1;
    const f = { perfect: { text: "CHARGE SURGE!", type: "perfect" }, good: { text: "GOOD FORM", type: "good" }, fix: { text: "IMPROVE FORM", type: "fix" } };
    setFeedback(f[quality]);
    setReps(r => r + 1);
    setCharge(c => {
      const next = Math.min(100, c + gain);
      if (next >= 100) {
        setTimeout(() => {
          setShowFlash(true);
          setTimeout(() => { setShowFlash(false); setPhase("evolved"); onEvolve(); }, 600);
        }, 300);
      }
      return next;
    });
    onRep({ stat: quality !== "fix" ? "str" : null, xp: gain });
    setTimeout(() => setFeedback(null), 1000);
  };

  if (phase === "intro") return (
    <div style={{ padding: "24px 20px 100px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center" }}>
      <div style={{ marginBottom: 24, position: "relative" }}>
        <div style={{ position: "absolute", inset: -20, background: "radial-gradient(circle, rgba(180,79,255,0.2) 0%, transparent 70%)", borderRadius: "50%" }}/>
        <Creature size={160} state="evolving" level={state.level} />
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 10, color: "var(--car)", letterSpacing: "0.15em", marginBottom: 8 }}>CREATURE TRIAL</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900, marginBottom: 12, lineHeight: 1.2 }}>YOUR CREATURE IS<br/>READY TO EVOLVE</div>
      <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 36, lineHeight: 1.6, maxWidth: 280 }}>
        Complete the trial with perfect form to charge the evolution meter. Maintain reps until charge reaches 100%.
      </div>
      <button className="btn btn-car" style={{ fontSize: 13, padding: "18px 40px" }} onClick={() => setPhase("trial")}>
        ⚡ START TRIAL
      </button>
      <button className="btn btn-ghost" style={{ marginTop: 14, fontSize: 10 }} onClick={() => onNav("home")}>← BACK</button>
    </div>
  );

  if (phase === "evolved") return (
    <div style={{ padding: "24px 20px 100px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 10, color: "var(--xp)", letterSpacing: "0.15em", marginBottom: 12 }}>✦ EVOLUTION COMPLETE ✦</div>
      <div style={{ position: "relative", marginBottom: 24 }}>
        <div style={{ position: "absolute", inset: -30, background: "radial-gradient(circle, rgba(255,224,51,0.25) 0%, transparent 70%)", borderRadius: "50%", animation: "float 2s ease-in-out infinite" }}/>
        <Creature size={180} state="evolving" level={state.level + 1} />
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 900, marginBottom: 8, background: "linear-gradient(135deg, var(--xp), var(--str))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
        LEVEL {state.level + 1}!
      </div>
      <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 8 }}>{reps} reps completed with perfect form</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--success)", marginBottom: 36 }}>NEW WORLD UNLOCKED →</div>
      <button className="btn btn-xp" style={{ fontSize: 12, padding: "16px 36px" }} onClick={() => onNav("home")}>
        CONTINUE →
      </button>
    </div>
  );

  return (
    <div style={{ padding: "24px 20px 100px", position: "relative" }}>
      {showFlash && <div className="evo-flash"/>}
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 9, color: "var(--car)", letterSpacing: "0.12em" }}>CREATURE TRIAL</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <div className="rep-counter" style={{ fontSize: 32 }}>{reps}</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 10, color: "var(--muted)" }}>REPS</div>
        </div>
      </div>

      {/* Charge meter */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em" }}>EVOLUTION CHARGE</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--car)", fontWeight: 900 }}>{charge}%</div>
        </div>
        <div className="charge-meter">
          <div className="charge-fill" style={{ width: `${charge}%` }}/>
        </div>
      </div>

      {/* Camera */}
      <div className="cam-feed" style={{ height: 220, marginBottom: 16, border: "1px dashed rgba(180,79,255,0.3)", boxShadow: "0 0 40px rgba(180,79,255,0.1)" }}>
        <div className="skeleton-overlay"><SkeletonFigure /></div>
        {/* Creature charging */}
        <div style={{ position: "absolute", bottom: 12, right: 12 }}>
          <Creature size={64} state={charge > 50 ? "evolving" : "idle"} level={state.level} />
        </div>
        {feedback && (
          <div style={{ position: "absolute", top: 16, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <FeedbackChip text={feedback.text} type={feedback.type} />
          </div>
        )}
        {/* Charge glow */}
        {charge > 70 && (
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, rgba(180,79,255,0.1) 0%, transparent 60%)", pointerEvents: "none", animation: "float 1s ease-in-out infinite" }}/>
        )}
      </div>

      {/* Rep buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        <button className="btn btn-xp" onClick={() => handleRep("perfect")} style={{ padding: "13px 6px", fontSize: 10 }}>⚡ PERFECT</button>
        <button className="btn btn-str" onClick={() => handleRep("good")} style={{ padding: "13px 6px", fontSize: 10 }}>✓ GOOD</button>
        <button className="btn btn-ghost" onClick={() => handleRep("fix")} style={{ padding: "13px 6px", fontSize: 10 }}>⚠ FIX</button>
      </div>

      {/* Creature status text */}
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--muted)", marginBottom: 4, letterSpacing: "0.08em" }}>CREATURE STATUS</div>
        <div style={{ color: charge > 70 ? "var(--car)" : "var(--muted)", fontSize: 13, fontWeight: 500 }}>
          {charge < 30 ? "⚡ Charging... Keep going!" : charge < 70 ? "🔥 Energy building! Maintain form!" : "✨ Almost there — push through!"}
        </div>
      </div>

      {charge < 100 && reps >= 30 && (
        <div style={{ marginTop: 14, textAlign: "center" }}>
          <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 8 }}>Charge incomplete — improve form to evolve</div>
          <button className="btn btn-ghost" style={{ fontSize: 10 }} onClick={() => { setCharge(0); setReps(0); }}>RETRY</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SKILL TREE SCREEN
// ============================================================
const SKILL_BRANCHES = [
  {
    label: "STRENGTH",
    color: "var(--str)",
    nodes: [
      { icon: "💪", name: "Power I", unlocked: true },
      { icon: "🦵", name: "Legs", unlocked: true },
      { icon: "🔱", name: "Power II", unlocked: false },
      { icon: "⚔️", name: "Elite Str", unlocked: false },
    ]
  },
  {
    label: "BALANCE",
    color: "var(--bal)",
    nodes: [
      { icon: "⚖️", name: "Core I", unlocked: true },
      { icon: "🧘", name: "Flow", unlocked: false },
      { icon: "🌊", name: "Balance II", unlocked: false },
      { icon: "🌀", name: "Master", unlocked: false },
    ]
  },
  {
    label: "CARDIO",
    color: "var(--car)",
    nodes: [
      { icon: "💃", name: "Rhythm I", unlocked: true },
      { icon: "🎵", name: "Beat", unlocked: true },
      { icon: "🔮", name: "Rhythm II", unlocked: false },
      { icon: "✨", name: "Stamina+", unlocked: false },
    ]
  },
];

function SkillsScreen({ state, onNav }) {
  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 10 }} onClick={() => onNav("home")}>← BACK</button>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 900, letterSpacing: "0.05em" }}>SKILL TREE</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {SKILL_BRANCHES.map((branch, bi) => (
          <div key={bi}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 9, color: branch.color, letterSpacing: "0.12em", marginBottom: 14 }}>{branch.label} BRANCH</div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {branch.nodes.map((node, ni) => (
                <div key={ni} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div className={`skill-node ${node.unlocked ? "unlocked" : ""}`}
                    style={{ borderColor: node.unlocked ? branch.color : undefined, boxShadow: node.unlocked ? `0 0 12px ${branch.color}44` : undefined }}
                    title={node.name}
                  >
                    <span style={{ fontSize: 22 }}>{node.icon}</span>
                    {!node.unlocked && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🔒</div>
                    )}
                  </div>
                  {ni < branch.nodes.length - 1 && (
                    <div className={`skill-connector ${branch.nodes[ni+1].unlocked ? "unlocked" : ""}`}/>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", marginTop: 8 }}>
              {branch.nodes.map((node, ni) => (
                <div key={ni} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 8, color: node.unlocked ? branch.color : "var(--muted)", letterSpacing: "0.06em" }}>{node.name}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Creature display */}
      <div style={{ marginTop: 40, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.1em", marginBottom: 16 }}>CURRENT FORM — LEVEL {state.level}</div>
        <Creature size={100} state="idle" level={state.level} />
        <div style={{ marginTop: 12, fontFamily: "var(--font-display)", fontSize: 13, color: "var(--white)" }}>{state.creature.name}</div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedWorld, setSelectedWorld] = useState(WORLDS[0]);

  const [gameState, setGameState] = useState({
    creature: { name: "VOLTHORN", state: "idle" },
    level: 1,
    xp: 340,
    xpMax: 500,
    streak: 7,
    reps: 0,
    stats: { str: 72, bal: 55, car: 68 },
    missions: [
      { icon: "💪", label: "Complete 20 Reps", desc: "Squat or Push-up", xp: 50, done: false },
      { icon: "💃", label: "Dance Session", desc: "Any world, 3 min", xp: 40, done: true },
      { icon: "🔥", label: "Maintain Streak", desc: "Train today", xp: 30, done: true },
    ]
  });

  // Backend-integration-ready rep handler
  // In production: replace simulation buttons with AI pose detection events
  const handleRep = ({ stat, xp }) => {
    setGameState(prev => {
      const next = { ...prev };
      next.reps = prev.reps + 1;
      next.xp = Math.min(prev.xpMax, prev.xp + (xp || 5));
      if (stat) {
        next.stats = { ...prev.stats, [stat]: Math.min(100, prev.stats[stat] + 2) };
      }
      next.creature = { ...prev.creature, state: stat ? "energized" : "idle" };
      setTimeout(() => setGameState(s => ({ ...s, creature: { ...s.creature, state: "idle" } })), 800);
      return next;
    });
  };

  const handleEvolve = () => {
    setGameState(prev => ({
      ...prev,
      level: prev.level + 1,
      xp: 0,
      stats: { str: 20, bal: 20, car: 20 },
      creature: { ...prev.creature, state: "evolving" },
    }));
  };

  const navItems = [
    { id: "home", icon: "🏠", label: "HOME" },
    { id: "gym", icon: "💪", label: "GYM" },
    { id: "worlds", icon: "🌍", label: "WORLDS" },
    { id: "skills", icon: "🌳", label: "SKILLS" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* Screens */}
        <div className={`screen ${screen === "home" ? "active" : ""}`}>
          <HomeScreen state={gameState} onNav={setScreen} />
        </div>
        <div className={`screen ${screen === "gym" ? "active" : ""}`}>
          <GymScreen state={gameState} onRep={handleRep} onNav={setScreen} />
        </div>
        <div className={`screen ${screen === "worlds" ? "active" : ""}`}>
          <WorldsScreen state={gameState} onNav={setScreen} onSelectWorld={w => { setSelectedWorld(w); setScreen("dance"); }} />
        </div>
        <div className={`screen ${screen === "dance" ? "active" : ""}`}>
          <DanceScreen world={selectedWorld} state={gameState} onRep={handleRep} onNav={setScreen} />
        </div>
        <div className={`screen ${screen === "boss" ? "active" : ""}`}>
          <BossScreen state={gameState} onRep={handleRep} onEvolve={handleEvolve} onNav={setScreen} />
        </div>
        <div className={`screen ${screen === "skills" ? "active" : ""}`}>
          <SkillsScreen state={gameState} onNav={setScreen} />
        </div>

        {/* Nav */}
        <nav className="nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-btn ${screen === item.id ? "active" : ""}`}
              onClick={() => setScreen(item.id)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
