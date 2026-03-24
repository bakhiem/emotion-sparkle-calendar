import { useState, useMemo } from 'react';
import { MoodEntry, MOODS, getDateKey } from '@/lib/moodStore';
import { MOOD_IMAGES } from '@/lib/moodImages';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MoodCalendarProps {
  moods: MoodEntry[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MoodCalendar = ({ moods }: MoodCalendarProps) => {
  const [viewDate, setViewDate] = useState(new Date());

  const { year, month, cells } = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const today = getDateKey(new Date());

    const cells: { day: number; dateKey: string; emoji?: string; isToday: boolean }[] = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: 0, dateKey: '', isToday: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const entry = moods.find(e => e.date === dateKey);
      const moodDef = entry ? MOODS.find(m => m.type === entry.mood) : undefined;
      cells.push({ day: d, dateKey, emoji: moodDef?.emoji, isToday: dateKey === today });
    }
    return { year: y, month: m, cells };
  }, [viewDate, moods]);

  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

  return (
    <div className="nature-card">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setViewDate(new Date(year, month - 1))} className="p-2 rounded-xl hover:bg-muted/60 transition-colors active:scale-95">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground">🗓️ {monthName} {year}</h2>
        <button onClick={() => setViewDate(new Date(year, month + 1))} className="p-2 rounded-xl hover:bg-muted/60 transition-colors active:scale-95">
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1.5">{d}</div>
        ))}
        {cells.map((cell, i) => (
          <div
            key={i}
            className={`aspect-square flex items-center justify-center rounded-xl text-sm transition-colors ${
              cell.day === 0 ? '' : cell.isToday
                ? 'bg-primary/12 ring-1 ring-primary/30'
                : cell.emoji ? '' : 'hover:bg-muted/40'
            }`}
          >
            {cell.day > 0 && (
              cell.emoji ? (
                <span className="text-xl leading-none">{cell.emoji}</span>
              ) : (
                <span className="text-muted-foreground text-xs">{cell.day}</span>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodCalendar;
