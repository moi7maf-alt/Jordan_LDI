
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import WomensDevelopment from './components/WomensDevelopment';
import Education from './components/Education';
import Health from './components/Health';
import AgriculturalDevelopment from './components/AgriculturalDevelopment';
import Income from './components/Income';
import LocalAdministration from './components/LocalAdministration';
import Security from './components/Security';
import Chatbot from './components/Chatbot';
import Reports from './components/Reports';
import DevelopmentPlan from './components/DevelopmentPlan';
import Water from './components/Water';
import LocalDevelopmentIndex from './components/LocalDevelopmentIndex';
import PredictiveAnalysis from './components/PredictiveAnalysis';
import Header from './components/Header';
import DataSources from './components/DataSources';
import SocialDevelopment from './components/SocialDevelopment';

export type View = 'dashboard' | 'womens_development' | 'education' | 'health' | 'agricultural_development' | 'income' | 'local_administration' | 'security' | 'chatbot' | 'reports' | 'development_plan' | 'water' | 'local_development_index' | 'predictive_analysis' | 'data_sources' | 'social_development';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'womens_development':
        return <WomensDevelopment />;
      case 'education':
        return <Education />;
      case 'health':
        return <Health />;
      case 'agricultural_development':
        return <AgriculturalDevelopment />;
      case 'income':
        return <Income />;
      case 'local_administration':
          return <LocalAdministration />;
      case 'security':
          return <Security />;
      case 'water':
          return <Water />;
      case 'social_development':
          return <SocialDevelopment />;
      case 'chatbot':
        return <Chatbot />;
      case 'reports':
        return <Reports />;
      case 'development_plan':
        return <DevelopmentPlan />;
      case 'local_development_index':
        return <LocalDevelopmentIndex />;
      case 'predictive_analysis':
        return <PredictiveAnalysis />;
      case 'data_sources':
        return <DataSources />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-gray-900 font-sans">
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
          <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
              onClick={() => setIsSidebarOpen(false)}
          ></div>
      )}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
            setIsSidebarOpen={setIsSidebarOpen}
        />

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-screen-2xl mx-auto w-full">
                {renderContent()}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;