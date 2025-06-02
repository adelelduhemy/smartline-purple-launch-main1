import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-bold text-primary-400 mb-4">SmartLine</h3>
            <p className={`text-gray-400 mb-6 ${isRTL ? 'font-cairo' : 'font-inter'}`}>
              {t('footer.tagline')}
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              {/* Instagram */}
              <a href="https://www.instagram.com/smart_line.1?igsh=cG15ZTZyZzhoNG9q" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors" aria-label="SmartLine Instagram">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.715.01 3.657.054 2.619.125 4.148.935 5.043 1.829a6.7 6.7 0 0 1 1.829 5.043c.044.942.053 1.232.053 3.657 0 2.43-.01 2.714-.054 3.657-.125 2.619-.935 4.148-1.829 5.043a6.7 6.7 0 0 1-5.043 1.829c-.942.044-1.232.053-3.657.053-2.43 0-2.714-.01-3.657-.054-2.619-.125-4.148-.935-5.043-1.829a6.7 6.7 0 0 1-1.829-5.043c-.044-.942-.053-1.232-.053-3.657 0-2.43.01-2.714.054-3.657.125-2.619.935-4.148 1.829-5.043a6.7 6.7 0 0 1 5.043-1.829c.942-.044 1.232-.053 3.657-.053ZM12 4.18A7.82 7.82 0 0 0 4.18 12c0 4.32 3.5 7.82 7.82 7.82 4.32 0 7.82-3.5 7.82-7.82 0-4.32-3.5-7.82-7.82-7.82Zm-.008 2.114c2.035 0 3.686 1.652 3.686 3.686S14.027 13.686 12 13.686s-3.686-1.652-3.686-3.686C8.314 7.845 9.964 6.18 11.992 6.18Zm5.36-1.072a.887.887 0 0 0-.887.887v1.774a.887.887 0 0 0 .887.887h1.774a.887.887 0 0 0 .887-.887V6.145a.887.887 0 0 0-.887-.887h-1.774Z" clipRule="evenodd" />
                </svg>
              </a>

              {/* Facebook */}
              <a href="https://www.facebook.com/share/1FkxYjhEVH/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors" aria-label="SmartLine Facebook">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.79c0-2.508 1.493-3.893 3.776-3.893 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.342 21.128 22 16.991 22 12Z" clipRule="evenodd" />
                  </svg>
              </a>

              {/* TikTok */}
               <a href="https://www.tiktok.com/@smartlien?_t=ZS-8wr45jMmBpC&_r=1" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors" aria-label="SmartLine TikTok">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                   <path d="M12.021 2.003C9.028 1.985 7.145 2.764 6.045 3.793c-1.133 1.051-1.762 2.717-1.815 4.947-.022.974-.031 1.562-.031 2.441 0 1.01.01 1.598.031 2.441.053 2.23.682 3.896 1.815 4.947 1.1 1.029 2.982 1.808 5.976 1.826 2.994.018 4.876-.761 5.976-1.79C19.13 17.934 19.759 16.268 19.812 14.038c.022-.974.031-1.562.031-2.441 0-1.01-.01-1.598-.031-2.441-.053-2.23-.682-3.896-1.815-4.947C16.918 2.764 15.036 1.985 12.021 2.003Zm-1.075 6.93L12 7.905c1.568-.112 2.524-.212 3.35-.388.29-.062.54-.12.737-.175.197-.056.32-.138.388-.247.068-.11.092-.259.092-.447v-1.79a.89.89 0 0 0-.238-.657c-.152-.145-.372-.236-.657-.273a.888.888 0 0 0-.516.073 14.994 14.994 0 0 0-3.553 1.25c-.905.32-1.754.71-2.54 1.17-.787.459-1.507.963-2.162 1.507a.89.89 0 0 0-.355.658c-.027.223-.023.447-.023.671v3.553c0 .223.004.448.023.671a.89.89 0 0 0 .355.657c.655.544 1.375 1.048 2.162 1.507.786.46 1.635.85 2.54 1.17a14.994 14.994 0 0 0 3.553 1.25c.223.06.448.092.67.092.224 0 .448-.032.672-.092.29-.062.54-.12.737-.175.197-.056.32-.138.388-.247.068-.11.092-.259.092-.447v-1.79a.89.89 0 0 0-.238-.657c-.152-.145-.372-.236-.657-.273a.888.888 0 0 0-.516.073 14.994 14.994 0 0 0-3.553 1.25c-.905.32-1.754.71-2.54 1.17-.787.459-1.507.963-2.162 1.507a.89.89 0 0 0-.355.658c-.027.223-.023.447-.023.671v1.79c0 .49.259.895.657 1.118.399.223.9.335 1.507.335.608 0 1.113-.112 1.511-.335.398-.223.657-.628.657-1.118v-1.79Z" />
                 </svg>
               </a>

              {/* Twitter/X - Removed */}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className={`font-semibold mb-4 ${isRTL ? 'font-cairo' : 'font-inter'}`}>
              {t('footer.company')}
            </h4>
            <ul className="space-y-2">
              <li><a href="#about" className={`text-gray-400 hover:text-white transition-colors ${isRTL ? 'font-cairo' : 'font-inter'}`}>{t('footer.about')}</a></li>
              <li><a href="#careers" className={`text-gray-400 hover:text-white transition-colors ${isRTL ? 'font-cairo' : 'font-inter'}`}>{t('footer.careers')}</a></li>
              <li><a href="#press" className={`text-gray-400 hover:text-white transition-colors ${isRTL ? 'font-cairo' : 'font-inter'}`}>{t('footer.press')}</a></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className={`font-semibold mb-4 ${isRTL ? 'font-cairo' : 'font-inter'}`}>
              {t('footer.support')}
            </h4>
            <ul className="space-y-2">
              <li><a href="#help" className={`text-gray-400 hover:text-white transition-colors ${isRTL ? 'font-cairo' : 'font-inter'}`}>{t('footer.help')}</a></li>
              <li><a href="#safety" className={`text-gray-400 hover:text-white transition-colors ${isRTL ? 'font-cairo' : 'font-inter'}`}>{t('footer.safety')}</a></li>
              <li><a href="#contact" className={`text-gray-400 hover:text-white transition-colors ${isRTL ? 'font-cairo' : 'font-inter'}`}>{t('footer.contact')}</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className={`font-semibold mb-4 ${isRTL ? 'font-cairo' : 'font-inter'}`}>
              {t('footer.legal')}
            </h4>
            <ul className="space-y-2">
              <li><a href="#terms" className={`text-gray-400 hover:text-white transition-colors ${isRTL ? 'font-cairo' : 'font-inter'}`}>{t('footer.terms')}</a></li>
              <li><a href="#privacy" className={`text-gray-400 hover:text-white transition-colors ${isRTL ? 'font-cairo' : 'font-inter'}`}>{t('footer.privacy')}</a></li>
              <li><a href="#cookies" className={`text-gray-400 hover:text-white transition-colors ${isRTL ? 'font-cairo' : 'font-inter'}`}>{t('footer.cookies')}</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <p className={`text-center text-gray-400 ${isRTL ? 'font-cairo' : 'font-inter'}`}>
            {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
