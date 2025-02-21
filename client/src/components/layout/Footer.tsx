import { Link } from 'wouter';
import { useLanguage } from '@/lib/i18n';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#2a577e] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Hyhom Limited</h3>
            <p className="text-gray-300">
              {t('hero.intro')}
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">{t('nav.contact')}</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: Info@Hyhom.sa</li>
              <li>Phone: +966561876440</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">{t('nav.brands')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/brands">
                  <a className="text-gray-300 hover:text-white transition-colors">
                    Rice Roll
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/brands">
                  <a className="text-gray-300 hover:text-white transition-colors">
                    Naandori
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/brands">
                  <a className="text-gray-300 hover:text-white transition-colors">
                    Alshamal For Travel and Tourism
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/brands">
                  <a className="text-gray-300 hover:text-white transition-colors">
                    MGSDR
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Hyhom Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}