import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MoodEntry, getDateKey } from '@/lib/moodStore';
import { Brain, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AiTrendAnalysisProps {
  moods: MoodEntry[];
}

const AiTrendAnalysis = ({ moods }: AiTrendAnalysisProps) => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchAnalysis = async () => {
    if (moods.length < 3) return;
    setLoading(true);
    setError(false);

    const last14 = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return getDateKey(d);
    });

    const recentMoods = moods
      .filter(m => last14.includes(m.date))
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(m => ({ date: m.date, mood: m.mood }));

    try {
      const { data, error: fnError } = await supabase.functions.invoke('mood-insights', {
        body: { type: 'trend-analysis', moods: recentMoods, tasks: [] },
      });
      if (fnError) throw fnError;
      setMessage(data.message);
    } catch (e) {
      console.error('AI trend analysis error:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (moods.length < 3) return null;

  return (
    <div className="nature-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          AI Mood Analysis
        </h3>
        <button
          onClick={fetchAnalysis}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {!message && !loading && !error && (
        <button
          onClick={fetchAnalysis}
          className="w-full py-3 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
        >
          ✨ Analyze my mood patterns
        </button>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-3">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Analyzing your patterns...</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-muted-foreground py-2">Couldn't analyze right now. Try again later.</p>
      )}

      {message && !loading && (
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
          <ReactMarkdown>{message}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default AiTrendAnalysis;
