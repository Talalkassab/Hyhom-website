import { useLanguage } from '@/lib/i18n';

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  const { direction } = useLanguage();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${direction === 'rtl' ? 'order-1' : 'order-none'}`}
      >
        <path
          d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z"
          fill="#2a577e"
        />
        <path
          d="M23 12c0 3.866-3.134 7-7 7s-7-3.134-7-7h4c0 1.654 1.346 3 3 3s3-1.346 3-3h4z"
          fill="#6fbeb8"
        />
      </svg>
      <span className="text-2xl font-bold text-[#2a577e]">Hyhom</span>
    </div>
  );
}
