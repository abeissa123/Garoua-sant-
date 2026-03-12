import React from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "w-10 h-10" }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Fond avec dégradé émeraude et coins arrondis (style icône d'app) */}
      <rect width="100" height="100" rx="28" fill="url(#grad_green)" />
      
      {/* Marqueur de carte (Map Pin) blanc */}
      <path 
        d="M50 22C37.2975 22 27 32.2975 27 45C27 62.5 50 82 50 82C50 82 73 62.5 73 45C73 32.2975 62.7025 22 50 22Z" 
        fill="white" 
        style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }}
      />
      
      {/* Croix médicale verte à l'intérieur du marqueur */}
      <rect x="45" y="34" width="10" height="22" rx="2" fill="#10B981" />
      <rect x="39" y="40" width="22" height="10" rx="2" fill="#10B981" />
      
      <defs>
        <linearGradient id="grad_green" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" /> {/* emerald-400 */}
          <stop offset="1" stopColor="#059669" /> {/* emerald-600 */}
        </linearGradient>
      </defs>
    </svg>
  );
}
