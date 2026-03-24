import { useState, useCallback } from 'react';
import MoodPicker from '@/components/MoodPicker';
import MoodCalendar from '@/components/MoodCalendar';
import DailyTasks from '@/components/DailyTasks';
import MoodAnalytics from '@/components/MoodAnalytics';
import {
  MoodEntry, MoodType, TaskEntry,
  getDateKey, loadMoods, saveMood, loadTasks, saveTasks,
} from '@/lib/moodStore';

const Index = () => {
  const today = getDateKey(new Date());
  const [moods, setMoods] = useState<MoodEntry[]>(loadMoods);
  const [tasks, setTasks] = useState<TaskEntry[]>(loadTasks);

  const todayMood = moods.find(m => m.date === today)?.mood;
  const todayTasks = tasks.filter(t => t.date === today);

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

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Soft decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pastel-pink opacity-40 blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-72 h-72 rounded-full pastel-lavender opacity-30 blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 w-56 h-56 rounded-full pastel-mint opacity-35 blur-3xl" />
        <div className="absolute top-1/4 right-1/3 w-48 h-48 rounded-full pastel-lemon opacity-25 blur-3xl" />
      </div>

      <div className="relative max-w-md mx-auto px-4 py-8 space-y-5">
        {/* Header */}
        <div className="text-center py-3">
          <div className="inline-block mb-2">
            <span className="text-5xl">🐱</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight" style={{ fontFamily: "'Baloo 2', cursive" }}>
            MoodFlow
          </h1>
          <p className="text-muted-foreground text-xs mt-1 font-semibold">
            {greeting} ♡ {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>

        <MoodPicker selected={todayMood} onSelect={handleMoodSelect} />
        <DailyTasks tasks={todayTasks} onToggle={handleToggleTask} onAdd={handleAddTask} />
        <MoodCalendar moods={moods} />
        <MoodAnalytics moods={moods} />

        <div className="text-center pb-4">
          <p className="text-xs text-muted-foreground/60 font-medium">made with ♡ for you</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
