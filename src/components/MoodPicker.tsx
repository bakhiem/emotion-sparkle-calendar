import { MOODS, MoodType } from '@/lib/moodStore';

interface MoodPickerProps {
  selected?: MoodType;
  onSelect: (mood: MoodType) => void;
}

const MOOD_BG: Record<MoodType, string> = {
  great: 'from-emerald-400/20 to-teal-400/20 ring-emerald-400/40',
  good: 'from-cyan-400/20 to-sky-400/20 ring-cyan-400/40',
  okay: 'from-amber-400/20 to-yellow-400/20 ring-amber-400/40',
  bad: 'from-orange-400/20 to-red-400/20 ring-orange-400/40',
  awful: 'from-rose-400/20 to-pink-400/20 ring-rose-400/40',
};

const MoodPicker = ({ selected, onSelect }: MoodPickerProps) => {
  return (
    <div className="card-3d gradient-bg-1 p-6">
      <h2 className="text-lg font-bold text-foreground mb-1">How are you feeling today?</h2>
      <p className="text-sm text-muted-foreground mb-5">Tap an emoji to check in</p>
      <div className="flex justify-center gap-3">
        {MOODS.map(({ type, emoji, label }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300 ${
              selected === type
                ? `bg-gradient-to-br ${MOOD_BG[type]} ring-2 scale-110 animate-mood-pop shadow-lg`
                : 'hover:bg-muted/60 hover:scale-110 hover:shadow-md'
            }`}
            style={selected === type ? { transform: 'perspective(400px) rotateY(-5deg) scale(1.1)' } : {}}
          >
            <span className="text-4xl drop-shadow-md">{emoji}</span>
            <span className={`text-xs font-bold ${
              selected === type ? 'text-foreground' : 'text-muted-foreground'
            }`}>{label}</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="mt-4 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-sm font-semibold text-primary">
            Feeling {selected} today ✨
          </span>
        </div>
      )}
    </div>
  );
};

export default MoodPicker;
