import { useLanguage } from '@/lib/i18n';

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  const { direction } = useLanguage();

  return (
    <div className={`flex items-center ${className}`}>
      <svg
        width="200"
        height="80"
        viewBox="0 0 200 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-auto"
      >
        {/* Arabic Calligraphy - More accurate representation */}
        <path
          d="M35 40c10-15 20-10 30-5s25 5 35 0s20-10 30-5 25 10 35 0"
          stroke="#2a577e"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M150 25c0 0 5 5 10 0s5-10 0-15"
          stroke="#2a577e"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Dots */}
        <circle cx="160" cy="12" r="3" fill="#6fbeb8" />
        <circle cx="50" cy="28" r="3" fill="#6fbeb8" />

        {/* HYHOM LTD. text */}
        <text
          x="45"
          y="65"
          fontFamily="Arial"
          fontSize="16"
          fontWeight="300"
          letterSpacing="4"
          fill="#6fbeb8"
        >
          HYHOM LTD.
        </text>
      </svg>
    </div>
  );
}