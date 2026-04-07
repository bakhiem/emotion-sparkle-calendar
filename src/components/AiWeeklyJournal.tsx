import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MoodEntry, TaskEntry, getDateKey } from '@/lib/moodStore';
import { BookOpen, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AiWeeklyJournalProps {
  moods: MoodEntry[];
  tasks: TaskEntry[];
}

const AiWeeklyJournal = ({ moods, tasks }: AiWeeklyJournalProps) => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchJournal = async () => {
    setLoading(true);

    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return getDateKey(d);
    });

    const weekMoods = moods
      .filter(m => last7.includes(m.date))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(m => ({ date: m.date, mood: m.mood }));

    const weekTasks = tasks
      .filter(t => last7.includes(t.date))
      .map(t => ({ date: t.date, text: t.text, done: t.completed }));

    if (weekMoods.length === 0) return setLoading(false);

    try {
      const { data, error } = await supabase.functions.invoke('mood-insights', {
        body: { type: 'weekly-journal', moods: weekMoods, tasks: weekTasks },
      });
      if (error) throw error;
      setMessage(data.message);
    } catch (e) {
      console.error('AI weekly journal error:', e);
    } finally {
      setLoading(false);
    }
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return getDateKey(d);
  });
  const weekMoodCount = moods.filter(m => last7.includes(m.date)).length;

  if (weekMoodCount === 0) return null;

  return (
    <div className="nature-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-secondary" />
          Weekly Journal
        </h3>
        <button
          onClick={fetchJournal}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {!message && !loading && (
        <button
          onClick={fetchJournal}
          className="w-full py-3 rounded-xl bg-secondary/10 text-secondary text-sm font-semibold hover:bg-secondary/20 transition-colors"
        >
          📖 Generate my weekly journal
        </button>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-3">
          <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Writing your journal...</span>
        </div>
      )}

      {message && !loading && (
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
          <ReactMarkdown>{message}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default AiWeeklyJournal;
