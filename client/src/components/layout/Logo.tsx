import { useLanguage } from '@/lib/i18n';

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  const { direction } = useLanguage();

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/logo.png" 
        alt="Hyhom Limited"
        className="h-12 w-auto"
      />
    </div>
  );
}