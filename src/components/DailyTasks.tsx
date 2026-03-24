import { useState } from 'react';
import { TaskEntry } from '@/lib/moodStore';
import { Plus, Check } from 'lucide-react';

interface DailyTasksProps {
  tasks: TaskEntry[];
  onToggle: (id: string) => void;
  onAdd: (text: string) => void;
}

const DailyTasks = ({ tasks, onToggle, onAdd }: DailyTasksProps) => {
  const [input, setInput] = useState('');
  const completed = tasks.filter(t => t.completed).length;

  const handleAdd = () => {
    if (!input.trim()) return;
    onAdd(input.trim());
    setInput('');
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Today's Tasks</h2>
        <span className="text-sm font-semibold text-primary">
          {completed}/{tasks.length}
        </span>
      </div>

      {tasks.length > 0 && (
        <div className="w-full bg-muted rounded-full h-2 mb-4">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${tasks.length ? (completed / tasks.length) * 100 : 0}%` }}
          />
        </div>
      )}

      <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
        {tasks.map(task => (
          <button
            key={task.id}
            onClick={() => onToggle(task.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-all ${
              task.completed ? 'bg-secondary/30' : 'bg-accent/50 hover:bg-accent'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              task.completed ? 'bg-primary border-primary' : 'border-muted-foreground'
            }`}>
              {task.completed && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            <span className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.text}
            </span>
          </button>
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No tasks yet — add one below!</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add a task..."
          className="flex-1 px-3 py-2 rounded-md bg-accent/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={handleAdd}
          className="p-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DailyTasks;
