import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Language = 'vi' | 'en';

const LANG_KEY = 'moodflow-lang';

const translations = {
  // Greetings
  'greeting.morning': { vi: 'Chào buổi sáng ☀️', en: 'Good morning ☀️' },
  'greeting.afternoon': { vi: 'Chào buổi chiều 🌤️', en: 'Good afternoon 🌤️' },
  'greeting.evening': { vi: 'Chào buổi tối 🌙', en: 'Good evening 🌙' },

  // Bottom tabs
  'tab.home': { vi: 'Trang chủ', en: 'Home' },
  'tab.insights': { vi: 'Phân tích', en: 'Insights' },
  'tab.settings': { vi: 'Cài đặt', en: 'Settings' },

  // Mood labels
  'mood.great': { vi: 'Tuyệt', en: 'Great' },
  'mood.good': { vi: 'Tốt', en: 'Good' },
  'mood.okay': { vi: 'Ổn', en: 'Okay' },
  'mood.bad': { vi: 'Tệ', en: 'Bad' },
  'mood.awful': { vi: 'Rất tệ', en: 'Awful' },

  // Mood check-in dialog
  'checkin.title': { vi: 'Bạn cảm thấy thế nào? 🌿', en: 'How are you feeling? 🌿' },
  'checkin.subtitle': { vi: 'Hít thở và chọn cảm xúc phù hợp nhé', en: 'Take a breath and tap what feels right' },
  'checkin.feeling': { vi: 'Hôm nay cảm thấy {mood} 🍃', en: 'Feeling {mood} today 🍃' },

  // Daily tasks
  'tasks.title': { vi: 'Nhiệm vụ hôm nay', en: "Today's Tasks" },
  'tasks.empty': { vi: 'Chưa có nhiệm vụ — thêm một cái nhé 🌱', en: 'No tasks yet — plant one below 🌱' },
  'tasks.placeholder': { vi: 'Thêm nhiệm vụ...', en: 'Add a task...' },

  // Calendar
  'calendar.days': {
    vi: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },

  // AI Daily Coach
  'coach.title': { vi: 'Huấn luyện viên', en: 'Daily Coach' },
  'coach.loading': { vi: 'Đang suy nghĩ cho bạn...', en: 'Thinking for you...' },
  'coach.challenge': { vi: 'Thử thách hôm nay', en: "Today's Challenge" },
  'coach.cta': { vi: '✨ Nhận lời khuyên hôm nay', en: '✨ Get today\'s advice' },
  'coach.rateLimit': { vi: 'Đang bận quá, thử lại sau nhé!', en: 'Too busy, try again later!' },
  'coach.noCredits': { vi: 'Hết credits rồi, liên hệ admin nhé.', en: 'Out of credits, contact admin.' },

  // AI Guided Journal
  'journal.title': { vi: 'Nhật ký cảm xúc', en: 'Emotion Journal' },
  'journal.start': { vi: '📝 Bắt đầu viết nhật ký tuần này', en: '📝 Start this week\'s journal' },
  'journal.loadingQ': { vi: 'AI đang chuẩn bị câu hỏi...', en: 'AI is preparing questions...' },
  'journal.placeholder': { vi: 'Viết câu trả lời...', en: 'Write your answer...' },
  'journal.loadingS': { vi: 'AI đang viết nhật ký cho bạn...', en: 'AI is writing your journal...' },
  'journal.yourJournal': { vi: 'Nhật ký của bạn', en: 'Your Journal' },
  'journal.errorQ': { vi: 'Không tải được câu hỏi, thử lại nhé.', en: "Couldn't load questions, try again." },
  'journal.errorS': { vi: 'Không tạo được tóm tắt.', en: "Couldn't generate summary." },

  // AI Trend Analysis
  'trend.title': { vi: 'Phân tích AI', en: 'AI Mood Analysis' },
  'trend.cta': { vi: '✨ Phân tích cảm xúc của tôi', en: '✨ Analyze my mood patterns' },
  'trend.loading': { vi: 'Đang phân tích...', en: 'Analyzing your patterns...' },
  'trend.error': { vi: 'Không phân tích được, thử lại sau.', en: "Couldn't analyze right now. Try again later." },

  // Mood Analytics
  'analytics.title': { vi: 'Phân tích cảm xúc', en: 'Mood Insights' },
  'analytics.empty': { vi: 'Bắt đầu check-in để xem phân tích 🌻', en: 'Start checking in to see your insights 🌻' },
  'analytics.streak': { vi: 'Chuỗi ngày', en: 'Day Streak' },
  'analytics.thisMonth': { vi: 'Tháng này', en: 'This Month' },
  'analytics.weekAvg': { vi: 'TB tuần', en: 'Week Avg' },
  'analytics.topMood': { vi: 'Mood chính', en: 'Top Mood' },
  'analytics.weeklyTrend': { vi: 'Xu hướng tuần', en: 'Weekly Trend' },
  'analytics.trendUp': { vi: 'Cảm xúc đang tốt lên! 🌱', en: 'Your mood is trending up! 🌱' },
  'analytics.trendDown': { vi: 'Cảm xúc hơi xuống tuần này 🍂', en: 'Your mood dipped a bit this week 🍂' },
  'analytics.trendSteady': { vi: 'Cảm xúc ổn định 🌿', en: 'Your mood is holding steady 🌿' },
  'analytics.vsLastWeek': { vi: 'so với tuần trước', en: 'vs last week' },
  'analytics.moodByDay': { vi: 'Mood theo ngày', en: 'Mood by Day' },
  'analytics.best': { vi: 'Tốt nhất', en: 'Best' },
  'analytics.lowest': { vi: 'Thấp nhất', en: 'Lowest' },
  'analytics.distribution': { vi: 'Phân bố cảm xúc', en: 'Mood Distribution' },
  'analytics.totalCheckins': { vi: '{n} lần check-in 🌸', en: '{n} total check-ins 🌸' },

  // Settings
  'settings.signInTitle': { vi: 'Đăng nhập để đồng bộ', en: 'Sign In to Sync' },
  'settings.signInDesc': { vi: 'Lưu moods & tasks trên nhiều thiết bị 🌿', en: 'Save your moods & tasks across devices 🌿' },
  'settings.google': { vi: 'Tiếp tục với Google', en: 'Continue with Google' },
  'settings.apple': { vi: 'Tiếp tục với Apple', en: 'Continue with Apple' },
  'settings.signInError': { vi: 'Đăng nhập thất bại, thử lại nhé.', en: 'Sign in failed. Please try again.' },
  'settings.defaultTasks': { vi: 'Nhiệm vụ mặc định', en: 'Default Daily Tasks' },
  'settings.defaultTasksDesc': { vi: 'Tự động thêm mỗi ngày 🌻', en: 'These tasks auto-populate every day 🌻' },
  'settings.noDefaultTasks': { vi: 'Chưa có nhiệm vụ mặc định', en: 'No default tasks yet' },
  'settings.taskPlaceholder': { vi: 'VD: Học tiếng Anh 📚', en: 'e.g. Learn English 📚' },
  'settings.taskAdded': { vi: 'Đã thêm nhiệm vụ 🌱', en: 'Default task added 🌱' },
  'settings.taskAddError': { vi: 'Thêm thất bại', en: 'Failed to add task' },
  'settings.taskRemoved': { vi: 'Đã xóa', en: 'Task removed' },
  'settings.signOut': { vi: 'Đăng xuất', en: 'Sign Out' },
  'settings.language': { vi: 'Ngôn ngữ', en: 'Language' },
  'settings.langVi': { vi: 'Tiếng Việt', en: 'Vietnamese' },
  'settings.langEn': { vi: 'English', en: 'English' },
} as const;

type TranslationKey = keyof typeof translations;

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  tArray: (key: TranslationKey) => string[];
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      return (saved === 'en' || saved === 'vi') ? saved : 'vi';
    } catch { return 'vi'; }
  });

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
  }, []);

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    const val = translations[key]?.[lang];
    if (Array.isArray(val)) return val.join(', ');
    let str = (val as string) || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  }, [lang]);

  const tArray = useCallback((key: TranslationKey): string[] => {
    const val = translations[key]?.[lang];
    return Array.isArray(val) ? val : [];
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, tArray }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};
