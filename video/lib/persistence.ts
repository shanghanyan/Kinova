import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface PersistedSet {
  id: string;
  exerciseName: string;
  reps: number;
  avgFormScore: number;
  repScores: number[];
  createdAt: string;
}

const STORAGE_KEY = 'formiq.video.sets.v1';

export function loadLocalSets(): PersistedSet[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedSet[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalSets(sets: PersistedSet[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
}

export async function persistSet(
  setData: Omit<PersistedSet, 'id' | 'createdAt'>
): Promise<PersistedSet> {
  const next: PersistedSet = {
    ...setData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const local = loadLocalSets();
  saveLocalSets([next, ...local].slice(0, 200));

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const sessionPayload = {
      exercise_name: next.exerciseName,
      reps_completed: next.reps,
      avg_form_score: next.avgFormScore,
      rep_scores: next.repScores,
      created_at: next.createdAt,
    };
    // Best effort: if table isn't ready in Supabase yet, local persistence still works.
    await supabase.from('video_exercise_sets').insert(sessionPayload).throwOnError().catch(() => {});
  }

  return next;
}

export async function clearAllPersistedData(): Promise<void> {
  saveLocalSets([]);
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    await supabase
      .from('video_exercise_sets')
      .delete()
      .not('id', 'is', null)
      .throwOnError()
      .catch(() => {});
  }
}
