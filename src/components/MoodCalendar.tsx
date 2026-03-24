import { useState, useMemo } from 'react';
import { MoodEntry, MOODS, getDateKey } from '@/lib/moodStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MoodCalendarProps {
  moods: MoodEntry[];
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
    <div className="cute-card">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewDate(new Date(year, month - 1))} className="p-1.5 rounded-xl hover:bg-muted/60 transition-colors active:scale-90">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <h2 className="text-sm font-extrabold text-foreground" style={{ fontFamily: "'Baloo 2', cursive" }}>
          {monthName} {year}
        </h2>
        <button onClick={() => setViewDate(new Date(year, month + 1))} className="p-1.5 rounded-xl hover:bg-muted/60 transition-colors active:scale-90">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-muted-foreground py-1">{d}</div>
        ))}
        {cells.map((cell, i) => (
          <div
            key={i}
            className={`aspect-square flex items-center justify-center rounded-xl text-xs transition-colors ${
              cell.day === 0 ? '' : cell.isToday
                ? 'bg-primary/12 ring-1 ring-primary/30'
                : ''
            }`}
          >
            {cell.day > 0 && (
              cell.emoji ? (
                <span className="text-lg leading-none">{cell.emoji}</span>
              ) : (
                <span className="text-muted-foreground/60 text-[10px] font-semibold">{cell.day}</span>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodCalendar;
