# Kinova
### *Kinetic. Novel. Yours.*
By Ava Cheng, Vanisha Kheterpal, Charlotte Wong, and Alexandra Ye

---

## Inspiration

Tempo is a 2015 YC-backed startup offering live, at-home fitness training powered by computer vision. It's genuinely impressive — but it required expensive hardware, dedicated equipment, and real trainers. The barrier to entry was high, and dropout rates were predictably brutal.

We kept coming back to one group nobody was building for: **complete beginners**. People who don't know what a rep is, who feel intimidated by gym culture, and who quit every fitness app after three days because nothing makes them feel like it's working.

We wanted to fix that — with just a phone camera and AI.

---

## What It Does

Kinova is a beginner-first AI fitness app. No equipment. No trainer. No assumed knowledge.

**The Forge** — point your phone at yourself and pick an exercise. Kinova uses real-time pose detection to track your body, count your reps, and score your form joint by joint. The AI coach gives instant spoken feedback in plain English ("your left knee is caving — push it outward") via K2 Think V2. As you progress through sessions, your dragon companion levels up — a simple visual representation of your cumulative effort.

**The Grid** — tell the app your mood or energy level. K2 generates a personalised dance cardio session around it, tracks your movement, and scores your combos in real time.

**Progression** — XP earned from every session feeds a levelling system with challenges at key milestones. Every number is real: form scores, rep counts, and streaks all come directly from session data.

Built specifically for beginners: every exercise explained in plain English, modifications available for physical limitations, sessions starting at 10 minutes, and an AI coach that remembers your history and goals across sessions.

---

## How We Built It

| Layer | Technology |
|---|---|
| Framework | Next.js 14, App Router, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| Pose detection | MediaPipe Tasks Vision (WASM, fully client-side) |
| AI coaching | **K2 Think V2** — form analysis, coaching, voice Q&A |
| Voice I/O | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| Database | Supabase (Postgres + Auth) |
| Deployment | Vercel |

**K2 Think V2** is the coaching core. After each set, it reads the real form data — joint angles, error patterns, rep scores — and responds with coaching specific to what it observed. Users can also speak to it mid-session: ask what an exercise does, why a cue matters, or what to focus on next. For beginners, understanding *why* is as important as doing.

Pose detection runs entirely in the browser via WebAssembly. We extract 33 body landmarks at ~30fps and compute joint angles using vector dot products at every key joint. Each exercise has a custom analyzer that checks specific angle thresholds, detects compensation patterns, and scores each rep 0–100 based on form quality.

Voice is fully bidirectional. Users hold a mic button to speak; transcripts are sent to K2, which responds in natural language, then synthesised back as the coach's voice using the Web Speech API.

---

## Challenges We Ran Into

**MediaPipe GPU delegation fails silently.** In incognito mode and some mobile browsers, the GPU runtime hangs with no error. We built a tiered fallback: GPU → CPU → camera-only mode with a clear UI state so sessions stay alive regardless.

**Chrome's SpeechSynthesis cuts off long responses.** Anything over ~250 characters gets silently truncated. K2's coaching notes are longer than that. We built a sentence-boundary splitter that queues each sentence as a separate utterance — invisible to the user, essential for the voice to sound natural and complete.

**Rep counting from raw pose data is noisy.** Simple angle threshold crossing creates false positives on slow movements and misses fast ones. We built a phase state machine — `top → descending → bottom → ascending → top` — that requires passing through every phase in sequence before a rep registers. Clean counts, no false positives.

**Making all data real for beginners.** It would have been easy to show placeholder streaks and fake scores. We made everything — form scores, XP, rep counts, session history — come from actual Supabase queries. If someone has zero sessions, it shows zero. The coaching adapts to that. No fabricated progress.

---

## Accomplishments We're Proud Of

Getting pose scoring, AI coaching, voice I/O, and the progression system wired into a single session flow — and having it feel coherent rather than assembled.

More than anything: it works for someone who has never worked out before. Open the app, follow along, get real feedback, understand what you're doing. Getting that flow to feel natural and low-stakes for a complete beginner was the hardest thing to get right, and the thing we're most proud of.

---

## What We Learned

The technical stack came together faster than expected. The genuinely hard part was designing for zero assumed knowledge — every label, every cue, every piece of feedback had to work for someone who didn't know what a "set" was when they opened the app.

We also learned that voice changes the experience more than almost any other feature. The moment the coach started responding in natural language to what the camera actually saw, the app stopped feeling like a tracker and started feeling like something that was paying attention.

---

## What's Next

Gym mode for barbell movements with a wider field of view. Expanded progression stages with more boss challenges. Multiplayer events where your training stats translate into competitive matchups. And continued work on the beginner pipeline — better onboarding, smarter modifications, and a coach that gets more useful the longer you use it.

---

*Built at HackTech 2026.*
