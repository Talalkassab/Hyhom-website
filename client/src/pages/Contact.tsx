import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, User } from 'lucide-react';

export default function Contact() {
  const { t } = useLanguage();

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      label: t('contact.email'),
      value: 'Info@Hyhom.sa'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      label: t('contact.phone'),
      value: '+966561876440'
    },
    {
      icon: <User className="w-6 h-6" />,
      label: t('contact.person'),
      value: 'Talal Alhamidi'
    }
  ];

  return (
    <div className="py-16 bg-pattern">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-[#2a577e] mb-12 text-center">
            {t('nav.contact')}
          </h1>
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#2a577e]/10 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <p className="text-lg font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
