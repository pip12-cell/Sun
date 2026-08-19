import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { Logo } from './Header';
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, language, settings, categories, showToast } = useStore();
  const location = useLocation();
  const isAr = language === 'ar';
  const [copied, setCopied] = useState(false);

  // Hide footer only on admin dashboard
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const addressText =
    settings?.address?.[language] || (isAr ? 'البحيرة، دمنهور' : 'Damanhour, El Beheira');

  const shareTitle = isAr
    ? 'Sun Beauty | عناية نباتية فاخرة للبشرة 🌿✨'
    : 'Sun Beauty | Luxury Botanical Skincare 🌿✨';
  const shareText = isAr
    ? 'اكتشفي تشكيلة Sun Beauty الفاخرة لمنتجات العناية بالبشرة والجمال الطبيعي المستوحاة من أنقى الخلاصات النباتية 🌿✨'
    : 'Discover Sun Beauty luxury botanical skincare elixirs and rituals 🌿✨';
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sunbeauty.store';

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (showToast) {
        showToast(
          isAr ? 'تم نسخ رابط متجر Sun Beauty بنجاح! 📋' : 'Store link copied to clipboard! 📋',
          'success'
        );
      }
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareTitle}\n${shareText}\n${shareUrl}`
  )}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(shareTitle)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}`;

  return (
    <footer id="main-app-footer" className="bg-[#19221B] text-[#FAFAF8] pt-16 pb-12 border-t border-[#2D5A27]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Grid: Brand & Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-10 border-b border-stone-800">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white/5 inline-block p-2 rounded-2xl border border-white/10">
              <Logo />
            </div>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-sm">
              {t.footer.tagline}
            </p>
            <div className="space-y-2.5 text-xs text-stone-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="font-medium text-stone-200">{addressText}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span dir="ltr">{settings.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>{settings.email}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-2 flex items-center gap-3 text-stone-400">
              {settings.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:text-[#D4AF37] hover:bg-stone-700 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:text-[#D4AF37] hover:bg-stone-700 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider font-serif-luxury">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/" className="hover:text-[#D4AF37] transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-[#D4AF37] transition-colors">
                  {t.nav.products}
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-[#D4AF37] transition-colors">
                  {t.nav.reviews}
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-[#D4AF37] transition-colors">
                  {t.nav.wishlist}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider font-serif-luxury">
              {t.nav.categories}
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-xs text-stone-400">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/products?category=${cat.id}`}
                    className="hover:text-[#D4AF37] transition-colors"
                  >
                    {cat.name[language]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Web Share Feature Section at the bottom */}
        <div
          id="footer-web-share-section"
          className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#222E25] via-[#1C271F] to-[#222E25] border border-[#D4AF37]/30 shadow-lg"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-start space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? 'مشاركة المتجر' : 'Share the Ritual'}</span>
              </div>
              <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white">
                {isAr ? 'شاركي Sun Beauty مع صديقاتكِ وأحبائكِ' : 'Share Sun Beauty with Friends & Family'}
              </h3>
              <p className="text-xs text-stone-300 max-w-xl">
                {isAr
                  ? 'انشري إشراقة الجمال الطبيعي وشاركي رابط المتجر عبر تطبيقاتكِ المفضلة بضغطة زر واحدة.'
                  : 'Spread radiant botanical beauty and share the store link instantly via your favorite apps.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full lg:w-auto">
              {/* Native Web Share API Button */}
              <button
                type="button"
                id="native-web-share-btn"
                onClick={handleNativeShare}
                className="px-5 py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#c49f2c] text-[#19221B] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>{isAr ? 'مشاركة سريعة' : 'Instant Share'}</span>
              </button>

              {/* Direct WhatsApp Share */}
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noreferrer"
                id="footer-share-whatsapp-btn"
                title={isAr ? 'مشاركة عبر واتساب' : 'Share on WhatsApp'}
                className="w-11 h-11 rounded-2xl bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 flex items-center justify-center transition-all"
              >
                <MessageCircle className="w-5 h-5" />
              </a>

              {/* Direct Telegram Share */}
              <a
                href={telegramShareUrl}
                target="_blank"
                rel="noreferrer"
                id="footer-share-telegram-btn"
                title={isAr ? 'مشاركة عبر تيليجرام' : 'Share on Telegram'}
                className="w-11 h-11 rounded-2xl bg-[#0088cc]/20 hover:bg-[#0088cc] text-[#0088cc] hover:text-white border border-[#0088cc]/30 flex items-center justify-center transition-all"
              >
                <Send className="w-5 h-5" />
              </a>

              {/* Direct Facebook Share */}
              <a
                href={facebookShareUrl}
                target="_blank"
                rel="noreferrer"
                id="footer-share-facebook-btn"
                title={isAr ? 'مشاركة عبر فيسبوك' : 'Share on Facebook'}
                className="w-11 h-11 rounded-2xl bg-[#1877F2]/20 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 flex items-center justify-center transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>

              {/* Direct Copy Link Button */}
              <button
                type="button"
                id="footer-copy-link-btn"
                onClick={handleCopyLink}
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white border border-white/15 font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[#D4AF37] font-bold">
                      {isAr ? 'تم النسخ ✓' : 'Copied! ✓'}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-stone-300" />
                    <span>{isAr ? 'نسخ الرابط' : 'Copy Link'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Policies & Copyright Bottom Row */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-400">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <span className="hover:text-stone-200 cursor-pointer">{t.footer.policies.shipping}</span>
            <span>•</span>
            <span className="hover:text-stone-200 cursor-pointer">{t.footer.policies.returns}</span>
            <span>•</span>
            <span className="hover:text-stone-200 cursor-pointer">{t.footer.policies.privacy}</span>
            <span>•</span>
            <span className="hover:text-stone-200 cursor-pointer">{t.footer.policies.terms}</span>
          </div>

          <div className="flex items-center gap-1">
            <span>{t.footer.copyright.replace('{year}', new Date().getFullYear().toString())}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
