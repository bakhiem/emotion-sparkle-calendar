import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MoodEntry, MoodType, TaskEntry, getDateKey } from '@/lib/moodStore';
import { useI18n } from '@/lib/i18n';
import { Sunrise, RefreshCw, Target } from 'lucide-react';
import { toast } from 'sonner';

interface AiDailyCoachProps {
  todayMood?: MoodType;
  moods: MoodEntry[];
  todayTasks: TaskEntry[];
}

interface CoachData {
  message: string;
  challenge: string;
  challenge_emoji: string;
  date: string;
}

const CACHE_KEY = 'moodflow-daily-coach';

const AiDailyCoach = ({ todayMood, moods, todayTasks }: AiDailyCoachProps) => {
  const { t, lang } = useI18n();
  const today = getDateKey(new Date());
  const [data, setData] = useState<CoachData | null>(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      return cached?.date === today ? cached : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const fetchCoach = async () => {
    setLoading(true);
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return getDateKey(d);
    });
    const recentMoods = moods
      .filter(m => last7.includes(m.date))
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(m => ({ date: m.date, mood: m.mood }));

    try {
      const { data: result, error } = await supabase.functions.invoke('mood-insights', {
        body: {
          type: 'daily-coach',
          lang,
          moods: { current: todayMood || null, recent: recentMoods },
          tasks: { completed: todayTasks.filter(t => t.completed).length, total: todayTasks.length },
        },
      });
      if (error) throw error;
      const coachData: CoachData = { ...result, date: today };
      setData(coachData);
      localStorage.setItem(CACHE_KEY, JSON.stringify(coachData));
    } catch (e: any) {
      console.error('AI coach error:', e);
      if (e?.message?.includes('429') || e?.status === 429) {
        toast.error(t('coach.rateLimit'));
      } else if (e?.message?.includes('402') || e?.status === 402) {
        toast.error(t('coach.noCredits'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (todayMood && !data) {
      fetchCoach();
    }
  }, [todayMood]);

  if (!todayMood) return null;

  return (
    <div className="nature-card relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

      <div className="flex items-center justify-between mb-3 relative">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Sunrise className="w-5 h-5 text-accent" />
          {t('coach.title')}
        </h3>
        <button
          onClick={fetchCoach}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && !data && (
        <div className="flex items-center gap-2 py-4">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">{t('coach.loading')}</span>
        </div>
      )}

      {data && (
        <div className="space-y-3 relative">
          <p className="text-sm text-foreground leading-relaxed">{data.message}</p>

          <div className="flex items-start gap-2 bg-primary/8 rounded-xl px-3 py-2.5 border border-primary/15">
            <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">{t('coach.challenge')}</span>
              <p className="text-sm text-foreground mt-0.5">
                {data.challenge_emoji} {data.challenge}
              </p>
            </div>
          </div>
        </div>
      )}

      {!data && !loading && (
        <button
          onClick={fetchCoach}
          className="w-full py-3 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
        >
          {t('coach.cta')}
        </button>
      )}
    </div>
  );
};

export default AiDailyCoach;
