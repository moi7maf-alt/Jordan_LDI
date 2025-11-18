import React from 'react';

const Logo: React.FC = () => (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="شعار المنصة">
        {/* Dark background circle */}
        <circle cx="32" cy="32" r="30" fill="#1F2937"/>
        <circle cx="32" cy="32" r="30" stroke="#4B5563" strokeWidth="2"/>
        
        {/* New Abstract Pattern symbolizing data and development */}
        <g strokeLinecap="round">
            {/* Outer green arc */}
            <path d="M 52 32 A 20 20 0 1 1 32 12" stroke="#16a34a" strokeWidth="4" />
            
            {/* Inner white arc */}
            <path d="M 22 32 A 10 10 0 1 1 32 42" stroke="#FFFFFF" strokeWidth="4" />

            {/* Central red circle */}
            <circle cx="32" cy="32" r="5" fill="#dc2626"/>
        </g>
    </svg>
);

export default Logo;