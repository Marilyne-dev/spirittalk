import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showSubtitle?: boolean;
}

export default function SpiritTalkLogo({ className = "", size = 64, showSubtitle = false }: LogoProps) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* Primary Logo: logo.png from the public folder, with fallback to the high-quality SVG */}
      {!imageError ? (
        <img
          src="/logo.png"
          alt="SpiritTalk Logo"
          style={{ width: `${size}px`, height: `${size}px` }}
          className="transition-transform duration-500 hover:scale-105 object-contain"
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-500 hover:scale-105"
        >
          {/* Golden Halo / Sun Arc above the head */}
          <path
            d="M102 46 C112 43, 126 48, 131 56"
            stroke="#D4A373"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* The Dove Body and Wings (Deep Indigo/Slate Blue) */}
          <path
            d="M141 83 
               C135 80, 122 75, 115 72 
               C110 65, 108 55, 114 47 
               C112 49, 107 53, 106 58 
               C104 63, 106 67, 104 70 
               C98 70, 93 68, 88 64 
               C84 59, 81 50, 83 40 
               C81 44, 78 50, 78 57 
               C78 64, 82 72, 80 77 
               C75 77, 71 74, 67 71 
               C62 65, 59 55, 60 44 
               C57 49, 54 57, 56 65 
               C57 74, 62 82, 59 89 
               C57 91, 55 92, 53 93
               C65 106, 85 110, 102 110
               C98 122, 90 134, 82 144
               C87 146, 92 144, 98 138
               C108 128, 116 116, 122 105
               C128 98, 137 92, 141 83 Z"
            fill="#1D3557"
            className="dark:fill-[#c9eada]"
          />

          {/* Small White Eye for the Dove */}
          <circle cx="121" cy="62" r="3" fill="white" className="dark:fill-[#1D3557]" />

          {/* Open Book in Gold/Bronze on the dove's chest */}
          <g transform="translate(68, 76)">
            {/* Left page */}
            <path
              d="M32 30 C18 28, 6 32, 2 34 L2 12 C6 10, 18 6, 32 8 Z"
              fill="#D4A373"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Right page */}
            <path
              d="M32 30 C46 28, 58 32, 62 34 L62 12 C58 10, 46 6, 32 8 Z"
              fill="#D4A373"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Page lines detail */}
            <path d="M8 15 C14 13.5, 22 12, 26 12.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 20 C14 18.5, 22 17, 26 17.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 25 C14 23.5, 22 22, 26 22.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

            <path d="M56 15 C50 13.5, 42 12, 38 12.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M56 20 C50 18.5, 42 17, 38 17.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M56 25 C50 23.5, 42 22, 38 22.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </svg>
      )}

      {/* Main App branding in beautiful Serif typography */}
      <h2 className="font-serif text-3xl font-bold tracking-tight text-emerald-deep dark:text-gold-bright mt-2">
        SpiritTalk
      </h2>
      {showSubtitle && (
        <p className="text-[11px] font-sans text-slate-500 dark:text-cream-base/60 uppercase tracking-widest font-bold mt-1 max-w-[280px]">
          Dialogues Sacrés & Sagesse Connectée
        </p>
      )}
    </div>
  );
}
