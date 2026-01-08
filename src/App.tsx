import { useState } from 'react';
import { RiceBurnScreen } from './components/screens/RiceBurnScreen';
import { SugarcaneBurnScreen } from './components/screens/SugarcaneBurnScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { BottomNavigation } from './components/BottomNavigation';
import Login from './components/Login';
import { storage } from './utils/storage';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type Screen = 'rice' | 'sugarcane' | 'history';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('rice');

  // Removed sample data initialization to prevent auto-creating records

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {currentScreen === 'rice' && <RiceBurnScreen />}
        {currentScreen === 'sugarcane' && <SugarcaneBurnScreen />}
        {currentScreen === 'history' && <HistoryScreen />}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
