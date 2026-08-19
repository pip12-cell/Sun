import React from 'react';
import { useStore } from '../hooks/useStore';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '../utils/helpers';

export const WhatsAppButton: React.FC = () => {
  const { settings, language } = useStore();
  const isAr = language === 'ar';

  const defaultMsg = isAr
    ? 'مرحباً Sun Beauty! أود الاستفسار عن منتجات العناية بالبشرة والروتين المناسب لي 🌿'
    : 'Hello Sun Beauty! I would like to inquire about your botanical skincare rituals 🌿';

  const waUrl = getWhatsAppLink(settings.whatsappNumber, defaultMsg);

  return (
    <aside
      id="floating-whatsapp-container"
      aria-label="Direct WhatsApp Contact"
      className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-40 group"
    >
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="floating-whatsapp-btn"
        className="flex items-center gap-2.5 px-4 py-3 bg-[#25D366] text-white rounded-full shadow-xl hover:shadow-2xl hover:bg-[#20bd5a] hover:scale-105 transition-all duration-300 active:scale-95"
        title={isAr ? 'تواصل معنا مباشرة عبر واتساب' : 'Chat directly with Sun Beauty on WhatsApp'}
      >
        <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
        <span className="text-xs font-bold hidden sm:inline">
          {isAr ? 'تواصل عبر واتساب' : 'WhatsApp Us'}
        </span>
      </a>
    </aside>
  );
};
