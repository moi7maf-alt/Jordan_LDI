
import React from 'react';

const Logo: React.FC = () => (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="شعار المنصة">
        <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
        </defs>
        
        {/* Hexagon Background */}
        <path d="M32 2 L58 17 V47 L32 62 L6 47 V17 L32 2 Z" fill="url(#logoGradient)" opacity="0.1" stroke="url(#logoGradient)" strokeWidth="1.5"/>
        
        {/* Central Node (AI Brain) */}
        <circle cx="32" cy="32" r="6" fill="#F59E0B" />
        <circle cx="32" cy="32" r="10" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="2 2"/>

        {/* Data Points / Satellites */}
        <circle cx="32" cy="12" r="3" fill="#10B981" />
        <circle cx="14" cy="42" r="3" fill="#3B82F6" />
        <circle cx="50" cy="42" r="3" fill="#EC4899" />

        {/* Connecting Lines (Circuitry) */}
        <path d="M32 26 V15" stroke="#4B5563" strokeWidth="2" strokeLinecap="round"/>
        <path d="M26 35 L17 40" stroke="#4B5563" strokeWidth="2" strokeLinecap="round"/>
        <path d="M38 35 L47 40" stroke="#4B5563" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

export default Logo;
