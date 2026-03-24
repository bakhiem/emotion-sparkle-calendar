import { MOODS, MoodType } from '@/lib/moodStore';

interface MoodPickerProps {
  selected?: MoodType;
  onSelect: (mood: MoodType) => void;
}

const MOOD_PASTEL: Record<MoodType, string> = {
  great: 'bg-[hsl(160_45%_85%)] border-mood-great/40',
  good: 'bg-[hsl(200_55%_88%)] border-mood-good/40',
  okay: 'bg-[hsl(50_60%_88%)] border-mood-okay/40',
  bad: 'bg-[hsl(20_70%_88%)] border-mood-bad/40',
  awful: 'bg-[hsl(340_60%_88%)] border-mood-awful/40',
};

const MoodPicker = ({ selected, onSelect }: MoodPickerProps) => {
  return (
    <div className="cute-card">
      <p className="text-center text-sm font-bold text-foreground mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>
        How's your kitty feeling? ✨
      </p>
      <p className="text-center text-xs text-muted-foreground mb-4">pick one ~</p>
      <div className="flex justify-center gap-2">
        {MOODS.map(({ type, emoji, label }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl transition-all duration-200 border-2 ${
              selected === type
                ? `${MOOD_PASTEL[type]} scale-110 animate-mood-pop`
                : 'border-transparent hover:bg-muted/50 hover:scale-105'
            }`}
          >
            <span className="text-3xl">{emoji}</span>
            <span className={`text-[10px] font-bold ${
              selected === type ? 'text-foreground' : 'text-muted-foreground'
            }`}>{label}</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="mt-3 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-xs font-bold text-primary">
            {selected} day~ ♡
          </span>
        </div>
      )}
    </div>
  );
};

export default MoodPicker;
