import { useMemo } from 'react';
import { MoodEntry, MOODS, MoodType, getDateKey } from '@/lib/moodStore';
import { MOOD_IMAGES } from '@/lib/moodImages';
import { BarChart3, TrendingUp, Calendar, Flame, Target } from 'lucide-react';

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

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MoodAnalytics = ({ moods }: MoodAnalyticsProps) => {
  const stats = useMemo(() => {
    if (moods.length === 0) return null;

    const counts: Record<MoodType, number> = { great: 0, good: 0, okay: 0, bad: 0, awful: 0 };
    moods.forEach(m => counts[m.mood]++);

    const avgScore = moods.reduce((sum, m) => sum + MOOD_SCORES[m.mood], 0) / moods.length;
    const topMood = (Object.entries(counts) as [MoodType, number][]).sort((a, b) => b[1] - a[1])[0];

    // Streak
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

    // Weekly trend (last 7 days avg vs previous 7 days avg)
    const last7: number[] = [];
    const prev7: number[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = getDateKey(d);
      const entry = moods.find(m => m.date === key);
      if (entry) {
        if (i < 7) last7.push(MOOD_SCORES[entry.mood]);
        else prev7.push(MOOD_SCORES[entry.mood]);
      }
    }
    const last7Avg = last7.length > 0 ? last7.reduce((a, b) => a + b, 0) / last7.length : 0;
    const prev7Avg = prev7.length > 0 ? prev7.reduce((a, b) => a + b, 0) / prev7.length : 0;
    const weeklyTrend = last7Avg - prev7Avg;

    // Mood by day of week
    const dayScores: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    moods.forEach(m => {
      const day = new Date(m.date + 'T12:00:00').getDay();
      dayScores[day].push(MOOD_SCORES[m.mood]);
    });
    const dayAvgs = Object.entries(dayScores).map(([day, scores]) => ({
      day: Number(day),
      avg: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      count: scores.length,
    }));

    // Best & worst day
    const bestDay = dayAvgs.filter(d => d.count > 0).sort((a, b) => b.avg - a.avg)[0];
    const worstDay = dayAvgs.filter(d => d.count > 0).sort((a, b) => a.avg - b.avg)[0];

    // Monthly check-in rate
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
    const daysPassed = today.getDate();
    const monthCheckins = moods.filter(m => {
      const d = new Date(m.date + 'T12:00:00');
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    const checkinRate = Math.round((monthCheckins / daysPassed) * 100);

    return { counts, avgScore, topMood, streak, total: moods.length, weeklyTrend, dayAvgs, bestDay, worstDay, checkinRate, last7Avg };
  }, [moods]);

  if (!stats) {
    return (
      <div className="space-y-5">
        <div className="nature-card text-center py-10">
          <BarChart3 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground mb-1">Mood Insights</h2>
          <p className="text-sm text-muted-foreground">Start checking in to see your insights 🌻</p>
        </div>
      </div>
    );
  }

  const topMoodDef = MOODS.find(m => m.type === stats.topMood[0]);
  const maxDayAvg = Math.max(...stats.dayAvgs.map(d => d.avg), 1);

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="nature-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
            <Flame className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.streak}</p>
            <p className="text-xs text-muted-foreground font-semibold">Day Streak</p>
          </div>
        </div>
        <div className="nature-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.checkinRate}%</p>
            <p className="text-xs text-muted-foreground font-semibold">This Month</p>
          </div>
        </div>
        <div className="nature-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.last7Avg.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground font-semibold">Week Avg</p>
          </div>
        </div>
        <div className="nature-card flex items-center gap-3">
          {topMoodDef && (
            <img src={MOOD_IMAGES[topMoodDef.type]} alt={topMoodDef.label} width={40} height={40} className="w-10 h-10" />
          )}
          <div>
            <p className="text-sm font-bold text-foreground capitalize">{topMoodDef?.label}</p>
            <p className="text-xs text-muted-foreground font-semibold">Top Mood</p>
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="nature-card">
        <h3 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-secondary" />
          Weekly Trend
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {stats.weeklyTrend > 0.2 ? 'Your mood is trending up! 🌱' :
           stats.weeklyTrend < -0.2 ? 'Your mood dipped a bit this week 🍂' :
           'Your mood is holding steady 🌿'}
        </p>
        <div className="flex items-end justify-center gap-1">
          {stats.weeklyTrend > 0 ? (
            <span className="text-sm font-bold text-primary">↑ +{stats.weeklyTrend.toFixed(1)}</span>
          ) : stats.weeklyTrend < 0 ? (
            <span className="text-sm font-bold text-destructive">↓ {stats.weeklyTrend.toFixed(1)}</span>
          ) : (
            <span className="text-sm font-bold text-muted-foreground">→ 0.0</span>
          )}
          <span className="text-xs text-muted-foreground ml-1">vs last week</span>
        </div>
      </div>

      {/* Mood by Day of Week */}
      <div className="nature-card">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-accent" />
          Mood by Day
        </h3>
        <div className="flex items-end justify-between gap-2 h-28">
          {stats.dayAvgs.map(({ day, avg, count }) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center justify-end h-20">
                {count > 0 && (
                  <span className="text-[10px] font-semibold text-muted-foreground mb-1">{avg.toFixed(1)}</span>
                )}
                <div
                  className="w-full max-w-[28px] rounded-t-lg bg-primary/70 transition-all duration-500"
                  style={{ height: count > 0 ? `${(avg / maxDayAvg) * 100}%` : '4px', opacity: count > 0 ? 1 : 0.2 }}
                />
              </div>
              <span className={`text-[10px] font-semibold ${
                stats.bestDay?.day === day ? 'text-primary' : 'text-muted-foreground'
              }`}>{DAY_NAMES[day]}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-xs text-muted-foreground">
          {stats.bestDay && <span>Best: <strong className="text-primary">{DAY_NAMES[stats.bestDay.day]}</strong></span>}
          {stats.worstDay && <span>Lowest: <strong className="text-accent">{DAY_NAMES[stats.worstDay.day]}</strong></span>}
        </div>
      </div>

      {/* Mood Distribution */}
      <div className="nature-card">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Mood Distribution
        </h3>
        <div className="space-y-3">
          {MOODS.map(({ type }) => {
            const count = stats.counts[type];
            const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <div key={type} className="flex items-center gap-3">
                <img src={MOOD_IMAGES[type]} alt={type} width={28} height={28} className="w-7 h-7" />
                <div className="flex-1">
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-1000 ${BAR_BG[type]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold text-muted-foreground w-12 text-right">{Math.round(pct)}%</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">{stats.total} total check-ins 🌸</p>
      </div>
    </div>
  );
};

export default MoodAnalytics;
