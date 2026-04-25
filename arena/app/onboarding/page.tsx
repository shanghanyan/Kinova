'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import { CharacterSprite } from '@/components/character/CharacterSprite';
import { WorldBackground } from '@/components/world/WorldBackground';
import { CHARACTERS } from '@/lib/characters';
import { WORLDS } from '@/lib/worlds';
import { characterSpeak } from '@/lib/voice';
import { ProgressDots } from '@/components/onboarding/ProgressDots';
import { CharacterSelectCard } from '@/components/onboarding/CharacterSelectCard';
import { WorldSelectCard } from '@/components/onboarding/WorldSelectCard';
import { BodyMap } from '@/components/onboarding/BodyMap';
import { saveOnboardingProfile } from '@/lib/supabase/queries';
import type { LimitationDraft } from '@/types';

const STEPS = ['welcome', 'character', 'world', 'basics', 'goals', 'limitations', 'ready'] as const;
const GOALS = [
  ['feel_better', '💪', 'Feel better in my body'],
  ['lose_weight', '🔥', 'Lose some weight'],
  ['build_muscle', '💿', 'Build muscle'],
  ['more_energy', '⚡', 'More energy day to day'],
  ['sport', '🏅', 'Get better at a sport'],
  ['confidence', '✨', 'Just feel more confident'],
] as const;

