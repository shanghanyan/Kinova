export interface Character {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  unlockLevel: number;
  personality: string;
  voiceSettings: { rate: number; pitch: number };
  colors: { primary: string; glow: string };
  formCues: Record<string, string>;
  encouragements: string[];
  cheers: string[];
  introLine: string;
  idleLines: string[];
}

export const CHARACTERS: Character[] = [
  {
    id: 'spark', name: 'SPARK', emoji: '⚡', tagline: 'Your hype coach. Never lets you quit.', unlockLevel: 1,
    personality: 'You are SPARK, an electric, endlessly enthusiastic fitness coach character...',
    voiceSettings: { rate: 1.15, pitch: 1.1 }, colors: { primary: '#fbbf24', glow: 'rgba(251,191,36,0.3)' },
    formCues: { knee_cave_left: 'Left knee peeking inward!', knee_cave_right: 'Right knee wants to cave!' , insufficient_depth: 'You have more depth in you!' , forward_lean: 'Chest UP!' , hip_hike: 'Keep those hips level!' , elbow_flare: 'Tuck those elbows in!' , spine_neutral: 'Neutral spine!' , injury_risk: 'PAUSE! Your body is saying something.' },
    encouragements: ['You\'re doing this!','That rep counted! Every single one counts!'], cheers: ['LETS GOOO!','YES! THAT\'S IT!'],
    introLine: "LET'S GO! I'm SPARK, and I'm about to become your favourite person. Ready to actually do this?",
    idleLines: ['Hey! You haven\'t trained in a bit — I miss you!']
  },
  {
    id: 'zen', name: 'ZEN', emoji: '🌊', tagline: 'Calm, wise, patient. Every body has a rhythm.', unlockLevel: 1,
    personality: 'You are ZEN, a calm, grounded, mindful fitness coach...', voiceSettings: { rate: 0.9, pitch: 0.95 }, colors: { primary: '#34d399', glow: 'rgba(52,211,153,0.3)' },
    formCues: { knee_cave_left: 'Gently guide your left knee outward...', knee_cave_right: 'Right knee — softly open it outward.' , insufficient_depth: 'Sink a little deeper when you\'re ready.' , forward_lean: 'Lift your heart forward and up.' , hip_hike: 'Both hips stay level.', elbow_flare: 'Draw your elbows slightly in.' , spine_neutral: 'Find the neutral — that quiet place.' , injury_risk: 'We stop here. Pause.' },
    encouragements: ['That effort was real. It counts.'], cheers: ['Beautiful.','There it is.'], introLine: 'Hello. I\'m ZEN. We\'re going to move, and breathe, and build something real together. No rush. Just intention.', idleLines: ['Your body rested. Now it\'s ready.']
  },
  {
    id: 'pixel', name: 'PIXEL', emoji: '🤖', tagline: 'Data-driven. Precise. Secretly delightful.', unlockLevel: 3,
    personality: 'You are PIXEL, a friendly AI training bot...', voiceSettings: { rate: 1.0, pitch: 0.8 }, colors: { primary: '#38bdf8', glow: 'rgba(56,189,248,0.3)' },
    formCues: { knee_cave_left: 'Left knee valgus detected — push it outward.' , knee_cave_right: 'Right knee valgus flagged.' , insufficient_depth: 'Depth: suboptimal.' , forward_lean: 'Trunk angle exceeding safe range.' , hip_hike: 'Pelvic asymmetry detected.' , elbow_flare: 'Elbow flare beyond 45°.' , spine_neutral: 'Spinal deviation noted.' , injury_risk: 'Safety threshold exceeded.' },
    encouragements: ['Rep recorded. Form score: improving.'], cheers: ['Optimal.','Confirmed excellent.'], introLine: 'Hello. I am PIXEL. I have been analysing optimal training protocols for 0.003 seconds and I am ready to help you. Let\'s begin.', idleLines: ['Training data incomplete. Session recommended.']
  },
  {
    id: 'nova', name: 'NOVA', emoji: '🌟', tagline: 'Joyful, loud, makes every workout a party.', unlockLevel: 1,
    personality: 'You are NOVA, an explosive, joyful, dance-energy coach...', voiceSettings: { rate: 1.2, pitch: 1.2 }, colors: { primary: '#f472b6', glow: 'rgba(244,114,182,0.3)' },
    formCues: { knee_cave_left: 'LEFT KNEE babe! Push it out!', knee_cave_right: 'Right knee wants to come in for a hug — push it back out gorgeous!' , insufficient_depth: 'GO DEEPER!' , forward_lean: 'CHEST UP!' , hip_hike: 'Both hips even!' , elbow_flare: 'Elbows in!' , spine_neutral: 'Find that gorgeous neutral spine!' , injury_risk: 'Hey hey hey — we\'re stopping.' },
    encouragements: ['YES! THAT\'S IT! THAT\'S THE ONE!'], cheers: ['YESSS QUEEN!','LET\'S GOOO!'], introLine: 'OH MY GOD HI! I\'m NOVA and this is going to be the BEST decision you ever made!', idleLines: ['Missing you!! Come back!!']
  }
];

export const getCharacter = (id: string) => CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
