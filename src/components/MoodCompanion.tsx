import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MoodEntry, MoodType, TaskEntry, getDateKey } from '@/lib/moodStore';
import { MessageCircle, X } from 'lucide-react';

interface MoodCompanionProps {
  todayMood?: MoodType;
  moods: MoodEntry[];
  todayTasks: TaskEntry[];
}

const MoodCompanion = ({ todayMood, moods, todayTasks }: MoodCompanionProps) => {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchInsight = async () => {
    setLoading(true);
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
      const { data, error } = await supabase.functions.invoke('mood-companion', {
        body: {
          todayMood: todayMood || null,
          recentMoods,
          completedTasks,
          totalTasks: todayTasks.length,
        },
      });
      if (error) throw error;
      setMessage(data.message);
      setVisible(true);

      // Auto-hide after 10 seconds
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 10000);
    } catch (e) {
      console.error('MoodCompanion error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mood change
  useEffect(() => {
    fetchInsight();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [todayMood]);

  const toggleBubble = () => {
    if (visible) {
      setVisible(false);
    } else if (message) {
      setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 10000);
    } else {
      fetchInsight();
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
      {/* Speech bubble */}
      {visible && message && (
        <div className="relative max-w-[260px] animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className="bg-card border border-border rounded-2xl rounded-br-sm px-4 py-3 shadow-lg">
            <button
              onClick={() => setVisible(false)}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
            <p className="text-sm text-foreground leading-snug">{message}</p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={toggleBubble}
        className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
        ) : (
          <MessageCircle className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};

export default MoodCompanion;