const LIMITATION_TYPES: LimitationDraft['type'][] = ['old_injury', 'pain', 'surgery', 'joint_issue'];
const SEVERITIES: LimitationDraft['severity'][] = ['mild', 'moderate', 'severe'];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [characterId, setCharacterId] = useState('spark');
  const [worldId, setWorldId] = useState('pixel_park');

  const [age, setAge] = useState<number | ''>('');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [sex, setSex] = useState('other');
  const [equipment, setEquipment] = useState<string[]>(['bodyweight']);
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [sessionLength, setSessionLength] = useState('20min');

  const [goal, setGoal] = useState('feel_better');
  const [whyStarting, setWhyStarting] = useState('');
  const [biggestFear, setBiggestFear] = useState('');

  const [hasLimitations, setHasLimitations] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [limitationMap, setLimitationMap] = useState<Record<string, LimitationDraft>>({});
  const [modificationSummary, setModificationSummary] = useState('');
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const selectedChar = CHARACTERS.find((c) => c.id === characterId) ?? CHARACTERS[0];
  const selectedWorld = WORLDS.find((w) => w.id === worldId) ?? WORLDS[0];
  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  useEffect(() => {
    if (step === 6) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
      characterSpeak(selectedChar.introLine, characterId, true);
    }
  }, [step, characterId, selectedChar.introLine]);

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));

  const toggleEquipment = (item: string) => {
    setEquipment((prev) => {
      if (prev.includes(item)) return prev.length === 1 ? prev : prev.filter((e) => e !== item);
      return [...prev, item];
    });
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) => (prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]));
    setLimitationMap((prev) => ({
      ...prev,
      [region]: prev[region] ?? { region, type: 'old_injury', severity: 'mild', notes: '' },
    }));
  };

  async function generateModifications() {
    if (!hasLimitations || selectedRegions.length === 0) return;
    const limitations = selectedRegions.map((region) => limitationMap[region]).filter(Boolean);

    const response = await fetch('/api/claude/limitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limitations, character: characterId }),
    });

    if (!response.ok) return;
    const data = await response.json();
    const text = (data?.modifications ?? [])
      .map((m: any) => `${m.body_region}: ${m.ai_notes ?? 'modifications ready'}`)
      .slice(0, 3)
      .join(' | ');
    setModificationSummary(text || 'I have updated your program with beginner-safe modifications.');
    characterSpeak('Okay! I updated your program and have modifications ready for your body.', characterId, true);
  }

  async function completeOnboarding() {
    setSaving(true);
    const limitations = hasLimitations ? selectedRegions.map((region) => limitationMap[region]).filter(Boolean) : [];
    await saveOnboardingProfile(
      {
        character_id: characterId,
        world_id: worldId,
        age: typeof age === 'number' ? age : null,
        height_cm: typeof heightCm === 'number' ? heightCm : null,
        weight_kg: typeof weightKg === 'number' ? weightKg : null,
        biological_sex: sex,
        fitness_experience: 'never',
        available_equipment: equipment,
        days_per_week: daysPerWeek,
        session_length: sessionLength,
        primary_goal: goal,
        why_starting: whyStarting,
        biggest_fear: biggestFear,
        has_limitations: hasLimitations,
        limitations_detail: limitations.map((l) => `${l.region}:${l.type}:${l.severity}`).join(', '),
      },
      limitations
    );

    setSaving(false);
    router.push('/hub');
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <WorldBackground worldId={worldId} intensity={step === 6 ? 1 : 0.4} mouseParallax />

      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-20">
        <div className="h-full bg-xp transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <ProgressDots total={STEPS.length} current={step} />
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16"
        >
          {step === 0 && (
            <div className="max-w-md text-center space-y-6">
              <h1 className="font-display text-6xl text-forge-gradient">THE ARENA</h1>
              <p className="font-body text-text-2 font-bold text-lg">Your world. Your coach. Your first rep.</p>
              <p className="font-body text-base leading-relaxed">Hey. Welcome. This app is for people who have never worked out consistently - or tried and stopped. That is okay. Actually, that is the best place to start. We are going to take this one rep at a time.</p>
              <button onClick={next} className="bg-xp text-bg font-body font-extrabold text-sm px-8 py-4 rounded-full hover:brightness-110 active:scale-95 transition-all duration-150">LET&apos;S START →</button>
              <p className="text-sm text-text-3">Takes 3 minutes. No gym needed to begin.</p>
            </div>
          )}

          {step === 1 && (
            <div className="w-full max-w-4xl space-y-8">
              <div className="text-center space-y-2">
                <h2 className="font-display text-4xl">First - pick your coach.</h2>
                <p className="text-text-2">They will talk to you, guide every rep, and remember everything.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CHARACTERS.map((c) => (
                  <CharacterSelectCard
                    key={c.id}
                    character={c}
                    selected={characterId === c.id}
                    onSelect={() => {
                      setCharacterId(c.id);
                      characterSpeak(c.introLine, c.id, true);
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-center"><button onClick={next} className="bg-xp text-bg font-body font-extrabold text-sm px-6 py-3 rounded-[12px]">CONTINUE →</button></div>
            </div>
          )}

          {step === 2 && (
            <div className="w-full max-w-5xl space-y-8">
              <div className="text-center space-y-2">
                <h2 className="font-display text-4xl">Choose your world.</h2>
                <p className="text-text-2">This is where you will train. More unlock as you level up.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {WORLDS.map((w) => (
                  <WorldSelectCard key={w.id} world={w} selected={worldId === w.id} onSelect={() => setWorldId(w.id)} />
                ))}
              </div>
              <div className="flex justify-center"><button onClick={next} className="bg-xp text-bg font-body font-extrabold text-sm px-6 py-3 rounded-[12px]">CONTINUE →</button></div>
            </div>
          )}

          {step === 3 && (
            <div className="w-full max-w-3xl space-y-5 card">
              <h2 className="font-display text-3xl">Let&apos;s learn a bit about you.</h2>
              <p className="text-text-2">This helps us modify exercises for your body.</p>

              <div className="grid md:grid-cols-3 gap-3">
                <input type="number" value={age} onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')} placeholder="Your age" className="bg-bg-raised border border-border-2 rounded-[12px] px-3 py-3" />
                <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : '')} placeholder="Height (cm)" className="bg-bg-raised border border-border-2 rounded-[12px] px-3 py-3" />
                <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : '')} placeholder="Weight (kg)" className="bg-bg-raised border border-border-2 rounded-[12px] px-3 py-3" />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-bold">Biological sex</div>
                <div className="flex gap-2">
                  {['male', 'female', 'other'].map((value) => (
                    <button key={value} onClick={() => setSex(value)} className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: sex === value ? 'var(--forge)' : 'var(--bg-raised)', color: sex === value ? 'var(--bg)' : 'var(--text-2)' }}>{value}</button>
                  ))}
                </div>
                <p className="text-xs italic text-text-3">We use this for muscle fiber and hormonal differences in programming. It does not define you - it just helps us be more accurate.</p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-bold">Available equipment</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ['bodyweight', 'Bodyweight only'],
                    ['resistance_bands', 'Resistance bands'],
                    ['dumbbells', 'Dumbbells'],
                    ['gym', 'Gym access'],
                  ].map(([key, label]) => (
                    <button key={key} onClick={() => toggleEquipment(key)} className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: equipment.includes(key) ? 'var(--xp)' : 'var(--bg-raised)', color: equipment.includes(key) ? 'var(--bg)' : 'var(--text-2)' }}>{label}</button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-bold">Days per week</div>
                  <div className="flex gap-2">{[2, 3, 4, 5].map((n) => <button key={n} onClick={() => setDaysPerWeek(n)} className="px-4 py-2 rounded-[12px] font-bold" style={{ background: daysPerWeek === n ? 'var(--forge)' : 'var(--bg-raised)', color: daysPerWeek === n ? 'var(--bg)' : 'var(--text-2)' }}>{n}</button>)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-bold">Session length</div>
                  <div className="flex gap-2 flex-wrap">{['10min', '20min', '30min', '45min+'].map((n) => <button key={n} onClick={() => setSessionLength(n)} className="px-4 py-2 rounded-[12px] font-bold" style={{ background: sessionLength === n ? 'var(--forge)' : 'var(--bg-raised)', color: sessionLength === n ? 'var(--bg)' : 'var(--text-2)' }}>{n}</button>)}</div>
                </div>
              </div>

              <div className="flex justify-end"><button onClick={next} className="bg-xp text-bg font-body font-extrabold text-sm px-6 py-3 rounded-[12px]">CONTINUE →</button></div>
            </div>
          )}

          {step === 4 && (
            <div className="w-full max-w-3xl space-y-5 card">
              <h2 className="font-display text-3xl">What are we working toward?</h2>
              <p className="text-text-2">Be honest. There are no wrong answers.</p>

              <div className="grid md:grid-cols-3 gap-3">
                {GOALS.map(([value, emoji, label]) => (
                  <button key={value} onClick={() => { setGoal(value); characterSpeak(`${emoji} Love that goal. We will build this one step at a time.`, characterId, true); }} className="rounded-[12px] border p-3 text-left" style={{ borderColor: goal === value ? 'var(--grid)' : 'var(--border)', background: goal === value ? 'rgba(244,114,182,0.12)' : 'var(--bg-raised)' }}>
                    <div className="text-xl">{emoji}</div>
                    <div className="font-bold text-sm mt-1">{label}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <textarea value={whyStarting} onChange={(e) => { setWhyStarting(e.target.value); if (e.target.value.length > 20) characterSpeak('Thank you for telling me why this matters. I will remember this.', characterId); }} placeholder="A wedding, doctor's advice, tired of feeling tired - anything" className="w-full min-h-24 bg-bg-raised border border-border-2 rounded-[12px] px-3 py-3" />
                <textarea value={biggestFear} onChange={(e) => { setBiggestFear(e.target.value); if (e.target.value.length > 20) characterSpeak('That fear is valid. I will coach you through it safely.', characterId); }} placeholder="Injuries, looking dumb, not knowing what to do - tell us" className="w-full min-h-24 bg-bg-raised border border-border-2 rounded-[12px] px-3 py-3" />
              </div>

              <div className="flex justify-end"><button onClick={next} className="bg-xp text-bg font-body font-extrabold text-sm px-6 py-3 rounded-[12px]">CONTINUE →</button></div>
            </div>
          )}

          {step === 5 && (
            <div className="w-full max-w-4xl space-y-5">
              <div className="card">
                <h2 className="font-display text-3xl mb-2">Any injuries or limitations?</h2>
                <p className="text-text-2">This is important. We modify every exercise around what you have.</p>
                <div className="bg-bg-raised rounded-xl p-4 mt-4 text-text-2">
                  You do not need a perfect body to start. We work with what you have got. Tell us anything - old injuries, current pain, things you have been told to avoid.
                </div>

                <div className="grid md:grid-cols-2 gap-3 mt-4">
                  <button onClick={() => setHasLimitations(false)} className="rounded-[12px] p-4 text-left font-bold" style={{ background: !hasLimitations ? 'rgba(163,230,53,0.14)' : 'var(--bg-raised)', border: `1px solid ${!hasLimitations ? 'var(--xp)' : 'var(--border)'}` }}>All good! No major limitations</button>
                  <button onClick={() => setHasLimitations(true)} className="rounded-[12px] p-4 text-left font-bold" style={{ background: hasLimitations ? 'rgba(251,191,36,0.14)' : 'var(--bg-raised)', border: `1px solid ${hasLimitations ? 'var(--warning)' : 'var(--border)'}` }}>Yes, I have some limitations</button>
                </div>
              </div>

              {hasLimitations && (
                <>
                  <BodyMap selected={selectedRegions} onToggle={toggleRegion} />
                  {selectedRegions.map((region) => {
                    const row = limitationMap[region];
                    if (!row) return null;
                    return (
                      <div key={region} className="card space-y-3">
                        <div className="font-display text-xl">{region.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase())}</div>
                        <div className="flex flex-wrap gap-2">
                          {LIMITATION_TYPES.map((t) => (
                            <button key={t} onClick={() => setLimitationMap((prev) => ({ ...prev, [region]: { ...row, type: t } }))} className="px-3 py-2 rounded-full text-xs font-bold" style={{ background: row.type === t ? 'var(--warning)' : 'var(--bg-raised)', color: row.type === t ? 'var(--bg)' : 'var(--text-2)' }}>{t.replace('_', ' ')}</button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {SEVERITIES.map((s) => (
                            <button key={s} onClick={() => setLimitationMap((prev) => ({ ...prev, [region]: { ...row, severity: s } }))} className="px-3 py-2 rounded-full text-xs font-bold" style={{ background: row.severity === s ? 'var(--forge)' : 'var(--bg-raised)', color: row.severity === s ? 'var(--bg)' : 'var(--text-2)' }}>{s}</button>
                          ))}
                        </div>
                        <textarea value={row.notes} onChange={(e) => setLimitationMap((prev) => ({ ...prev, [region]: { ...row, notes: e.target.value } }))} className="w-full min-h-20 bg-bg-raised border border-border-2 rounded-[12px] px-3 py-3" placeholder="Tell us more..." />
                      </div>
                    );
                  })}

                  <button onClick={generateModifications} className="bg-grid text-bg font-body font-extrabold text-sm px-6 py-3 rounded-[12px]">GENERATE MODIFICATIONS</button>
                  {modificationSummary && <div className="card border border-grid/50">{modificationSummary}</div>}
                </>
              )}

              <div className="flex justify-end"><button onClick={async () => { await generateModifications(); next(); }} className="bg-xp text-bg font-body font-extrabold text-sm px-6 py-3 rounded-[12px]">CONTINUE →</button></div>
            </div>
          )}

          {step === 6 && (
            <div className="max-w-2xl text-center space-y-6">
              <h2 className="font-display text-6xl text-forge-gradient">YOUR ARENA IS READY</h2>
              <div className="flex justify-center"><CharacterSprite characterId={characterId} animation="celebrate" size={180} /></div>
              <div className="card text-left space-y-2">
                <div><strong>Character:</strong> {selectedChar.emoji} {selectedChar.name}</div>
                <div><strong>World:</strong> {selectedWorld.emoji} {selectedWorld.name}</div>
                <div><strong>Goal:</strong> {GOALS.find((g) => g[0] === goal)?.[2]}</div>
                <div><strong>Sessions/week:</strong> {daysPerWeek}</div>
              </div>
              <button onClick={completeOnboarding} disabled={saving} className="w-full bg-forge text-bg font-display text-3xl py-4 rounded-[12px] glow-forge">
                {saving ? 'SAVING...' : 'ENTER THE ARENA →'}
              </button>
            </div>
          )}
        </motion.section>
      </AnimatePresence>

      {step >= 1 && (
        <div className="fixed bottom-6 right-6 z-20">
          <CharacterSprite characterId={characterId} animation="idle" size={80} />
        </div>
      )}
    </main>
  );
}
