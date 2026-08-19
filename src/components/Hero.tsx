import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import {
  ArrowLeft,
  ArrowRight,
  Leaf,
  ShieldCheck,
  Truck,
  Heart,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

export const Hero: React.FC = () => {
  const { t, language } = useStore();
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <section id="hero-section" className="relative overflow-hidden bg-[#FAFAF8] pt-12 pb-16 md:pt-20 md:pb-24 border-b border-[#2D5A27]/10">
      {/* Botanical Organic Background Blurs */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-[#3E7B35]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          {/* Botanical Pill Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2D5A27]/10 border border-[#2D5A27]/20 text-[#2D5A27] text-xs md:text-sm font-semibold mb-6">
            <Leaf className="w-4 h-4 text-[#3E7B35]" />
            <span>{t.hero.eyebrow}</span>
          </div>

          {/* Main Luxury Heading */}
          <h1 className="font-serif-luxury text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#1C241E] leading-[1.15] tracking-tight mb-6 max-w-3xl">
            {t.hero.title}
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-stone-600 leading-relaxed max-w-2xl mb-10">
            {t.hero.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-14 w-full sm:w-auto">
            <Link
              to="/products"
              id="hero-shop-now-btn"
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#2D5A27] text-white hover:bg-[#23471f] font-semibold text-base shadow-lg shadow-[#2D5A27]/20 transition-all flex items-center justify-center gap-2 group"
            >
              <span>{t.hero.shopNow}</span>
              <ArrowIcon className="w-5 h-5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          </div>

          {/* Quality Highlights Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-10 border-t border-stone-200/80 w-full max-w-3xl">
            <div className="p-4 rounded-2xl bg-white/80 border border-stone-200/60 shadow-2xs text-center">
              <div className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#2D5A27]">
                100%
              </div>
              <div className="text-xs text-stone-600 font-medium mt-1">
                {t.hero.stats.natural}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-stone-200/60 shadow-2xs text-center">
              <div className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#2D5A27]">
                +15,000
              </div>
              <div className="text-xs text-stone-600 font-medium mt-1">
                {t.hero.stats.customers}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-stone-200/60 shadow-2xs text-center">
              <div className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#2D5A27] flex items-center justify-center h-8 sm:h-9">
                <Truck className="w-7 h-7 text-[#2D5A27]" />
              </div>
              <div className="text-xs text-stone-600 font-medium mt-1">
                {t.hero.trustBadges.fastDelivery}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
