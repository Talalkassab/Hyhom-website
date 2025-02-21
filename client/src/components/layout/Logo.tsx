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
        {/* Main curved line */}
        <path
          d="M20 40C40 40 60 30 80 30S120 40 140 40s40-10 60-10"
          stroke="#2a577e"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Turquoise dot */}
        <circle cx="170" cy="20" r="4" fill="#6fbeb8" />

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