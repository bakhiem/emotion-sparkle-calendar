import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MoodEntry, MoodType, getDateKey } from '@/lib/moodStore';
import { Sparkles, RefreshCw } from 'lucide-react';

interface AiActivitySuggestionsProps {
  todayMood?: MoodType;
  moods: MoodEntry[];
}

const AiActivitySuggestions = ({ todayMood, moods }: AiActivitySuggestionsProps) => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastMood, setLastMood] = useState<MoodType | undefined>();

  const fetchSuggestion = async () => {
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
      console.error('AI suggestion error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (todayMood && todayMood !== lastMood) {
      fetchSuggestion();
    }
  }, [todayMood]);

  if (!todayMood) return null;

  return (
    <div className="nature-card flex items-center gap-3">
      <Sparkles className="w-4 h-4 text-accent shrink-0" />
      {loading ? (
        <span className="text-sm text-muted-foreground italic">Thinking...</span>
      ) : message ? (
        <p className="text-sm text-foreground leading-snug flex-1">{message}</p>
      ) : (
        <span className="text-sm text-muted-foreground">Tap to get a suggestion</span>
      )}
      <button
        onClick={fetchSuggestion}
        disabled={loading}
        className="p-1 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 shrink-0"
      >
        <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

export default AiActivitySuggestions;
