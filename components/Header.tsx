import React from 'react';
import Logo from './Logo';

interface HeaderProps {
    setIsSidebarOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsSidebarOpen }) => {
    return (
        <header className="flex-shrink-0 bg-gray-900 text-white p-2 flex items-center justify-between shadow-md z-10 no-print">
            {/* Right Side */}
            <div className="flex items-center gap-4">
                <button
                    className="p-2 text-gray-300 md:hidden"
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open navigation menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <div className="flex items-center gap-3">
                    <Logo />
                    <h1 className="font-semibold text-gray-100 text-sm sm:text-lg leading-tight">
                        منظومة التحليل التنموي المعززة بالذكاء الاصطناعي
                    </h1>
                </div>
            </div>

            {/* Left Side (empty for now, but keeping the container for future use) */}
            <div className="flex items-center gap-4">
                {/* Future icons or controls can go here */}
            </div>
        </header>
    );
};

export default Header;