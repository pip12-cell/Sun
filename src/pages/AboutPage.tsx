import React from 'react';
import { useStore } from '../hooks/useStore';
import { Leaf, ShieldCheck, HeartHandshake, Sparkles, Droplet, Sun } from 'lucide-react';
import { Logo } from '../components/Header';

export const AboutPage: React.FC = () => {
  const { language } = useStore();
  const isAr = language === 'ar';

  return (
    <div id="about-page-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16 sm:space-y-24">
      {/* Header story */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-xs font-bold mb-4">
          <Leaf className="w-3.5 h-3.5 text-[#3E7B35]" />
          <span>{isAr ? 'قصة علامتنا التجارية' : 'The Sun Beauty Story'}</span>
        </div>
        <h1 className="font-serif-luxury text-4xl sm:text-5xl font-bold text-[#1C241E] mb-6 leading-tight">
          {isAr
            ? 'جمال نباتي فاخر يفيض بالنقاء والحيوية'
            : 'Botanical Luxury Rooted in Purity & Vitality'}
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          {isAr
            ? 'انطلقت Sun Beauty من إيمان عميق بأن سر البشرة المشرقة والنضرة يكمن في ذكاء الطبيعة وقوة المستخلصات النباتية العضوية النقية.'
            : 'Sun Beauty was born from a deep conviction that radiant, healthy skin begins with nature’s botanical intelligence and pure organic botanicals.'}
        </p>
      </div>

      {/* Emblem & Philosophy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FAFAF8] p-8 sm:p-12 rounded-3xl border border-[#2D5A27]/10">
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-3">
            <Logo />
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C241E]">
            {isAr ? 'رمز زهرتي التوليب والساق النباتية' : 'The Tulip & Stem Botanical Emblem'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            {isAr
              ? 'يجسد شعار Sun Beauty زهرتي توليب تزهران معاً فوق ساق خضراء يانعة، ليعبرا عن التجدد والنمو والأنوثة النقية. نحرص على انتقاء خلاصات الزهور والأعشاب الطبية من مزارع عضوية مستدامة.'
              : 'Our emblem features two graceful blooming tulips on a vibrant green botanical stem, symbolizing renewal, growth, and pure femininity. We harvest delicate florals from certified sustainable botanical farms.'}
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#2D5A27] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-xs text-stone-600">
                {isAr ? 'خالٍ تماماً من البارابين، السلفات، السيليكون، والزيوت المعدنية الضارة.' : '100% free of parabens, sulfates, silicones, and synthetic fillers.'}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#2D5A27] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-xs text-stone-600">
                {isAr ? 'مكونات نقية ومدروسة بعناية للحفاظ على كامل الفيتامينات ومضادات الأكسدة.' : 'Pure active ingredients preserving maximum vitamins and antioxidants.'}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-3xl overflow-hidden shadow-xl aspect-video bg-stone-200">
          <img
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80"
            alt="Sun Beauty Botanical Farm"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 4 Pillars of Sun Beauty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-[#2D5A27]/10 shadow-xs">
          <Leaf className="w-8 h-8 text-[#2D5A27] mb-4" />
          <h3 className="font-serif-luxury text-lg font-bold text-[#1C241E] mb-2">
            {isAr ? 'نقاء نباتي معتمد' : 'Pure Certified Botanical'}
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            {isAr ? 'مستخلصات نباتية آمنة تناسب أدق أنواع البشرة وأكثرها حساسية.' : 'Clean bio-compatible extracts suitable even for delicate sensitive skin.'}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#2D5A27]/10 shadow-xs">
          <ShieldCheck className="w-8 h-8 text-[#2D5A27] mb-4" />
          <h3 className="font-serif-luxury text-lg font-bold text-[#1C241E] mb-2">
            {isAr ? 'اختبارات جلدية صارمة' : 'Dermatologist Tested'}
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            {isAr ? 'مختبر ومعتمد من أطباء الجلدية لضمان أعلى مستويات الفعالية والأمان.' : 'Tested for tolerance and skin safety to ensure transformative visible results.'}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#2D5A27]/10 shadow-xs">
          <HeartHandshake className="w-8 h-8 text-[#2D5A27] mb-4" />
          <h3 className="font-serif-luxury text-lg font-bold text-[#1C241E] mb-2">
            {isAr ? 'صديق للبيئة والحيوان' : 'Cruelty-Free & Green'}
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            {isAr ? 'نلتزم بالاستدامة وعبوات قابلة لإعادة التدوير ولم نختبر قط على الحيوانات.' : 'Eco-conscious packaging and 100% cruelty-free formulation ethics.'}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#2D5A27]/10 shadow-xs">
          <Sun className="w-8 h-8 text-[#D4AF37] mb-4" />
          <h3 className="font-serif-luxury text-lg font-bold text-[#1C241E] mb-2">
            {isAr ? 'إشراقة متجددة' : 'Enduring Radiance'}
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            {isAr ? 'نعيد لبشرتكِ توهجها الطبيعي وحاجز حمايتها لتتألقي بثقة كل يوم.' : 'Revitalizing your moisture barrier for radiant confidence every single day.'}
          </p>
        </div>
      </div>
    </div>
  );
};
