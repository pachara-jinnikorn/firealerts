import { Wheat, Leaf, History } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BottomNavigationProps {
  currentScreen: 'rice' | 'sugarcane' | 'history';
  onScreenChange: (screen: 'rice' | 'sugarcane' | 'history') => void;
}

export function BottomNavigation({ currentScreen, onScreenChange }: BottomNavigationProps) {
  const { t } = useLanguage();
  
  return (
    <nav className="bg-white/95 backdrop-blur-lg border-t border-gray-200/50 safe-area-bottom shadow-[0_-4px_30px_rgba(0,0,0,0.1)]">
      <div className="grid grid-cols-3 px-2">
        <button
          onClick={() => onScreenChange('rice')}
          className={`flex flex-col items-center justify-center py-3 px-2 transition-all relative rounded-2xl mx-1 ${
            currentScreen === 'rice'
              ? 'text-amber-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          {currentScreen === 'rice' && (
            <div className="absolute inset-0 bg-gradient-to-t from-amber-100/80 to-amber-50/40 rounded-2xl"></div>
          )}
          <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center mb-1.5 transition-all ${
            currentScreen === 'rice' 
              ? 'bg-gradient-to-br from-amber-500 to-yellow-600 shadow-xl shadow-amber-300/50 scale-110' 
              : 'bg-gray-100'
          }`}>
            <Wheat className={`w-6 h-6 ${currentScreen === 'rice' ? 'text-white' : 'text-gray-600'}`} />
          </div>
          <span className={`relative z-10 text-xs font-medium ${currentScreen === 'rice' ? 'font-semibold' : ''}`}>{t('navRice')}</span>
          {currentScreen === 'rice' && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full shadow-lg"></div>
          )}
        </button>
        <button
          onClick={() => onScreenChange('sugarcane')}
          className={`flex flex-col items-center justify-center py-3 px-2 transition-all relative rounded-2xl mx-1 ${
            currentScreen === 'sugarcane'
              ? 'text-emerald-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          {currentScreen === 'sugarcane' && (
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-100/80 to-emerald-50/40 rounded-2xl"></div>
          )}
          <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center mb-1.5 transition-all ${
            currentScreen === 'sugarcane' 
              ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-xl shadow-emerald-300/50 scale-110' 
              : 'bg-gray-100'
          }`}>
            <Leaf className={`w-6 h-6 ${currentScreen === 'sugarcane' ? 'text-white' : 'text-gray-600'}`} />
          </div>
          <span className={`relative z-10 text-xs font-medium ${currentScreen === 'sugarcane' ? 'font-semibold' : ''}`}>{t('navSugarcane')}</span>
          {currentScreen === 'sugarcane' && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full shadow-lg"></div>
          )}
        </button>
        <button
          onClick={() => onScreenChange('history')}
          className={`flex flex-col items-center justify-center py-3 px-2 transition-all relative rounded-2xl mx-1 ${
            currentScreen === 'history'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          {currentScreen === 'history' && (
            <div className="absolute inset-0 bg-gradient-to-t from-blue-100/80 to-blue-50/40 rounded-2xl"></div>
          )}
          <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center mb-1.5 transition-all ${
            currentScreen === 'history' 
              ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl shadow-blue-300/50 scale-110' 
              : 'bg-gray-100'
          }`}>
            <History className={`w-6 h-6 ${currentScreen === 'history' ? 'text-white' : 'text-gray-600'}`} />
          </div>
          <span className={`relative z-10 text-xs font-medium ${currentScreen === 'history' ? 'font-semibold' : ''}`}>{t('navHistory')}</span>
          {currentScreen === 'history' && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full shadow-lg"></div>
          )}
        </button>
      </div>
    </nav>
  );
}