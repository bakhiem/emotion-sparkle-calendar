import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MoodEntry, MoodType, getDateKey } from '@/lib/moodStore';
import { Sparkles, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AiActivitySuggestionsProps {
  todayMood?: MoodType;
  moods: MoodEntry[];
}

const AiActivitySuggestions = ({ todayMood, moods }: AiActivitySuggestionsProps) => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastMood, setLastMood] = useState<MoodType | undefined>();

  const fetchSuggestions = async () => {
    if (!todayMood) return;
    setLoading(true);

    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return getDateKey(d);
    });
    const recentPattern = moods
      .filter(m => last7.includes(m.date))
      .map(m => m.mood)
      .join(', ');

    try {
      const { data, error } = await supabase.functions.invoke('mood-insights', {
        body: {
          type: 'activity-suggestions',
          moods: { current: todayMood, recent: recentPattern || todayMood },
          tasks: [],
        },
      });
      if (error) throw error;
      setMessage(data.message);
      setLastMood(todayMood);
    } catch (e) {
      console.error('AI activity suggestions error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when mood changes
  useEffect(() => {
    if (todayMood && todayMood !== lastMood) {
      fetchSuggestions();
    }
  }, [todayMood]);

  if (!todayMood) return null;

  return (
    <div className="nature-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          For You Right Now
        </h3>
        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-3">
          <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Finding activities for you...</span>
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

export default AiActivitySuggestions;
