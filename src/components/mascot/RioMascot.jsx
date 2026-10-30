import React from 'react';

// Mascot expressions: 'happy', 'excited', 'encouraging', 'sleeping', 'celebrating', 'sad'
export const RioMascot = ({ expression = 'happy', className = 'w-24 h-24', animated = true }) => {
  return (
    <div className={`relative flex items-center justify-center ${className} ${animated ? 'transition-transform duration-300 hover:scale-105' : ''}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none" fill="none">
        {/* Droplet Body */}
        <path
          d="M50 8 C50 8 16 50 16 70 C16 87.5 31.5 96 50 96 C68.5 96 84 87.5 84 70 C84 50 50 8 50 8Z"
          fill="url(#rioMascotGradient)"
        />

        {/* Ambient Highlight */}
        <path
          d="M32 54 C32 46 38 36 45 32"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.55"
        />

        {/* Cheek Blushes */}
        {expression !== 'sleeping' && (
          <>
            <circle cx="32" cy="72" r="4.5" fill="#FFA5BA" opacity="0.75" />
            <circle cx="68" cy="72" r="4.5" fill="#FFA5BA" opacity="0.75" />
          </>
        )}

        {/* Dynamic Facial Features */}
        {expression === 'happy' && (
          <>
            {/* Happy arch eyes */}
            <path d="M36 64 Q42 56 48 64" stroke="#0A2540" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M52 64 Q58 56 64 64" stroke="#0A2540" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Gentle Smile */}
            <path d="M44 73 Q50 81 56 73" stroke="#0A2540" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          </>
        )}

        {expression === 'excited' && (
          <>
            {/* Sparkly wide eyes */}
            <circle cx="40" cy="62" r="5.5" fill="#0A2540" />
            <circle cx="60" cy="62" r="5.5" fill="#0A2540" />
            <circle cx="42" cy="60" r="2.2" fill="#FFFFFF" />
            <circle cx="62" cy="60" r="2.2" fill="#FFFFFF" />
            {/* Big Open Smile */}
            <path d="M42 72 Q50 86 58 72 Z" fill="#0A2540" />
            <path d="M45 78 Q50 84 55 78" fill="#FF839B" />
          </>
        )}

        {expression === 'celebrating' && (
          <>
            {/* Joyful closed wink eyes */}
            <path d="M34 63 Q41 55 48 63" stroke="#0A2540" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M52 63 Q59 55 66 63" stroke="#0A2540" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            {/* Huge Grin */}
            <path d="M41 71 Q50 88 59 71 Z" fill="#0A2540" />
            <path d="M45 78 Q50 85 55 78" fill="#FF748F" />
            {/* Confetti sparkle marks */}
            <circle cx="22" cy="35" r="2.5" fill="#FBBF24" />
            <circle cx="78" cy="32" r="2.5" fill="#34D399" />
            <circle cx="25" cy="55" r="1.5" fill="#F472B6" />
            <circle cx="75" cy="54" r="2" fill="#60A5FA" />
          </>
        )}

        {expression === 'encouraging' && (
          <>
            {/* Soft smiling round eyes */}
            <circle cx="40" cy="62" r="5" fill="#0A2540" />
            <circle cx="60" cy="62" r="5" fill="#0A2540" />
            <circle cx="42" cy="60" r="2" fill="#FFFFFF" />
            <circle cx="62" cy="60" r="2" fill="#FFFFFF" />
            {/* Cheerful upward smile */}
            <path d="M43 72 Q50 80 57 72" stroke="#0A2540" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </>
        )}

        {expression === 'sleeping' && (
          <>
            {/* Peaceful closed sleeping lines */}
            <path d="M34 65 Q41 68 46 65" stroke="#0A2540" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M54 65 Q59 68 66 65" stroke="#0A2540" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="50" cy="74" r="2.5" fill="#0A2540" />
            {/* Floating 'Zzz' */}
            <text x="66" y="40" fill="#329BFA" fontSize="14" fontWeight="bold" fontFamily="sans-serif">z</text>
            <text x="76" y="30" fill="#329BFA" fontSize="11" fontWeight="bold" fontFamily="sans-serif">z</text>
          </>
        )}

        {expression === 'sad' && (
          <>
            {/* Gentle concerned eyes with slight tilt */}
            <path d="M36 60 Q41 64 46 60" stroke="#0A2540" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M54 60 Q59 64 64 60" stroke="#0A2540" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="41" cy="65" r="4" fill="#0A2540" />
            <circle cx="59" cy="65" r="4" fill="#0A2540" />
            <circle cx="43" cy="63" r="1.5" fill="#FFFFFF" />
            <circle cx="61" cy="63" r="1.5" fill="#FFFFFF" />
            {/* Soft pouting mouth (gentle, encouraging, non-guilt-tripping) */}
            <path d="M45 76 Q50 71 55 76" stroke="#0A2540" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          </>
        )}

        <defs>
          <linearGradient id="rioMascotGradient" x1="16" y1="16" x2="84" y2="96" gradientUnits="userSpaceOnUse">
            <stop stopColor="#55B0FA" />
            <stop offset="0.65" stopColor="#329BFA" />
            <stop offset="1" stopColor="#1E78D6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
