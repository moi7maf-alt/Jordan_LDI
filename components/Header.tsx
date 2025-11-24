
import React from 'react';
import Logo from './Logo';

interface HeaderProps {
    setIsSidebarOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsSidebarOpen }) => {
    return (
        <header className="flex-shrink-0 bg-gray-900 text-white p-3 flex items-center justify-between shadow-lg z-10 no-print border-b border-gray-800">
            {/* Right Side */}
            <div className="flex items-center gap-4">
                <button
                    className="p-2 text-gray-300 md:hidden hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open navigation menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="transform group-hover:scale-105 transition-transform duration-300">
                        <Logo />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-gray-100 text-sm sm:text-base leading-tight tracking-wide">
                            منظومة التحليل التنموي
                        </h1>
                        <span className="text-[10px] sm:text-xs text-amber-400 font-medium tracking-wider">
                            AI-POWERED ANALYTICS
                        </span>
                    </div>
                </div>
            </div>

            {/* Left Side */}
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-xs text-gray-300">النظام متصل</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
