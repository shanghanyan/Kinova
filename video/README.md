# Hacktech Kinova
This folder is a standalone Next.js 14 prototype focused on live workout tracking.

## Implemented now

- MediaPipe pose detection running in-browser with camera feed + skeleton overlay.
- Real-time rep counting and form scoring for:
  - Back Squat / Goblet Squat
  - Push-up
  - Lunge
- Voice cues for high-severity form issues.
- Injury risk warnings based on asymmetry + movement speed + score degradation.
- Data persistence:
  - Local-first (`localStorage`)
  - Optional Supabase write-through (if env vars set + table exists)
- Clear data action in the workout screen.

## Routes

- `/` landing
- `/hub` character/world hub
- `/workout` exercise library
- `/workout/[exerciseId]` live camera workout screen

## Environment

Set in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
```

## Supabase schema

Apply SQL from `supabase/schema.sql`.