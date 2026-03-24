import { useState } from 'react';
import { TaskEntry } from '@/lib/moodStore';
import { Plus, Check, Sparkles } from 'lucide-react';

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
    <div className="card-3d gradient-bg-2 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-secondary" />
          Today's Tasks
        </h2>
        <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${
          pct === 100 && tasks.length > 0
            ? 'bg-secondary/20 text-secondary'
            : 'bg-primary/10 text-primary'
        }`}>
          {completed}/{tasks.length}
        </span>
      </div>

      {tasks.length > 0 && (
        <div className="w-full bg-muted/60 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-700 bg-gradient-to-r from-primary via-accent to-secondary"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
        {tasks.map((task, idx) => (
          <button
            key={task.id}
            onClick={() => onToggle(task.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 ${
              task.completed
                ? 'bg-secondary/10 shadow-sm'
                : 'bg-card/80 shadow-md hover:shadow-lg hover:-translate-y-0.5'
            }`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              task.completed
                ? 'bg-gradient-to-br from-secondary to-primary border-transparent shadow-sm'
                : 'border-muted-foreground/40 hover:border-primary'
            }`}>
              {task.completed && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
            </div>
            <span className={`text-sm font-semibold ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.text}
            </span>
          </button>
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No tasks yet — add one below! ✍️</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add a task..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-card/80 border border-border/50 text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition-shadow focus:shadow-md"
        />
        <button
          onClick={handleAdd}
          className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground hover:shadow-lg hover:scale-105 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DailyTasks;
