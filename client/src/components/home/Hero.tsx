import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export function Hero() {
  const { t } = useLanguage();

  return (
    <div className="relative bg-pattern min-h-[80vh] flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-[#2a577e] mb-6">
            {t('hero.tagline')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('hero.intro')}
          </p>
          <Button
            className="bg-[#6fbeb8] hover:bg-[#5ca8a2] text-white"
            size="lg"
          >
            {t('nav.brands')}
          </Button>
        </div>
      </div>
    </div>
  );
}