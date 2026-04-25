import type { LimitationDraft, OnboardingProfileDraft } from '@/types';
import { createClient } from '@/lib/supabase/client';

export async function saveOnboardingProfile(draft: OnboardingProfileDraft, limitations: LimitationDraft[]) {
  const supabase = createClient();
  if (!supabase) return { ok: false, reason: 'supabase_not_configured' as const };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, reason: 'no_user' as const };

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    onboarding_complete: true,
    onboarding_step: 7,
    ...draft,
  });

  if (profileError) return { ok: false, reason: 'profile_error' as const, error: profileError.message };

  if (limitations.length > 0) {
    await supabase.from('limitations').delete().eq('user_id', user.id);
    const { error: limitationError } = await supabase.from('limitations').insert(
      limitations.map((l) => ({
        user_id: user.id,
        body_region: l.region,
        limitation_type: l.type,
        severity: l.severity,
        notes: l.notes,
      }))
    );
    if (limitationError) return { ok: false, reason: 'limitations_error' as const, error: limitationError.message };
  }

  return { ok: true as const };
}
