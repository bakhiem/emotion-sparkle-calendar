import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MoodEntry, MoodType, TaskEntry, getDateKey } from '@/lib/moodStore';
import { MOOD_IMAGES } from '@/lib/moodImages';
import { Sparkles, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MoodCompanionProps {
  todayMood?: MoodType;
  moods: MoodEntry[];
  todayTasks: TaskEntry[];
}

const MoodCompanion = ({ todayMood, moods, todayTasks }: MoodCompanionProps) => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = async () => {
    setLoading(true);
    setError(null);

    const today = getDateKey(new Date());
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return getDateKey(d);
    });
    const recentMoods = moods
      .filter(m => last7.includes(m.date))
      .sort((a, b) => b.date.localeCompare(a.date));

    const completedTasks = todayTasks.filter(t => t.completed).length;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('mood-companion', {
        body: {
          todayMood: todayMood || null,
          recentMoods,
          completedTasks,
          totalTasks: todayTasks.length,
        },
      });

      if (fnError) throw fnError;
      setMessage(data.message);
    } catch (e: any) {
      console.error('MoodCompanion error:', e);
      setError('Could not load insight. Tap to retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, [todayMood]);

  if (!message && !loading && !error) return null;

  return (
    <div className="nature-card relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-accent/40 to-primary/60" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">AI Companion</h3>
        </div>
        <button
          onClick={fetchInsight}
          disabled={loading}
          className="p-2 rounded-xl hover:bg-muted/60 transition-colors active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-4">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-muted-foreground">Thinking about your mood...</span>
        </div>
      )}

      {error && (
        <button
          onClick={fetchInsight}
          className="w-full text-center py-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {error}
        </button>
      )}

      {message && !loading && (
        <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed
          prose-strong:text-foreground prose-p:my-1.5">
          <ReactMarkdown>{message}</ReactMarkdown>
        </div>
      )}

      {todayMood && !loading && (
        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-border/30">
          <img src={MOOD_IMAGES[todayMood]} alt={todayMood} className="w-6 h-6" />
          <span className="text-xs text-muted-foreground">Based on your {todayMood} mood today</span>
        </div>
      )}
    </div>
  );
};

export default MoodCompanion;
