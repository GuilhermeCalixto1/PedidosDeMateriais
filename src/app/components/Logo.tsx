import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  dark?: boolean;
}

export function Logo({ className = "size-10", showText = true, dark = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${!showText ? 'justify-center' : ''}`}>
      {/* MONOGRAMA S + T INTERLIGADOS */}
      <svg 
        viewBox="0 0 100 100" 
        className={className}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M35 25H65M50 25V75" 
          stroke={dark ? "#F8FAFC" : "#1E293B"} 
          strokeWidth="12" 
          strokeLinecap="round" 
        />
        <path 
          d="M70 35C70 25 30 25 30 40C30 55 70 55 70 70C70 85 30 85 30 75" 
          stroke="#F97316" 
          strokeWidth="10" 
          strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="4" fill="white" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className={`text-2xl font-black tracking-tighter leading-none uppercase ${dark ? 'text-white' : 'text-slate-900'}`}>
            Sei<span className="text-orange-500">Tools</span>
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-widest -mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            Seiton Integrated
          </span>
        </div>
      )}
    </div>
  );
}