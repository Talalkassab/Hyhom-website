import { ServiceCard } from '@/components/services/ServiceCard';
import { Utensils, Plane, Pizza, Soup } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function Services() {
  const { t } = useLanguage();

  const services = [
    {
      title: t('services.travel.title'),
      description: t('services.travel.description'),
      icon: <Plane className="w-6 h-6 text-[#2a577e]" />
    },
    {
      title: t('services.sushi.title'),
      description: t('services.sushi.description'),
      icon: <Soup className="w-6 h-6 text-[#2a577e]" />
    },
    {
      title: t('services.indian.title'),
      description: t('services.indian.description'),
      icon: <Utensils className="w-6 h-6 text-[#2a577e]" />
    },
    {
      title: t('services.burger.title'),
      description: t('services.burger.description'),
      icon: <Pizza className="w-6 h-6 text-[#2a577e]" />
    }
  ];

  return (
    <div className="py-16 bg-pattern">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-[#2a577e] mb-12 text-center">
          {t('nav.services')}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              icon={service.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}