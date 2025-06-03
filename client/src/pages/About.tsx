import { useLanguage } from '@/lib/i18n';

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="py-16 bg-pattern">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-[#2a577e] mb-12">
            {t('nav.about')}
          </h1>
          
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-[#2a577e] mb-4">
                Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {t('about.mission')}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#2a577e] mb-4">
                Our Vision
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {t('about.vision')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
