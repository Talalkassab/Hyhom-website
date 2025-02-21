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
          d="M160 20C160 20 140 20 130 20C120 20 115 25 110 30C105 35 100 40 90 40C80 40 70 35 65 30C60 25 55 20 45 20C35 20 20 20 20 20"
          stroke="#2a577e"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Dot accent */}
        <circle cx="155" cy="15" r="2" fill="#6fbeb8" />
        {/* HYHOM LTD. text */}
        <text
          x="50"
          y="65"
          fontFamily="Arial"
          fontSize="14"
          letterSpacing="2"
          fill="#6fbeb8"
        >
          H Y H O M  LTD.
        </text>
      </svg>
    </div>
  );
}