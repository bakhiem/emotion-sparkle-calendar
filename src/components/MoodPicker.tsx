import { MOODS, MoodType } from '@/lib/moodStore';

interface MoodPickerProps {
  selected?: MoodType;
  onSelect: (mood: MoodType) => void;
}

const MoodPicker = ({ selected, onSelect }: MoodPickerProps) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h2 className="text-lg font-bold text-foreground mb-1">How are you feeling today?</h2>
      <p className="text-sm text-muted-foreground mb-5">Tap an emoji to check in</p>
      <div className="flex justify-center gap-3">
        {MOODS.map(({ type, emoji, label }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all duration-200 ${
              selected === type
                ? 'bg-primary/15 scale-110 animate-mood-pop'
                : 'hover:bg-accent hover:scale-105'
            }`}
          >
            <span className="text-4xl">{emoji}</span>
            <span className={`text-xs font-semibold ${
              selected === type ? 'text-primary' : 'text-muted-foreground'
            }`}>{label}</span>
          </button>
        ))}
      </div>
      {selected && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          You're feeling <span className="font-bold text-foreground">{selected}</span> today ✨
        </p>
      )}
    </div>
  );
};

export default MoodPicker;
