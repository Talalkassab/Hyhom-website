import { useLanguage } from '@/lib/i18n';

interface LogoProps {
  className?: string;
  customization?: {
    primaryColor: string;
    secondaryColor: string;
    arabicScale: number;
    englishScale: number;
    spacing: number;
  };
}

export function Logo({ 
  className = "",
  customization = {
    primaryColor: '#2a577e',
    secondaryColor: '#6fbeb8',
    arabicScale: 1,
    englishScale: 1,
    spacing: 1,
  }
}: LogoProps) {
  const { direction } = useLanguage();

  const arabicTransform = `scale(${customization.arabicScale})`;
  const englishTransform = `scale(${customization.englishScale})`;
  const letterSpacing = 4 * customization.spacing;

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
        <g transform={arabicTransform}>
          <path
            d="M35 40c10-15 20-10 30-5s25 5 35 0s20-10 30-5 25 10 35 0"
            stroke={customization.primaryColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M150 25c0 0 5 5 10 0s5-10 0-15"
            stroke={customization.primaryColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Dots */}
          <circle cx="160" cy="12" r="3" fill={customization.secondaryColor} />
          <circle cx="50" cy="28" r="3" fill={customization.secondaryColor} />
        </g>

        {/* HYHOM LTD. text */}
        <g transform={englishTransform}>
          <text
            x="45"
            y="65"
            fontFamily="Arial"
            fontSize="16"
            fontWeight="300"
            letterSpacing={letterSpacing}
            fill={customization.secondaryColor}
          >
            HYHOM LTD.
          </text>
        </g>
      </svg>
    </div>
  );
}