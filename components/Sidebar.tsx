
import React, { useState, useEffect } from 'react';
import { View } from '../App';

const IconBase: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        {children}
    </svg>
);

const EducationIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></IconBase>;
const HealthIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></IconBase>;
const AgricultureIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c2.236.447 4.53.224 6.121-.879 1.591-1.103 2.879-3.121 2.879-3.121 0 0-2.018 1.288-3.121 2.879C13.776 10.47 13.553 12.764 14 15c1 2 2.657 1.657 2.657 1.657z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121C11.121 17.364 12 18.5 12 18.5s.879-1.136 2.121-2.379C15.364 14.879 16.5 14 16.5 14s-1.136-.879-2.379-2.121C12.879 10.636 12 9.5 12 9.5s-.879 1.136-2.121 2.379C8.636 13.121 7.5 14 7.5 14s1.136.879 2.379 2.121z"></path></IconBase>;
const WaterIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2.655v18.69m-4-11.383c0-3.313 4-9.308 4-9.308s4 5.995 4 9.308a4 4 0 1 1-8 0z"></path></IconBase>;
const IncomeIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M12 6h.01M12 21a9 9 0 110-18 9 9 0 010 18z"></path></IconBase>;
const LocalAdminIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6"></path></IconBase>;
const SecurityIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></IconBase>;
const WomensSectorIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 016-5.197M15 21a6 6 0 00-9-5.197"></path></IconBase>;
const SocialDevIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 016-5.197M15 21a6 6 0 00-9-5.197" /></IconBase>;
const PredictiveAnalysisIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></IconBase>;
const DatabaseIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m-16 5c0 2.21 3.582 4 8 4s8-1.79-8-4"></path></IconBase>;

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  viewName: View;
  icon: React.ReactNode;
  text: string;
  activeView: View;
  setActiveView: (view: View) => void;
  setIsOpen: (isOpen: boolean) => void;
  isSubItem?: boolean;
}> = ({ viewName, icon, text, activeView, setActiveView, setIsOpen, isSubItem = false }) => (
  <button
    onClick={() => {
        setActiveView(viewName);
        setIsOpen(false); // Close sidebar on mobile after navigation
    }}
    className={`flex items-center w-full text-right transition-colors duration-200 rounded-lg border shadow-sm ${isSubItem ? 'px-3 py-2 text-sm' : 'px-4 py-3'} ${
      activeView === viewName
        ? 'bg-amber-500 text-black border-amber-500'
        : isSubItem
          ? 'bg-slate-100 text-gray-600 border-slate-200 hover:border-amber-400 hover:bg-slate-200'
          : 'bg-white text-gray-700 border-gray-200 hover:border-amber-400 hover:bg-gray-50'
    }`}
  >
    {icon}
    <span className="mr-4 font-medium">{text}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
  const sectoralViews: { view: View; icon: React.ReactNode; text: string }[] = [
      { view: 'education', icon: <EducationIcon />, text: 'التعليم' },
      { view: 'health', icon: <HealthIcon />, text: 'الصحة' },
      { view: 'agricultural_development', icon: <AgricultureIcon />, text: 'الزراعة' },
      { view: 'water', icon: <WaterIcon />, text: 'المياه' },
      { view: 'social_development', icon: <SocialDevIcon />, text: 'التنمية الاجتماعية' },
      { view: 'womens_development', icon: <WomensSectorIcon />, text: 'قطاع المرأة' },
      { view: 'income', icon: <IncomeIcon />, text: 'دخل الأسرة' },
      { view: 'local_administration', icon: <LocalAdminIcon />, text: 'الإدارة المحلية' },
      { view: 'security', icon: <SecurityIcon />, text: 'الوضع الأمني' },
  ];

  const [isSectoralOpen, setIsSectoralOpen] = useState(sectoralViews.some(item => item.view === activeView));

  useEffect(() => {
    if (sectoralViews.some(item => item.view === activeView)) {
      setIsSectoralOpen(true);
    }
  }, [activeView]);

  return (
    <aside className={`fixed inset-y-0 right-0 w-72 flex-shrink-0 bg-white p-6 flex flex-col justify-between shadow-lg transform transition-transform duration-300 ease-in-out z-30 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div>
        <div className="text-center mb-8">
           <img 
            src="https://moi.gov.jo/EBV4.0/Root_Storage/AR/EB_Info_Page/MOI_logo.jpg"
            alt="شعار وزارة الداخلية الأردنية"
            className="h-20 w-auto mx-auto mb-3"
           />
            <h1 className="font-semibold text-gray-900 text-base leading-snug">
              منظومة التحليل التنموي المعززة بالذكاء الاصطناعي لمحافظات المملكة الأردنية الهاشمية
            </h1>
            <p className="text-sm text-gray-700 mt-2">وزارة الداخلية الأردنية</p>
        </div>
        <nav className="space-y-2">
          <NavItem 
            viewName="dashboard"
            icon={<svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>}
            text="الصفحة الرئيسية"
            activeView={activeView}
            setActiveView={setActiveView}
            setIsOpen={setIsOpen}
          />
          <NavItem 
            viewName="reports"
            icon={<svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
            text="تقارير المحافظات"
            activeView={activeView}
            setActiveView={setActiveView}
            setIsOpen={setIsOpen}
          />
          <NavItem 
            viewName="local_development_index"
            icon={<svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>}
            text="مؤشر التنمية المحلية"
            activeView={activeView}
            setActiveView={setActiveView}
            setIsOpen={setIsOpen}
          />

          <div>
            <button 
                onClick={() => setIsSectoralOpen(!isSectoralOpen)}
                className="flex items-center justify-between w-full px-4 py-3 text-right transition-colors duration-200 rounded-lg border shadow-sm bg-white text-gray-700 border-gray-200 hover:border-amber-400 hover:bg-gray-50"
            >
                <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                    <span className="font-medium">تقارير قطاعية</span>
                </div>
                <svg className={`w-4 h-4 transition-transform ${isSectoralOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isSectoralOpen && (
                <div className="mt-2 space-y-2 mr-4 border-r-2 border-gray-200 pl-2">
                    {sectoralViews.map(item => (
                        <NavItem 
                            key={item.view}
                            viewName={item.view}
                            icon={item.icon}
                            text={item.text}
                            activeView={activeView}
                            setActiveView={setActiveView}
                            setIsOpen={setIsOpen}
                            isSubItem
                        />
                    ))}
                </div>
            )}
          </div>
          
          <NavItem 
            viewName="development_plan"
            icon={<svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-.553-.894L15 2m-6 5l6-3m0 0l6 3m-6-3v10"></path></svg>}
            text="التحليل المقارن"
            activeView={activeView}
            setActiveView={setActiveView}
            setIsOpen={setIsOpen}
          />
          <NavItem 
            viewName="predictive_analysis"
            icon={<PredictiveAnalysisIcon />}
            text="التحليل التنبؤي"
            activeView={activeView}
            setActiveView={setActiveView}
            setIsOpen={setIsOpen}
          />
          <NavItem 
            viewName="data_sources"
            icon={<DatabaseIcon />}
            text="مصادر البيانات"
            activeView={activeView}
            setActiveView={setActiveView}
            setIsOpen={setIsOpen}
          />
        </nav>
      </div>
      <div className="mt-auto">
        <NavItem 
          viewName="chatbot"
          icon={<svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>}
          text="المساعد الذكي"
          activeView={activeView}
          setActiveView={setActiveView}
          setIsOpen={setIsOpen}
        />
        <div className="mt-6 text-center px-2">
            <p className="text-xs text-gray-700 leading-relaxed">
                © 2025 وزارة الداخلية - مديرية التنمية المحلية. جميع الحقوق محفوظة
            </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
