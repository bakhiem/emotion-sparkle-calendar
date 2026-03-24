import { MOODS, MoodType } from '@/lib/moodStore';
import { MOOD_IMAGES } from '@/lib/moodImages';

interface MoodPickerProps {
  selected?: MoodType;
  onSelect: (mood: MoodType) => void;
}

const MOOD_RING: Record<MoodType, string> = {
  great: 'ring-mood-great/50 bg-mood-great/10',
  good: 'ring-mood-good/50 bg-mood-good/10',
  okay: 'ring-mood-okay/50 bg-mood-okay/10',
  bad: 'ring-mood-bad/50 bg-mood-bad/10',
  awful: 'ring-mood-awful/50 bg-mood-awful/10',
};

const MoodPicker = ({ selected, onSelect }: MoodPickerProps) => {
  return (
    <div className="nature-card">
      <h2 className="text-lg font-bold text-foreground mb-1">How are you feeling? 🌿</h2>
      <p className="text-sm text-muted-foreground mb-5">Take a breath and tap what feels right</p>
      <div className="flex justify-center gap-3">
        {MOODS.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300 ${
              selected === type
                ? `ring-2 ${MOOD_RING[type]} scale-110 animate-mood-pop`
                : 'hover:bg-muted/50 hover:scale-105'
            }`}
          >
            <img src={MOOD_IMAGES[type]} alt={label} width={48} height={48} className="w-12 h-12" />
            <span className={`text-xs font-semibold ${
              selected === type ? 'text-foreground' : 'text-muted-foreground'
            }`}>{label}</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="mt-4 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-sm font-semibold text-primary">
            Feeling {selected} today 🍃
          </span>
        </div>
      )}
    </div>
  );
};

export default MoodPicker;
