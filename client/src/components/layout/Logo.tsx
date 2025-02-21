import { useLanguage } from '@/lib/i18n';

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  const { direction } = useLanguage();

  return (
    <div className={`flex items-center ${className}`}>
      <svg
        viewBox="0 0 800 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-auto"
      >
        {/* Main flowing Arabic calligraphy */}
        <path
          d="M200 150 C300 150, 350 100, 400 100 C450 100, 500 150, 600 150 C650 150, 700 100, 750 100"
          stroke="#2a577e"
          strokeWidth="25"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Top end flourish */}
        <path
          d="M650 100 C670 80, 690 60, 710 80"
          stroke="#2a577e"
          strokeWidth="25"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Turquoise accent dot */}
        <circle cx="700" cy="60" r="12" fill="#6fbeb8" />

        {/* HYHOM LTD. text */}
        <text
          x="300"
          y="250"
          fontFamily="Arial"
          fontSize="60"
          fontWeight="300"
          letterSpacing="15"
          fill="#6fbeb8"
        >
          HYHOM LTD.
        </text>
      </svg>
    </div>
  );
}