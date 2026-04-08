import { useState, useCallback, useEffect } from 'react';
import MoodCalendar from '@/components/MoodCalendar';
import DailyTasks from '@/components/DailyTasks';
import MoodAnalytics from '@/components/MoodAnalytics';
import MoodCheckInDialog from '@/components/MoodCheckInDialog';
import AiDailyCoach from '@/components/AiDailyCoach';
import AiTrendAnalysis from '@/components/AiTrendAnalysis';
import AiGuidedJournal from '@/components/AiGuidedJournal';
import SettingsPage from '@/components/SettingsPage';
import BottomTabs, { TabType } from '@/components/BottomTabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  MoodEntry, MoodType, TaskEntry,
  getDateKey, loadMoods, saveMood, loadTasks, saveTasks,
} from '@/lib/moodStore';

const Index = () => {
  const today = getDateKey(new Date());
  const { user } = useAuth();
  const [moods, setMoods] = useState<MoodEntry[]>(loadMoods);
  const [tasks, setTasks] = useState<TaskEntry[]>(loadTasks);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [checkInOpen, setCheckInOpen] = useState(false);
  const todayMood = moods.find(m => m.date === today)?.mood;
  const todayTasks = tasks.filter(t => t.date === today);

  useEffect(() => {
    if (!todayMood) setCheckInOpen(true);
  }, []);

  useEffect(() => {
    if (!user || activeTab !== 'home') return;
    const populateDefaults = async () => {
      const { data: defaults } = await supabase.from('default_tasks')
        .select('text').eq('user_id', user.id);
      if (!defaults || defaults.length === 0) return;
      setTasks(prev => {
        const todayExisting = prev.filter(t => t.date === today);
        const existingTexts = new Set(todayExisting.map(t => t.text));
        const newTasks: TaskEntry[] = defaults
          .filter(d => !existingTexts.has(d.text))
          .map(d => ({ id: crypto.randomUUID(), date: today, text: d.text, completed: false }));
        if (newTasks.length > 0) {
          const updated = [...prev, ...newTasks];
          saveTasks(updated);
          return updated;
        }
        return prev;
      });
    };
    populateDefaults();
  }, [user, today, activeTab]);

  const handleMoodSelect = useCallback((mood: MoodType) => {
    const updated = saveMood({ date: today, mood });
    setMoods(updated);
  }, [today]);

  const handleToggleTask = useCallback((id: string) => {
    setTasks(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      saveTasks(updated);
      return updated;
    });
  }, []);

  const handleAddTask = useCallback((text: string) => {
    setTasks(prev => {
      const newTask: TaskEntry = { id: crypto.randomUUID(), date: today, text, completed: false };
      const updated = [...prev, newTask];
      saveTasks(updated);
      return updated;
    });
  }, [today]);

  const handleTodayClick = useCallback(() => setCheckInOpen(true), []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning ☀️';
    if (h < 18) return 'Good afternoon 🌤️';
    return 'Good evening 🌙';
  })();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div className="text-center py-3">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">🌿 MoodFlow</h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            {greeting} — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {activeTab === 'home' && (
          <>
            <MoodCalendar moods={moods} onTodayClick={handleTodayClick} />
            <AiDailyCoach todayMood={todayMood} moods={moods} todayTasks={todayTasks} />
            <DailyTasks tasks={todayTasks} onToggle={handleToggleTask} onAdd={handleAddTask} />
          </>
        )}

        {activeTab === 'insights' && (
          <>
            <MoodAnalytics moods={moods} />
            <AiTrendAnalysis moods={moods} />
            <AiGuidedJournal moods={moods} tasks={tasks} />
          </>
        )}

        {activeTab === 'settings' && <SettingsPage />}
      </div>

      <MoodCheckInDialog
        open={checkInOpen}
        onOpenChange={setCheckInOpen}
        selected={todayMood}
        onSelect={handleMoodSelect}
      />

      <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
