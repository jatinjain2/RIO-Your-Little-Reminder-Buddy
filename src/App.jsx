import React, { useState } from 'react';
import { RioProvider, useRio } from './context/RioContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { WaterTracker } from './pages/WaterTracker';
import { Reminders } from './pages/Reminders';
import { CalendarView } from './pages/CalendarView';
import { Statistics } from './pages/Statistics';
import { SettingsPage } from './pages/SettingsPage';
import { CustomMlModal } from './components/modals/CustomMlModal';
import { ReminderModal } from './components/modals/ReminderModal';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { 
    isCustomMlModalOpen, 
    setIsCustomMlModalOpen,
    isReminderModalOpen,
    setIsReminderModalOpen,
    activeEditingReminder,
    setActiveEditingReminder
  } = useRio();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-rio-soft text-rio-navy font-sans select-none">
      {/* Persistent Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onQuickAddClick={() => setIsCustomMlModalOpen(true)} />

        <main className="flex-1 overflow-y-auto px-8 pt-6">
          {activeTab === 'dashboard' && <Dashboard onNavigate={(tab) => setActiveTab(tab)} />}
          {activeTab === 'water' && <WaterTracker />}
          {activeTab === 'reminders' && <Reminders />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'statistics' && <Statistics />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Modals */}
      <CustomMlModal
        isOpen={isCustomMlModalOpen}
        onClose={() => setIsCustomMlModalOpen(false)}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setActiveEditingReminder(null);
        }}
        editingReminder={activeEditingReminder}
      />
    </div>
  );
};

export default function App() {
  return (
    <RioProvider>
      <AppContent />
    </RioProvider>
  );
}
