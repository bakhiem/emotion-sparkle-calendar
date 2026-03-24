import { useMemo } from 'react';
import { MoodEntry, MOODS, MoodType } from '@/lib/moodStore';
import { Heart } from 'lucide-react';

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

const STAT_BG = ['pastel-lavender', 'pastel-pink', 'pastel-sky'];

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
      <div className="cute-card">
        <h2 className="text-sm font-extrabold text-foreground mb-2 flex items-center gap-1.5" style={{ fontFamily: "'Baloo 2', cursive" }}>
          <Heart className="w-4 h-4 text-secondary fill-secondary" />
          Insights
        </h2>
        <p className="text-xs text-muted-foreground">check in to see your stats~ 📊</p>
      </div>
    );
  }

  const topMoodDef = MOODS.find(m => m.type === stats.topMood[0]);

  const statItems = [
    { value: String(stats.streak), label: 'streak 🔥' },
    { value: stats.avgScore.toFixed(1), label: 'avg ⭐' },
    { value: topMoodDef?.emoji || '—', label: 'top mood' },
  ];

  return (
    <div className="cute-card">
      <h2 className="text-sm font-extrabold text-foreground mb-3 flex items-center gap-1.5" style={{ fontFamily: "'Baloo 2', cursive" }}>
        <Heart className="w-4 h-4 text-secondary fill-secondary" />
        Insights
      </h2>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {statItems.map(({ value, label }, idx) => (
          <div key={label} className={`${STAT_BG[idx]} rounded-2xl p-3 text-center`}>
            <p className="text-xl font-extrabold text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground font-bold mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {MOODS.map(({ type, emoji }) => {
          const count = stats.counts[type];
          const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
          return (
            <div key={type} className="flex items-center gap-2">
              <span className="text-base w-6 text-center">{emoji}</span>
              <div className="flex-1">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${BAR_BG[type]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground w-5 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoodAnalytics;
