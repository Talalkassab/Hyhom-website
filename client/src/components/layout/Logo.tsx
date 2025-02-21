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
        {/* Arabic Calligraphy */}
        <path
          d="M30 35c0 0 15-5 25-5s20 5 30 5s25-5 35-5s20 5 30 5c10 0 20-5 30-5"
          stroke="#2a577e"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M140 30c0 0 5-10 10-10s10 10 10 10"
          stroke="#2a577e"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Dots */}
        <circle cx="155" cy="15" r="3" fill="#6fbeb8" />
        <circle cx="45" cy="25" r="3" fill="#6fbeb8" />

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