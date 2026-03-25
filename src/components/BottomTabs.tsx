import { CalendarDays, BarChart3 } from 'lucide-react';

interface BottomTabsProps {
  activeTab: 'home' | 'insights';
  onTabChange: (tab: 'home' | 'insights') => void;
}

const BottomTabs = ({ activeTab, onTabChange }: BottomTabsProps) => {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: CalendarDays },
    { id: 'insights' as const, label: 'Insights', icon: BarChart3 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 px-4 transition-all duration-200 ${
              activeTab === id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform duration-200 ${activeTab === id ? 'scale-110' : ''}`} />
            <span className="text-xs font-semibold">{label}</span>
            {activeTab === id && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomTabs;
