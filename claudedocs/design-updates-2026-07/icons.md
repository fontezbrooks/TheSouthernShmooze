```typscript
export default function App() {
  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col items-center justify-center gap-10 py-12 px-6">
      <div className="grid grid-cols-2 gap-10">

        {/* Better Business Bureau */}
        <div className="flex flex-col items-center gap-3">
          <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="120" rx="26" fill="#003697" />
            {/* Torch handle */}
            <rect x="56" y="72" width="8" height="24" rx="2" fill="#ffffff" />
            {/* Torch bowl */}
            <path d="M44 60 Q44 72 60 72 Q76 72 76 60 L72 46 H48 Z" fill="#ffffff" />
            {/* Flame outer */}
            <path d="M60 14 C60 14 50 26 48 36 C46 44 50 48 54 46 C52 40 56 34 60 28 C64 34 68 40 66 46 C70 48 74 44 72 36 C70 26 60 14 60 14 Z" fill="#F5A623" />
            {/* Flame inner */}
            <path d="M60 22 C60 22 54 32 54 38 C54 42 57 44 60 42 C63 44 66 42 66 38 C66 32 60 22 60 22 Z" fill="#FFD700" />
            {/* Stars row */}
            <text x="60" y="92" textAnchor="middle" fontSize="9" fill="#F5A623" fontFamily="Arial" letterSpacing="3">★★★★★</text>
          </svg>
          <span className="text-[13px] font-semibold text-[#333] tracking-wide">Better Business Bureau</span>
        </div>

        {/* Yelp */}
        <div className="flex flex-col items-center gap-3">
          <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="120" rx="26" fill="#D32323" />
            {/* Yelp burst arms — 5-pointed starburst approximation */}
            {/* Stylized lowercase "y" mark */}
            <path
              d="M47 30 L60 58 L60 90 Q60 94 64 94 L68 94 Q72 94 72 90 L72 55 L85 30 Q87 26 83 24 L79 22 Q75 20 73 24 L63 44 L53 24 Q51 20 47 22 L43 24 Q39 26 41 30 Z"
              fill="white"
            />
          </svg>
          <span className="text-[13px] font-semibold text-[#333] tracking-wide">Yelp</span>
        </div>

        {/* Google Business Profile */}
        <div className="flex flex-col items-center gap-3">
          <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="120" rx="26" fill="#ffffff" />
            {/* Google "G" multicolor mark */}
            {/* Red arc top-right */}
            <path d="M60 22 A38 38 0 0 1 91 43" stroke="#EA4335" strokeWidth="10" fill="none" strokeLinecap="round" />
            {/* Yellow arc bottom-right */}
            <path d="M91 43 A38 38 0 0 1 88 78" stroke="#FBBC04" strokeWidth="10" fill="none" strokeLinecap="round" />
            {/* Green arc bottom-left */}
            <path d="M88 78 A38 38 0 0 1 32 78" stroke="#34A853" strokeWidth="10" fill="none" strokeLinecap="round" />
            {/* Blue arc left and top */}
            <path d="M32 78 A38 38 0 0 1 60 22" stroke="#4285F4" strokeWidth="10" fill="none" strokeLinecap="round" />
            {/* White cutout center to make it a C-shape */}
            <circle cx="60" cy="60" r="22" fill="white" />
            {/* Horizontal arm of the G */}
            <rect x="60" y="53" width="31" height="11" rx="2" fill="#4285F4" />
            {/* Inner circle (open space) */}
            <circle cx="60" cy="60" r="14" fill="white" />
            {/* Center dot */}
            <circle cx="60" cy="60" r="6" fill="#4285F4" />
          </svg>
          <span className="text-[13px] font-semibold text-[#333] tracking-wide">Google Business</span>
        </div>

        {/* GA Secretary of State */}
        <div className="flex flex-col items-center gap-3">
          <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="120" rx="26" fill="#0D2B6B" />
            {/* Gold ring / medallion */}
            <circle cx="60" cy="52" r="30" fill="#C8A84B" />
            <circle cx="60" cy="52" r="24" fill="#0D2B6B" />
            {/* "GA" text in gold */}
            <text
              x="60"
              y="60"
              textAnchor="middle"
              fontSize="20"
              fontWeight="bold"
              fill="#C8A84B"
              fontFamily="Georgia, serif"
              letterSpacing="-1"
            >GA</text>
            {/* Laurel branches hint — left */}
            <path d="M30 52 Q26 46 30 42 Q34 46 30 52Z" fill="#C8A84B" opacity="0.7" />
            <path d="M30 52 Q24 52 23 46 Q28 44 30 52Z" fill="#C8A84B" opacity="0.5" />
            {/* Laurel branches hint — right */}
            <path d="M90 52 Q94 46 90 42 Q86 46 90 52Z" fill="#C8A84B" opacity="0.7" />
            <path d="M90 52 Q96 52 97 46 Q92 44 90 52Z" fill="#C8A84B" opacity="0.5" />
            {/* "SECRETARY OF STATE" label band */}
            <rect x="10" y="86" width="100" height="20" rx="4" fill="#C8A84B" />
            <text
              x="60"
              y="100"
              textAnchor="middle"
              fontSize="7"
              fontWeight="bold"
              fill="#0D2B6B"
              fontFamily="Arial"
              letterSpacing="0.5"
            >SECRETARY OF STATE</text>
          </svg>
          <span className="text-[13px] font-semibold text-[#333] tracking-wide">GA Secretary of State</span>
        </div>

      </div>
    </div>
  );
}
```