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
      {/* Colorful background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-[400px] h-[400px] rounded-full bg-secondary/8 blur-3xl" />
      </div>

      <div className="relative max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent gradient-hero">MoodFlow</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2 font-semibold">
            {greeting} — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <MoodPicker selected={todayMood} onSelect={handleMoodSelect} />
        <DailyTasks tasks={todayTasks} onToggle={handleToggleTask} onAdd={handleAddTask} />
        <MoodCalendar moods={moods} />
        <MoodAnalytics moods={moods} />
      </div>
    </div>
  );
};

export default Index;
