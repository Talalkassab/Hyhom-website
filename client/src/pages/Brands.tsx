import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export default function Brands() {
  const { t } = useLanguage();

  const brands = [
    {
      title: t('services.sushi.title'),
      description: t('services.sushi.description'),
      image: '/Rice Roll Logo-04.jpg'
    },
    {
      title: t('services.indian.title'),
      description: t('services.indian.description'),
      image: '/indian-food.jpg'
    },
    {
      title: t('services.travel.title'),
      description: t('services.travel.description'),
      image: '/travel.jpg'
    },
    {
      title: t('services.burger.title'),
      description: t('services.burger.description'),
      image: '/burger.jpg'
    }
  ];

  return (
    <div className="py-16 bg-pattern">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-[#2a577e] mb-12 text-center">
          {t('nav.brands')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {brands.map((brand, index) => (
            <Card key={index} className="overflow-hidden">
              <AspectRatio ratio={16/9}>
                {index === 0 ? (
                  <img 
                    src={brand.image} 
                    alt={brand.title}
                    className="w-full h-full object-contain p-2 max-h-[300px]"
                  />
                ) : (
                  <div className="w-full h-full bg-[#2a577e]/10 flex items-center justify-center">
                    <p className="text-[#2a577e]">Brand Image</p>
                  </div>
                )}
              </AspectRatio>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-[#2a577e] mb-2">
                  {brand.title}
                </h3>
                <p className="text-gray-600">
                  {brand.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}