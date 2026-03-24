import { useMemo } from 'react';
import { MoodEntry, MOODS, MoodType } from '@/lib/moodStore';
import { BarChart3 } from 'lucide-react';

interface MoodAnalyticsProps {
  moods: MoodEntry[];
}

const MOOD_SCORES: Record<MoodType, number> = {
  great: 5, good: 4, okay: 3, bad: 2, awful: 1,
};

const BAR_COLORS: Record<MoodType, string> = {
  great: 'from-emerald-400 to-teal-500',
  good: 'from-cyan-400 to-sky-500',
  okay: 'from-amber-400 to-yellow-500',
  bad: 'from-orange-400 to-red-400',
  awful: 'from-rose-400 to-pink-500',
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
      <div className="card-3d gradient-bg-4 p-6">
        <h2 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-accent" />
          Mood Insights
        </h2>
        <p className="text-sm text-muted-foreground">Start checking in to see your mood analytics! 📊</p>
      </div>
    );
  }

  const topMoodDef = MOODS.find(m => m.type === stats.topMood[0]);

  return (
    <div className="card-3d gradient-bg-4 p-6">
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-accent" />
        Mood Insights
      </h2>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { value: String(stats.streak), label: 'Day Streak 🔥', gradient: 'from-primary/15 to-accent/15' },
          { value: stats.avgScore.toFixed(1), label: 'Avg Mood ⭐', gradient: 'from-secondary/15 to-primary/15' },
          { value: topMoodDef?.emoji || '—', label: 'Most Common', gradient: 'from-accent/15 to-secondary/15' },
        ].map(({ value, label, gradient }) => (
          <div key={label} className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 text-center shadow-sm border border-border/30 hover:shadow-md hover:-translate-y-0.5 transition-all`}>
            <p className="text-2xl font-extrabold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground font-bold mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {MOODS.map(({ type, emoji, label }) => {
          const count = stats.counts[type];
          const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
          return (
            <div key={type} className="flex items-center gap-3">
              <span className="text-xl w-8 text-center drop-shadow-sm">{emoji}</span>
              <div className="flex-1">
                <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 bg-gradient-to-r ${BAR_COLORS[type]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-bold text-muted-foreground w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoodAnalytics;
