import { useMemo } from 'react';
import { MoodEntry, MOODS, MoodType } from '@/lib/moodStore';
import { BarChart3 } from 'lucide-react';

interface MoodAnalyticsProps {
  moods: MoodEntry[];
}

const MOOD_SCORES: Record<MoodType, number> = {
  great: 5, good: 4, okay: 3, bad: 2, awful: 1,
};

const BAR_BG: Record<MoodType, string> = {
  great: 'bg-mood-great',
  good: 'bg-mood-good',
  okay: 'bg-mood-okay',
  bad: 'bg-mood-bad',
  awful: 'bg-mood-awful',
};

const MoodAnalytics = ({ moods }: MoodAnalyticsProps) => {
  const stats = useMemo(() => {
    if (moods.length === 0) return null;

    const counts: Record<MoodType, number> = { great: 0, good: 0, okay: 0, bad: 0, awful: 0 };
    moods.forEach(m => counts[m.mood]++);

    const avgScore = moods.reduce((sum, m) => sum + MOOD_SCORES[m.mood], 0) / moods.length;
    const topMood = (Object.entries(counts) as [MoodType, number][]).sort((a, b) => b[1] - a[1])[0];

    const sorted = [...moods].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (sorted.find(m => m.date === key)) streak++;
      else break;
    }

    return { counts, avgScore, topMood, streak, total: moods.length };
  }, [moods]);

  if (!stats) {
    return (
      <div className="nature-card">
        <h2 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-accent" />
          Mood Insights
        </h2>
        <p className="text-sm text-muted-foreground">Start checking in to see your insights 🌻</p>
      </div>
    );
  }

  const topMoodDef = MOODS.find(m => m.type === stats.topMood[0]);

  return (
    <div className="nature-card">
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-accent" />
        Mood Insights
      </h2>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { value: String(stats.streak), label: 'Day Streak 🔥', bg: 'bg-primary/8' },
          { value: stats.avgScore.toFixed(1), label: 'Avg Mood ⭐', bg: 'bg-secondary/8' },
          { value: topMoodDef?.emoji || '—', label: 'Most Common', bg: 'bg-accent/8' },
        ].map(({ value, label, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center border border-border/30`}>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground font-semibold mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {MOODS.map(({ type, emoji }) => {
          const count = stats.counts[type];
          const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
          return (
            <div key={type} className="flex items-center gap-3">
              <span className="text-xl w-8 text-center">{emoji}</span>
              <div className="flex-1">
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-1000 ${BAR_BG[type]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-semibold text-muted-foreground w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoodAnalytics;
