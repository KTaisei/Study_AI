import { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StudyInputForm } from './components/StudyInputForm';
import { StudySchedule } from './components/StudySchedule';
import { AIChat } from './components/AIChat';
import { useStudyData } from './hooks/useStudyData';

function App() {
  const [currentView, setCurrentView] = useState<'input' | 'schedule' | 'chat'>('input');
  const { 
    studyData, 
    setStudyData, 
    scheduleData, 
    generateSchedule,
    resetData
  } = useStudyData();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onReset={resetData}
        hasData={!!scheduleData}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {currentView === 'input' && (
          <StudyInputForm 
            studyData={studyData}
            onDataSubmit={(data) => {
              setStudyData(data);
              generateSchedule(data);
              setCurrentView('schedule');
            }}
          />
        )}
        
        {currentView === 'schedule' && scheduleData && (
          <StudySchedule scheduleData={scheduleData} />
        )}
        
        {currentView === 'chat' && scheduleData && (
          <AIChat studyData={studyData} scheduleData={scheduleData} />
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;