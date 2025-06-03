import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, Users, Shield, Globe } from 'lucide-react';

interface PageProps {
  params: { locale: string };
}

export default function LocalePage({ params: { locale } }: PageProps) {
  const isArabic = locale === 'ar';
  
  const content = {
    ar: {
      appName: 'حيهم كونكت',
      heroTitle: 'اربط فريقك، وقوِّ أعمالك',
      heroSubtitle: 'منصة تواصل داخلية آمنة مصممة لموظفي حيهم',
      getStarted: 'ابدأ الآن',
      login: 'تسجيل الدخول',
      featuresTitle: 'كل ما تحتاجه للبقاء على اتصال',
      features: {
        messaging: { title: 'المراسلة الفورية', desc: 'تواصل فوري مع الزملاء عبر جميع الأقسام' },
        collaboration: { title: 'التعاون الجماعي', desc: 'أنشئ قنوات للمشاريع والأقسام والمواضيع' },
        security: { title: 'أمان على مستوى المؤسسات', desc: 'بياناتك محمية بتشفير وفق معايير الصناعة' },
        localization: { title: 'دعم ثنائي اللغة', desc: 'دعم كامل للعربية والإنجليزية لجميع المستخدمين' },
      },
      rights: 'جميع الحقوق محفوظة.'
    },
    en: {
      appName: 'HYHOM Connect',
      heroTitle: 'Connect Your Team, Empower Your Business',
      heroSubtitle: 'A secure internal communication platform designed for HYHOM employees',
      getStarted: 'Get Started',
      login: 'Login',
      featuresTitle: 'Everything You Need to Stay Connected',
      features: {
        messaging: { title: 'Real-time Messaging', desc: 'Instant communication with colleagues across all departments' },
        collaboration: { title: 'Team Collaboration', desc: 'Create channels for projects, departments, and topics' },
        security: { title: 'Enterprise Security', desc: 'Your data is protected with industry-standard encryption' },
        localization: { title: 'Bilingual Support', desc: 'Full Arabic and English support for all users' },
      },
      rights: 'All rights reserved.'
    }
  };

  const t = content[locale as keyof typeof content] || content.ar; // Fallback to Arabic

  const features = [
    {
      icon: MessageCircle,
      title: t.features.messaging.title,
      description: t.features.messaging.desc,
    },
    {
      icon: Users,
      title: t.features.collaboration.title,
      description: t.features.collaboration.desc,
    },
    {
      icon: Shield,
      title: t.features.security.title,
      description: t.features.security.desc,
    },
    {
      icon: Globe,
      title: t.features.localization.title,
      description: t.features.localization.desc,
    },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-hyhom-light to-white ${isArabic ? 'font-arabic' : 'font-english'}`}>
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <MessageCircle className="h-8 w-8 text-hyhom-primary" />
            <span className="text-2xl font-bold text-hyhom-dark">
              {t.appName}
            </span>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Link href={locale === 'ar' ? '/en' : '/ar'}>
              <Button variant="ghost">
                {locale === 'ar' ? 'English' : 'العربية'}
              </Button>
            </Link>
            <Link href={`/${locale}/login`}>
              <Button variant="ghost">{t.login}</Button>
            </Link>
            <Link href={`/${locale}/register`}>
              <Button className="bg-hyhom-primary hover:bg-hyhom-dark">
                {t.getStarted}
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-hyhom-dark mb-6">
          {t.heroTitle}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {t.heroSubtitle}
        </p>
        <div className="flex justify-center space-x-4 rtl:space-x-reverse">
          <Link href={`/${locale}/register`}>
            <Button size="lg" className="bg-hyhom-primary hover:bg-hyhom-dark">
              {t.getStarted}
            </Button>
          </Link>
          <Link href={`/${locale}/login`}>
            <Button size="lg" variant="outline">
              {t.login}
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-hyhom-dark mb-12">
          {t.featuresTitle}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <feature.icon className="h-12 w-12 text-hyhom-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-hyhom-dark mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-hyhom-dark text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 HYHOM LTD. {t.rights}</p>
        </div>
      </footer>
    </div>
  );
}