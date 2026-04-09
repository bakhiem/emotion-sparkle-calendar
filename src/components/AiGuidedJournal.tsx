import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MoodEntry, TaskEntry, getDateKey } from '@/lib/moodStore';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';
import { BookHeart, Send, Sparkles, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface AiGuidedJournalProps {
  moods: MoodEntry[];
  tasks: TaskEntry[];
}

type Phase = 'idle' | 'loading-questions' | 'answering' | 'loading-summary' | 'done';

const AiGuidedJournal = ({ moods, tasks }: AiGuidedJournalProps) => {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [phase, setPhase] = useState<Phase>('idle');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [summary, setSummary] = useState<string | null>(null);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return getDateKey(d);
  });
  const weekMoods = moods
    .filter(m => last7.includes(m.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(m => ({ date: m.date, mood: m.mood }));
  const weekTasks = tasks
    .filter(t => last7.includes(t.date))
    .map(t => ({ date: t.date, text: t.text, done: t.completed }));

  if (weekMoods.length === 0) return null;

  const startJournal = async () => {
    setPhase('loading-questions');
    try {
      const { data, error } = await supabase.functions.invoke('mood-insights', {
        body: { type: 'journal-questions', lang, moods: weekMoods, tasks: weekTasks },
      });
      if (error) throw error;
      setQuestions(data.questions);
      setAnswers([]);
      setCurrentIdx(0);
      setCurrentAnswer('');
      setPhase('answering');
    } catch (e) {
      console.error('Journal questions error:', e);
      toast.error(t('journal.errorQ'));
      setPhase('idle');
    }
  };

  const submitAnswer = () => {
    if (!currentAnswer.trim()) return;
    const newAnswers = [...answers, currentAnswer.trim()];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      generateSummary(newAnswers);
    }
  };

  const generateSummary = async (finalAnswers: string[]) => {
    setPhase('loading-summary');
    const qaPairs = questions.map((q, i) => ({ question: q, answer: finalAnswers[i] || '' }));

    try {
      const { data, error } = await supabase.functions.invoke('mood-insights', {
        body: { type: 'journal-summary', lang, moods: weekMoods, answers: qaPairs },
      });
      if (error) throw error;
      setSummary(data.message);
      setPhase('done');

      if (user) {
        await supabase.from('journal_entries').insert({
          user_id: user.id,
          date: getDateKey(new Date()),
          questions: questions as any,
          answers: finalAnswers as any,
          summary: data.message,
        });
      }
    } catch (e) {
      console.error('Journal summary error:', e);
      toast.error(t('journal.errorS'));
      setPhase('answering');
    }
  };

  const reset = () => {
    setPhase('idle');
    setQuestions([]);
    setAnswers([]);
    setSummary(null);
    setCurrentIdx(0);
    setCurrentAnswer('');
  };

  return (
    <div className="nature-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <BookHeart className="w-5 h-5 text-secondary" />
          {t('journal.title')}
        </h3>
        {phase !== 'idle' && (
          <button onClick={reset} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {phase === 'idle' && (
        <button
          onClick={startJournal}
          className="w-full py-3 rounded-xl bg-secondary/10 text-secondary text-sm font-semibold hover:bg-secondary/20 transition-colors"
        >
          {t('journal.start')}
        </button>
      )}

      {phase === 'loading-questions' && (
        <div className="flex items-center gap-2 py-4">
          <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">{t('journal.loadingQ')}</span>
        </div>
      )}

      {phase === 'answering' && questions.length > 0 && (
        <div className="space-y-3">
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= currentIdx ? 'bg-secondary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {answers.map((ans, i) => (
            <div key={i} className="space-y-1">
              <p className="text-xs text-muted-foreground">{questions[i]}</p>
              <p className="text-sm text-foreground bg-muted/50 rounded-lg px-3 py-2">{ans}</p>
            </div>
          ))}

          <div className="bg-secondary/5 rounded-xl p-3 border border-secondary/15">
            <p className="text-sm font-medium text-foreground mb-2">{questions[currentIdx]}</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentAnswer}
                onChange={e => setCurrentAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitAnswer()}
                placeholder={t('journal.placeholder')}
                className="flex-1 text-sm bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
              <button
                onClick={submitAnswer}
                disabled={!currentAnswer.trim()}
                className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'loading-summary' && (
        <div className="flex items-center gap-2 py-4">
          <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">{t('journal.loadingS')}</span>
        </div>
      )}

      {phase === 'done' && summary && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-secondary font-semibold uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            {t('journal.yourJournal')}
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed bg-secondary/5 rounded-xl p-4 border border-secondary/15">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiGuidedJournal;
