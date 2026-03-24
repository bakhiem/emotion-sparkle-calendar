import moodGreat from '@/assets/mood-great.png';
import moodGood from '@/assets/mood-good.png';
import moodOkay from '@/assets/mood-okay.png';
import moodBad from '@/assets/mood-bad.png';
import moodAwful from '@/assets/mood-awful.png';
import { MoodType } from './moodStore';

export const MOOD_IMAGES: Record<MoodType, string> = {
  great: moodGreat,
  good: moodGood,
  okay: moodOkay,
  bad: moodBad,
  awful: moodAwful,
};
