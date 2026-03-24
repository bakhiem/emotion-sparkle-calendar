import { useMemo } from 'react';
import { MoodEntry, MOODS, MoodType } from '@/lib/moodStore';

interface MoodAnalyticsProps {
  moods: MoodEntry[];
}

const MOOD_SCORES: Record<MoodType, number> = {
  great: 5, good: 4, okay: 3, bad: 2, awful: 1,
};

const MoodAnalytics = ({ moods }: MoodAnalyticsProps) => {
  const stats = useMemo(() => {
    if (moods.length === 0) return null;

    const counts: Record<MoodType, number> = { great: 0, good: 0, okay: 0, bad: 0, awful: 0 };
    moods.forEach(m => counts[m.mood]++);

    const avgScore = moods.reduce((sum, m) => sum + MOOD_SCORES[m.mood], 0) / moods.length;
    const topMood = (Object.entries(counts) as [MoodType, number][]).sort((a, b) => b[1] - a[1])[0];

    // Streak calculation
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
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-lg font-bold text-foreground mb-2">Mood Insights</h2>
        <p className="text-sm text-muted-foreground">Start checking in to see your mood analytics! 📊</p>
      </div>
    );
  }

  const topMoodDef = MOODS.find(m => m.type === stats.topMood[0]);

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h2 className="text-lg font-bold text-foreground mb-4">Mood Insights</h2>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-accent/60 rounded-lg p-3 text-center">
          <p className="text-2xl font-extrabold text-foreground">{stats.streak}</p>
          <p className="text-xs text-muted-foreground font-semibold">Day Streak 🔥</p>
        </div>
        <div className="bg-accent/60 rounded-lg p-3 text-center">
          <p className="text-2xl font-extrabold text-foreground">{stats.avgScore.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground font-semibold">Avg Mood</p>
        </div>
        <div className="bg-accent/60 rounded-lg p-3 text-center">
          <p className="text-2xl">{topMoodDef?.emoji}</p>
          <p className="text-xs text-muted-foreground font-semibold">Most Common</p>
        </div>
      </div>

      <div className="space-y-2">
        {MOODS.map(({ type, emoji, label }) => {
          const count = stats.counts[type];
          const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
          return (
            <div key={type} className="flex items-center gap-2">
              <span className="text-lg w-7 text-center">{emoji}</span>
              <div className="flex-1">
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-700 bg-mood-${type}`}
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
