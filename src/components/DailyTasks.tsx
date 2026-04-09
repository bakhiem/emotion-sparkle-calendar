import { useState } from 'react';
import { TaskEntry } from '@/lib/moodStore';
import { useI18n } from '@/lib/i18n';
import { Plus, Check, Leaf } from 'lucide-react';

interface DailyTasksProps {
  tasks: TaskEntry[];
  onToggle: (id: string) => void;
  onAdd: (text: string) => void;
}

const DailyTasks = ({ tasks, onToggle, onAdd }: DailyTasksProps) => {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const completed = tasks.filter(t => t.completed).length;
  const pct = tasks.length ? (completed / tasks.length) * 100 : 0;

  const handleAdd = () => {
    if (!input.trim()) return;
    onAdd(input.trim());
    setInput('');
  };

  return (
    <div className="nature-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Leaf className="w-5 h-5 text-primary" />
          {t('tasks.title')}
        </h2>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
          pct === 100 && tasks.length > 0
            ? 'bg-primary/15 text-primary'
            : 'bg-muted text-muted-foreground'
        }`}>
          {completed}/{tasks.length}
        </span>
      </div>

      {tasks.length > 0 && (
        <div className="w-full bg-muted rounded-full h-2.5 mb-4 overflow-hidden">
          <div
            className="h-2.5 rounded-full transition-all duration-700 bg-primary"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
        {tasks.map(task => (
          <button
            key={task.id}
            onClick={() => onToggle(task.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
              task.completed
                ? 'bg-primary/5'
                : 'bg-muted/40 hover:bg-muted/70'
            }`}
          >
            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              task.completed
                ? 'bg-primary border-primary'
                : 'border-muted-foreground/30'
            }`}>
              {task.completed && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            <span className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.text}
            </span>
          </button>
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">{t('tasks.empty')}</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder={t('tasks.placeholder')}
          className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        <button
          onClick={handleAdd}
          className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DailyTasks;
