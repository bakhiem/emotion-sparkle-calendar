import { MOODS, MoodType } from '@/lib/moodStore';
import { MOOD_IMAGES } from '@/lib/moodImages';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const MOOD_RING: Record<MoodType, string> = {
  great: 'ring-mood-great/50 bg-mood-great/10',
  good: 'ring-mood-good/50 bg-mood-good/10',
  okay: 'ring-mood-okay/50 bg-mood-okay/10',
  bad: 'ring-mood-bad/50 bg-mood-bad/10',
  awful: 'ring-mood-awful/50 bg-mood-awful/10',
};

interface MoodCheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected?: MoodType;
  onSelect: (mood: MoodType) => void;
}

const MoodCheckInDialog = ({ open, onOpenChange, selected, onSelect }: MoodCheckInDialogProps) => {
  const handleSelect = (mood: MoodType) => {
    onSelect(mood);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border-border/40 bg-card p-8">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold text-foreground">
            How are you feeling? 🌿
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Take a breath and tap what feels right
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-3 mt-4">
          {MOODS.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => handleSelect(type)}
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
          <div className="mt-2 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-sm font-semibold text-primary">
              Feeling {selected} today 🍃
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MoodCheckInDialog;
