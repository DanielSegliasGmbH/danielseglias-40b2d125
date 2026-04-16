import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useGamification } from './useGamification';
import { usePeakScore } from './usePeakScore';
import { useUserAvatar } from './useUserAvatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ── Voice settings from profile ──
export function useVoiceSettings() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ['voice-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('voice_brief_enabled, voice_weekly_enabled, first_name')
        .eq('id', user.id)
        .maybeSingle();
      return {
        voice_brief_enabled: (data as any)?.voice_brief_enabled ?? true,
        voice_weekly_enabled: (data as any)?.voice_weekly_enabled ?? true,
        first_name: data?.first_name ?? 'User',
      };
    },
    enabled: !!user,
  });
  return data;
}

// ── Morning briefing script ──
export function useMorningBriefScript() {
  const { user } = useAuth();
  const { points, streakDays } = useGamification();
  const { score } = usePeakScore();
  const { futureSelfName } = useUserAvatar();
  const settings = useVoiceSettings();

  // Fetch today's tasks
  const { data: todayTasks = [] } = useQuery({
    queryKey: ['today-tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('client_tasks')
        .select('title')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .lte('due_date', today)
        .limit(3);
      return data || [];
    },
    enabled: !!user,
  });

  const name = settings?.first_name || 'User';
  const futureN = futureSelfName || 'Dein Zukunfts-Ich';

  const MOTIVATIONAL_LINES = [
    `${futureN} glaubt an dich.`,
    `Jeder kleine Schritt zählt.`,
    `${futureN} ist stolz auf deinen Weg.`,
    `Du bist auf dem richtigen Kurs.`,
    `${futureN} wartet auf dich – du kommst näher.`,
  ];

  const motivational = MOTIVATIONAL_LINES[new Date().getDate() % MOTIVATIONAL_LINES.length];

  let script = `Guten Morgen ${name}. `;

  if (score !== null) {
    script += `Dein PeakScore ist heute bei ${score} Monaten. `;
  }

  if (streakDays > 3) {
    script += `Dein ${streakDays}-Tage-Streak läuft. Beeindruckend. `;
  }

  if (todayTasks.length > 0) {
    const taskNames = todayTasks.map(t => t.title).join(', ');
    script += `Heute steht auf deiner Liste: ${taskNames}. `;
  }

  script += `${motivational} `;
  script += `${futureN} ist stolz auf dich. Mach heute einen Schritt.`;

  return script;
}

// ── Sunday reflection script ──
export function useSundayReflectionScript() {
  const { user } = useAuth();
  const { points, streakDays } = useGamification();
  const { score } = usePeakScore();
  const { futureSelfName } = useUserAvatar();
  const settings = useVoiceSettings();

  const { data: weeklyStats } = useQuery({
    queryKey: ['weekly-voice-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { count: tasksCompleted } = await supabase
        .from('client_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .gte('completed_at', weekAgo);
      const { count: toolsUsed } = await supabase
        .from('gamification_actions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('action_type', 'tool_used')
        .gte('created_at', weekAgo);
      return { tasksCompleted: tasksCompleted || 0, toolsUsed: toolsUsed || 0 };
    },
    enabled: !!user,
  });

  const name = settings?.first_name || 'User';
  const futureN = futureSelfName || 'Dein Zukunfts-Ich';

  const REFLECTION_MOTIVATIONS = [
    `Bleib neugierig, bleib diszipliniert.`,
    `Geduld ist deine grösste Stärke.`,
    `Kleine Schritte, grosse Wirkung.`,
    `Du baust etwas Besonderes auf.`,
  ];
  const motivation = REFLECTION_MOTIVATIONS[new Date().getDate() % REFLECTION_MOTIVATIONS.length];

  let script = `Es ist Sonntag, ${name}. Zeit für einen ehrlichen Blick zurück. `;

  if (weeklyStats) {
    if (weeklyStats.tasksCompleted > 0) {
      script += `Diese Woche hast du ${weeklyStats.tasksCompleted} Aufgaben abgeschlossen. `;
    }
    if (weeklyStats.toolsUsed > 0) {
      script += `Du hast ${weeklyStats.toolsUsed} Mal ein Tool genutzt. `;
    }
  }

  if (score !== null) {
    script += `Dein PeakScore liegt bei ${score} Monaten. `;
  }

  if (streakDays > 0) {
    script += `Dein Streak: ${streakDays} Tage am Stück. `;
  }

  script += `Was hat diese Woche gut funktioniert? Was war schwierig? Nimm dir einen Moment. `;
  script += `${futureN} würde dir jetzt sagen: ${motivation} `;
  script += `Aber heute: ruh dich aus. Du hast dir das verdient. `;
  script += `Bis morgen, ${name}.`;

  return script;
}

// ── TTS Player hook ──
export function useTTSPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const play = useCallback((text: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) return;

    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-CH';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Try to find a German voice
    const voices = window.speechSynthesis.getVoices();
    const deVoice = voices.find(v => v.lang === 'de-CH') ||
      voices.find(v => v.lang === 'de-DE') ||
      voices.find(v => v.lang.startsWith('de'));
    if (deVoice) utterance.voice = deVoice;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      if (intervalRef.current) clearInterval(intervalRef.current);
      onEnd?.();
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    // Estimate duration for progress
    const words = text.split(/\s+/).length;
    const durationMs = (words / 150) * 60 * 1000 / 0.95; // 150 WPM at 0.95 rate
    const startTime = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(99, (elapsed / durationMs) * 100));
    }, 200);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [stop]);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { play, pause, resume, stop, isPlaying, isPaused, progress };
}

// ── Track weekly audio reflection ──
export function useWeeklyAudioReflection() {
  const { user } = useAuth();
  const qc = useQueryClient();

  function getWeekKey(): string {
    const d = new Date();
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  const weekKey = getWeekKey();

  const { data: reflection } = useQuery({
    queryKey: ['audio-reflection', user?.id, weekKey],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('weekly_audio_reflections')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_key', weekKey)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const markListened = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (reflection) {
        await supabase
          .from('weekly_audio_reflections')
          .update({ listened: true, listened_at: new Date().toISOString() })
          .eq('id', reflection.id);
      } else {
        await supabase.from('weekly_audio_reflections').insert({
          user_id: user.id,
          week_key: weekKey,
          listened: true,
          listened_at: new Date().toISOString(),
        } as any);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['audio-reflection'] }),
  });

  return { listened: reflection?.listened ?? false, markListened, weekKey };
}
