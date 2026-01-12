import { useState } from 'react';
import { RiceBurnScreen } from './components/screens/RiceBurnScreen';
import { SugarcaneBurnScreen } from './components/screens/SugarcaneBurnScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { BottomNavigation } from './components/BottomNavigation';
import Login from './components/Login';
import { SavedRecord } from './utils/storage';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type Screen = 'rice' | 'sugarcane' | 'history';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('rice');
  const [editingRecord, setEditingRecord] = useState<SavedRecord | null>(null);

  const handleScreenChange = (screen: Screen) => {
    setCurrentScreen(screen);
    setEditingRecord(null);
  };

  const startEditing = (record: SavedRecord) => {
    setEditingRecord(record);
    setCurrentScreen(record.type === 'rice' ? 'rice' : 'sugarcane');
  };

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
        {currentScreen === 'rice' && (
          <RiceBurnScreen
            editingRecord={editingRecord}
            onSaveSuccess={() => handleScreenChange('history')}
          />
        )}
        {currentScreen === 'sugarcane' && (
          <SugarcaneBurnScreen
            editingRecord={editingRecord}
            onSaveSuccess={() => handleScreenChange('history')}
          />
        )}
        {currentScreen === 'history' && (
          <HistoryScreen
            onEditRecord={startEditing}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentScreen={currentScreen} onScreenChange={handleScreenChange} />
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
