export type MoodType = 'great' | 'good' | 'okay' | 'bad' | 'awful';

export interface MoodEntry {
  date: string; // YYYY-MM-DD
  mood: MoodType;
  note?: string;
}

export interface TaskEntry {
  id: string;
  date: string;
  text: string;
  completed: boolean;
}

export const MOODS: { type: MoodType; emoji: string; label: string }[] = [
  { type: 'great', emoji: '😻', label: 'Great' },
  { type: 'good', emoji: '😺', label: 'Good' },
  { type: 'okay', emoji: '🐱', label: 'Okay' },
  { type: 'bad', emoji: '🙀', label: 'Bad' },
  { type: 'awful', emoji: '😿', label: 'Awful' },
];

const MOOD_STORAGE_KEY = 'moodflow-moods';
const TASK_STORAGE_KEY = 'moodflow-tasks';

export function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function loadMoods(): MoodEntry[] {
  try {
    return JSON.parse(localStorage.getItem(MOOD_STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function saveMood(entry: MoodEntry): MoodEntry[] {
  const moods = loadMoods().filter(m => m.date !== entry.date);
  moods.push(entry);
  localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(moods));
  return moods;
}

export function loadTasks(): TaskEntry[] {
  try {
    return JSON.parse(localStorage.getItem(TASK_STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function saveTasks(tasks: TaskEntry[]): void {
  localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
}

export function getMoodForDate(moods: MoodEntry[], date: string): MoodEntry | undefined {
  return moods.find(m => m.date === date);
}
