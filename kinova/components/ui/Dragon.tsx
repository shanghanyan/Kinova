interface DragonProps {
  size?: number;
  state?: "idle" | "energized" | "evolving";
  level?: number;
}

export function Dragon({ size = 130, state = "idle", level = 1 }: DragonProps) {
  const palettes = {
    1: {
      body: "#f0907a",
      belly: "#ffd4c4",
      spot: "#d95a44",
      teal: "#5fa8a0",
      eye: "#2a1010",
      gem: "#e84a6f",
      accent: "#ffe033",
    },
    2: {
      body: "#7ab4f0",
      belly: "#d4eaff",
      spot: "#4a7ae0",
      teal: "#9060c8",
      eye: "#101028",
      gem: "#33ccff",
      accent: "#ffe033",
    },
    3: {
      body: "#f0d47a",
      belly: "#fff8d4",
      spot: "#c89030",
      teal: "#e07840",
      eye: "#281800",
      gem: "#ff5f2e",
      accent: "#ffffff",
    },
  } as const;
  const p = palettes[Math.min(level, 3) as 1 | 2 | 3];
  const glowColor = state === "evolving" ? "#ffe033" : state === "energized" ? p.gem : `${p.teal}99`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={`creature-svg ${state}`}
      style={{
        filter: `drop-shadow(0 0 ${state === "evolving" ? 36 : 14}px ${glowColor})`,
        display: "block",
      }}
    >
      <path d="M106,116 Q142,128 136,150 Q122,160 110,144 Q104,134 106,116Z" fill={p.body} />
      <ellipse
        cx="126"
        cy="142"
        rx="8"
        ry="5"
        fill={p.teal}
        opacity="0.55"
        transform="rotate(30,126,142)"
      />
      <ellipse
        cx="118"
        cy="150"
        rx="6"
        ry="4"
        fill={p.teal}
        opacity="0.4"
        transform="rotate(20,118,150)"
      />

      <ellipse cx="77" cy="112" rx="43" ry="33" fill={p.body} />
      <ellipse cx="74" cy="118" rx="27" ry="21" fill={p.belly} opacity="0.88" />

      <ellipse cx="94" cy="88" rx="8" ry="5.5" fill={p.teal} transform="rotate(-25,94,88)" />
      <ellipse cx="104" cy="96" rx="7" ry="4.5" fill={p.teal} transform="rotate(-15,104,96)" />
      <ellipse cx="111" cy="107" rx="6" ry="4" fill={p.teal} transform="rotate(-5,111,107)" />

      <path d="M100,86 Q130,64 146,48 Q150,68 140,86 Q128,104 108,110Z" fill={p.body} opacity="0.85" />
      <path d="M100,86 Q122,70 140,52" stroke={p.spot} strokeWidth="1.3" fill="none" opacity="0.5" />
      <path d="M103,94 Q126,78 143,63" stroke={p.spot} strokeWidth="1.1" fill="none" opacity="0.4" />
      <path d="M106,102 Q130,88 145,75" stroke={p.spot} strokeWidth="0.9" fill="none" opacity="0.3" />
      <path
        d="M100,86 Q130,64 146,48 Q150,68 140,86 Q128,104 108,110Z"
        fill="none"
        stroke={p.spot}
        strokeWidth="1.3"
        opacity="0.4"
      />

      <circle cx="66" cy="106" r="5.5" fill={p.spot} opacity="0.5" />
      <circle cx="82" cy="119" r="4.5" fill={p.spot} opacity="0.45" />
      <circle cx="56" cy="118" r="4" fill={p.spot} opacity="0.4" />
      <circle cx="75" cy="99" r="3.5" fill={p.spot} opacity="0.38" />
      <circle cx="90" cy="112" r="3" fill={p.spot} opacity="0.42" />
      <circle cx="60" cy="98" r="4" fill={p.teal} opacity="0.35" />
      <circle cx="88" cy="102" r="3" fill={p.teal} opacity="0.3" />

      <ellipse cx="56" cy="140" rx="15" ry="9" fill={p.body} />
      <ellipse cx="92" cy="140" rx="15" ry="9" fill={p.body} />
      {[-6, -1, 4].map((dx, i) => (
        <path
          key={`left-claw-${i}`}
          d={`M${56 + dx},146 Q${55 + dx},153 ${54 + dx},156`}
          stroke={p.teal}
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {[-6, -1, 4].map((dx, i) => (
        <path
          key={`right-claw-${i}`}
          d={`M${92 + dx},146 Q${91 + dx},153 ${90 + dx},156`}
          stroke={p.teal}
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />
      ))}

      <circle cx="76" cy="70" r="35" fill={p.body} />
      <ellipse cx="53" cy="80" rx="9" ry="5.5" fill={p.spot} opacity="0.28" />
      <ellipse cx="99" cy="80" rx="9" ry="5.5" fill={p.spot} opacity="0.28" />

      <circle cx="67" cy="57" r="4" fill={p.teal} opacity="0.75" />
      <circle cx="76" cy="51" r="3.5" fill={p.teal} opacity="0.7" />
      <circle cx="85" cy="57" r="4" fill={p.teal} opacity="0.75" />
      <circle cx="71" cy="64" r="3" fill={p.teal} opacity="0.6" />
      <circle cx="81" cy="63" r="2.5" fill={p.teal} opacity="0.55" />

      <path d="M42,60 Q32,48 37,34 Q47,42 49,56Z" fill={p.teal} />
      <path d="M42,60 Q34,50 38,36" stroke="#3a7870" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M110,60 Q120,48 115,34 Q105,42 103,56Z" fill={p.teal} />
      <path d="M110,60 Q118,50 114,36" stroke="#3a7870" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M38,50 Q30,42 33,30 Q41,37 42,48Z" fill={p.teal} opacity="0.7" />
      <path d="M114,50 Q122,42 119,30 Q111,37 110,48Z" fill={p.teal} opacity="0.7" />

      <path d="M58,40 Q50,16 54,4 Q65,14 66,36Z" fill={p.teal} />
      <path d="M59,38 Q53,20 55,6" stroke="#3a7870" strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d="M91,36 Q98,10 102,2 Q111,16 106,38Z" fill={p.teal} />
      <path d="M92,34 Q100,13 102,4" stroke="#3a7870" strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d="M75,34 Q73,22 75,15 Q79,22 79,34Z" fill={p.teal} opacity="0.9" />
      <ellipse cx="62" cy="40" rx="6" ry="4" fill={p.teal} opacity="0.6" transform="rotate(-20,62,40)" />
      <ellipse cx="90" cy="38" rx="6" ry="4" fill={p.teal} opacity="0.6" transform="rotate(20,90,38)" />

      <circle cx="62" cy="72" r="13" fill="#fff9f4" />
      <circle cx="90" cy="72" r="13" fill="#fff9f4" />
      <circle cx="63" cy="73" r="9.5" fill={p.eye} />
      <circle cx="91" cy="73" r="9.5" fill={p.eye} />
      <circle cx="58" cy="68" r="3.5" fill="rgba(255,255,255,0.35)" />
      <circle cx="86" cy="68" r="3.5" fill="rgba(255,255,255,0.35)" />
      <circle cx="67" cy="77" r="1.8" fill="rgba(255,255,255,0.2)" />
      <circle cx="95" cy="77" r="1.8" fill="rgba(255,255,255,0.2)" />

      <ellipse cx="76" cy="84" rx="11" ry="8" fill={p.belly} />
      <circle cx="72" cy="83" r="1.8" fill={p.spot} opacity="0.5" />
      <circle cx="80" cy="83" r="1.8" fill={p.spot} opacity="0.5" />

      {state === "energized" || state === "evolving" ? (
        <path d="M67,91 Q76,100 85,91" stroke={p.spot} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M69,91 Q76,96 83,91" stroke={p.spot} strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      <rect x="72" y="90" width="3" height="3" rx="1" fill={p.belly} opacity="0.7" />
      <rect x="77" y="90" width="3" height="3" rx="1" fill={p.belly} opacity="0.7" />

      <path d="M55,101 Q76,110 97,101" stroke={p.teal} strokeWidth="1.8" fill="none" opacity="0.65" />
      <polygon points="76,108 71,115 76,121 81,115" fill={p.gem} />
      <polygon points="76,108 71,115 76,114" fill="rgba(255,255,255,0.35)" />
      <polygon points="76,117 71,115 76,121" fill="rgba(0,0,0,0.15)" />
      <circle cx="76" cy="108" r="2.2" fill={p.teal} />

      <ellipse cx="22" cy="143" rx="9" ry="11" fill={p.teal} opacity="0.88" />
      <circle cx="19" cy="139" r="1.8" fill={p.eye} opacity="0.85" />
      <circle cx="25" cy="140" r="1.8" fill={p.eye} opacity="0.85" />
      <path d="M19,145 Q22,148 25,145" stroke={p.eye} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.7" />
      <ellipse cx="11" cy="149" rx="5.5" ry="4.5" fill={p.teal} opacity="0.5" />
      <circle cx="9.5" cy="148" r="1" fill={p.eye} opacity="0.45" />
      <circle cx="12.5" cy="148" r="1" fill={p.eye} opacity="0.45" />

      <ellipse cx="44" cy="153" rx="6" ry="2.5" fill={p.belly} opacity="0.35" />
      <ellipse cx="60" cy="155" rx="4" ry="2" fill={p.belly} opacity="0.28" />
      <ellipse cx="102" cy="154" rx="5" ry="2.2" fill={p.belly} opacity="0.3" />
      <ellipse cx="118" cy="152" rx="3.5" ry="1.8" fill={p.teal} opacity="0.25" />

      {level >= 2 && (
        <>
          <circle cx="120" cy="28" r="13" fill={p.gem} />
          <text
            x="120"
            y="33"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill="#fff"
            fontFamily="sans-serif"
          >
            {level}
          </text>
        </>
      )}

      {(state === "evolving" || state === "energized") &&
        [
          { cx: 18, cy: 28, r: 3.5, c: p.gem, dur: "0.85s" },
          { cx: 132, cy: 38, r: 2.8, c: p.teal, dur: "1.2s" },
          { cx: 76, cy: 8, r: 4.5, c: "#fff", dur: "0.7s" },
          { cx: 148, cy: 78, r: 2.2, c: p.accent, dur: "1.4s" },
          { cx: 8, cy: 98, r: 3, c: p.teal, dur: "1.05s" },
          { cx: 50, cy: 6, r: 2.5, c: p.spot, dur: "0.95s" },
        ].map((pt, i) => (
          <circle key={`particle-${i}`} cx={pt.cx} cy={pt.cy} r={pt.r} fill={pt.c} opacity="0.85">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0;0,-18;0,-38"
              dur={pt.dur}
              repeatCount="indefinite"
            />
            <animate attributeName="opacity" values="0.85;0.35;0" dur={pt.dur} repeatCount="indefinite" />
          </circle>
        ))}
    </svg>
  );
}
