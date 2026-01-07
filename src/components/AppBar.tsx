import { Flame, Languages, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface AppBarProps {
  title: string;
  subtitle?: string;
  theme?: 'rice' | 'sugarcane';
  bgColor?: string;
}

export function AppBar({ title, subtitle, theme = 'rice', bgColor }: AppBarProps) {
  const { language, setLanguage, t } = useLanguage();
  const { signOut } = useAuth();
  
  const pageGradientClass = theme === 'rice' 
    ? 'bg-gradient-to-r from-amber-500 to-yellow-500' 
    : 'bg-gradient-to-r from-emerald-500 to-green-500';
  
  const toggleLanguage = () => {
    setLanguage(language === 'th' ? 'en' : 'th');
  };

  const handleLogout = async () => {
    if (confirm(language === 'th' ? 'คุณต้องการออกจากระบบหรือไม่?' : 'Are you sure you want to logout?')) {
      await signOut();
    }
  };
  
  return (
    <header className="safe-area-top shadow-xl">
      {/* Main Header - Dark Professional Color */}
      <div className={bgColor || "bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-4 py-4 border-b border-white/10"}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-red-600 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl border border-orange-400/30">
              <Flame className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg drop-shadow-lg">{title}</h1>
              {subtitle && <p className="text-slate-300 text-xs font-medium">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 bg-blue-500/25 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-blue-400/30 hover:bg-blue-500/35 transition-colors active:scale-95"
            >
              <Languages className="w-4 h-4 text-blue-300" />
              <span className="text-sm text-blue-100 font-medium uppercase">{language}</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-500/25 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-red-400/30 hover:bg-red-500/35 transition-colors active:scale-95"
              title={language === 'th' ? 'ออกจากระบบ' : 'Logout'}
            >
              <LogOut className="w-4 h-4 text-red-300" />
              <span className="text-sm text-red-100 font-medium hidden sm:inline">
                {language === 'th' ? 'ออก' : 'Out'}
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Page Title - Theme Color */}
      {!bgColor && (
        <div className={`${pageGradientClass} px-4 py-3 shadow-lg`}>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/30 shadow-inner">
            <h2 className="text-white text-center font-bold drop-shadow-md">{title}</h2>
          </div>
        </div>
      )}
    </header>
  );
}