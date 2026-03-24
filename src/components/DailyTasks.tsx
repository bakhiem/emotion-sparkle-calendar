import { useState } from 'react';
import { TaskEntry } from '@/lib/moodStore';
import { Plus, Check, Star } from 'lucide-react';

interface DailyTasksProps {
  tasks: TaskEntry[];
  onToggle: (id: string) => void;
  onAdd: (text: string) => void;
}

const DailyTasks = ({ tasks, onToggle, onAdd }: DailyTasksProps) => {
  const [input, setInput] = useState('');
  const completed = tasks.filter(t => t.completed).length;
  const pct = tasks.length ? (completed / tasks.length) * 100 : 0;

  const handleAdd = () => {
    if (!input.trim()) return;
    onAdd(input.trim());
    setInput('');
  };

  return (
    <div className="cute-card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-extrabold text-foreground flex items-center gap-1.5" style={{ fontFamily: "'Baloo 2', cursive" }}>
          <Star className="w-4 h-4 text-secondary fill-secondary" />
          Today's Tasks
        </h2>
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
          pct === 100 && tasks.length > 0
            ? 'pastel-mint text-foreground'
            : 'bg-muted text-muted-foreground'
        }`}>
          {completed}/{tasks.length}
        </span>
      </div>

      {tasks.length > 0 && (
        <div className="w-full bg-muted rounded-full h-2 mb-3 overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-700 bg-primary"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <div className="space-y-1.5 mb-3 max-h-52 overflow-y-auto">
        {tasks.map(task => (
          <button
            key={task.id}
            onClick={() => onToggle(task.id)}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-left transition-all duration-200 ${
              task.completed
                ? 'pastel-mint/50 opacity-70'
                : 'bg-muted/40 hover:bg-muted/70'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              task.completed
                ? 'bg-primary border-primary'
                : 'border-border'
            }`}>
              {task.completed && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            <span className={`text-xs font-semibold ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.text}
            </span>
          </button>
        ))}
        {tasks.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-5">no tasks yet~ add one! 📝</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="what to do today~"
          className="flex-1 px-3 py-2 rounded-2xl bg-muted/50 border-2 border-border/50 text-xs font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors"
        />
        <button
          onClick={handleAdd}
          className="p-2 rounded-2xl bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DailyTasks;
