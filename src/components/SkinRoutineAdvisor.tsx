import React, { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { Product, SkinGoal, SkinType } from '../types';
import { Sparkles, Sun, Moon, Check, RotateCcw, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import { sanitizeImageUrl } from '../utils/sanitizeImageUrl';
import { motion, AnimatePresence } from 'motion/react';

export const SkinRoutineAdvisor: React.FC = () => {
  const { t, language, currency, settings, products, addToCart, showToast } = useStore();
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSkinType, setSelectedSkinType] = useState<SkinType>('combination');
  const [selectedGoal, setSelectedGoal] = useState<SkinGoal>('glow');

  const skinTypesList: { id: SkinType; label: string; desc: string; icon: string }[] = [
    {
      id: 'oily',
      label: t.routine.types.oily,
      desc: isAr ? 'إفراز دهون ولمعان ومسامات واضحة' : 'Excess shine & enlarged pores',
      icon: '💧',
    },
    {
      id: 'dry',
      label: t.routine.types.dry,
      desc: isAr ? 'شعور بالشد وجفاف وبشرة باهتة' : 'Tight feeling & flaky dull texture',
      icon: '🌿',
    },
    {
      id: 'combination',
      label: t.routine.types.combination,
      desc: isAr ? 'منطقة T دهنية والخدود عادية أو جافة' : 'Oily T-zone with normal/dry cheeks',
      icon: '✨',
    },
    {
      id: 'sensitive',
      label: t.routine.types.sensitive,
      desc: isAr ? 'سريعة الاحمرار والتهيج والتحسس' : 'Prone to redness & easy irritation',
      icon: '🌸',
    },
    {
      id: 'all',
      label: t.routine.types.all,
      desc: isAr ? 'بشرة متوازنة تبحث عن النضارة والحماية' : 'Balanced skin seeking protection',
      icon: '🍃',
    },
  ];

  const skinGoalsList: { id: SkinGoal; label: string; desc: string; icon: string }[] = [
    {
      id: 'glow',
      label: t.routine.goals.glow,
      desc: isAr ? 'توحيد لون البشرة وإشراقة زجاجية' : 'Glass-skin luminosity & even tone',
      icon: '🌟',
    },
    {
      id: 'hydration',
      label: t.routine.goals.hydration,
      desc: isAr ? 'ترطيب عميق يستعيد حاجز الرطوبة' : 'Deep moisture & barrier repair',
      icon: '💦',
    },
    {
      id: 'antiaging',
      label: t.routine.goals.antiaging,
      desc: isAr ? 'شد التجاعيد وتحفيز الكولاجين' : 'Firming & smoothing fine lines',
      icon: '👑',
    },
    {
      id: 'blemish',
      label: t.routine.goals.blemish,
      desc: isAr ? 'تنقية المسام وتقليل الحبوب والآثار' : 'Clarifying pores & calming blemishes',
      icon: '🌱',
    },
    {
      id: 'soothing',
      label: t.routine.goals.soothing,
      desc: isAr ? 'تهدئة التهيجات وتقوية المناعة الجلدية' : 'Calming redness & sensitivity',
      icon: '🌺',
    },
    {
      id: 'sun_protection',
      label: t.routine.goals.sun_protection,
      desc: isAr ? 'حماية يومية من التصبغات والشمس' : 'Shielding against photo-aging',
      icon: '☀️',
    },
  ];

  // Dynamically calculate recommended products directly from live IndexedDB products!
  const recommendedProducts = useMemo(() => {
    return products.filter((p) => {
      const matchType = !p.skinType || p.skinType.includes('all') || p.skinType.includes(selectedSkinType);
      const matchGoal = !p.skinGoal || p.skinGoal.includes(selectedGoal);
      return matchType || matchGoal;
    });
  }, [products, selectedSkinType, selectedGoal]);

  // Morning routine products (Cleanser, Serum, Moisturizer/Sunscreen)
  const morningRoutine = useMemo(() => {
    const cleanser = recommendedProducts.find((p) => p.routineStep === 'cleanse') || products.find((p) => p.routineStep === 'cleanse');
    const treat = recommendedProducts.find((p) => p.routineStep === 'treat') || products.find((p) => p.routineStep === 'treat');
    const protect = recommendedProducts.find((p) => p.routineStep === 'protect') || products.find((p) => p.routineStep === 'protect');
    return [cleanser, treat, protect].filter(Boolean) as Product[];
  }, [recommendedProducts, products]);

  // Evening routine products (Cleanser, Serum, Moisturizer, Mask/Oil)
  const eveningRoutine = useMemo(() => {
    const cleanser = recommendedProducts.find((p) => p.routineStep === 'cleanse') || products.find((p) => p.routineStep === 'cleanse');
    const treat = recommendedProducts.find((p) => p.routineStep === 'treat') || products.find((p) => p.routineStep === 'treat');
    const hydrate = recommendedProducts.find((p) => p.routineStep === 'hydrate') || products.find((p) => p.routineStep === 'hydrate');
    return [cleanser, treat, hydrate].filter(Boolean) as Product[];
  }, [recommendedProducts, products]);

  const addAllRoutineToCart = () => {
    const allProducts = Array.from(new Set([...morningRoutine, ...eveningRoutine]));
    allProducts.forEach((p) => addToCart(p, 1));
    showToast(
      isAr ? 'تمت إضافة الروتين كاملاً' : 'Full Routine Added',
      isAr ? `تمت إضافة ${allProducts.length} منتجات إلى حقيبة التسوق` : `${allProducts.length} products added to your bag`,
      'success'
    );
  };

  return (
    <section
      id="routine-advisor"
      className="py-16 md:py-24 bg-[#FAFAF8] border-b border-[#2D5A27]/10 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t.routine.title}</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1C241E] mb-3">
            {isAr ? 'اكتشفي روتينكِ النباتي المخصص بدقة' : 'Personalized Botanical Routine Advisor'}
          </h2>
          <p className="text-sm sm:text-base text-stone-600">
            {t.routine.subtitle}
          </p>
        </div>

        {/* Diagnostic Steps Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#2D5A27]/10 shadow-xl max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 1 ? 'bg-[#2D5A27] text-white' : 'bg-stone-100 text-stone-400'
              }`}>
                1
              </span>
              <span className="text-xs font-semibold text-stone-700 hidden sm:inline">
                {isAr ? 'نوع البشرة' : 'Skin Type'}
              </span>
            </div>
            <div className={`h-0.5 flex-1 mx-4 ${step >= 2 ? 'bg-[#2D5A27]' : 'bg-stone-200'}`} />
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 2 ? 'bg-[#2D5A27] text-white' : 'bg-stone-100 text-stone-400'
              }`}>
                2
              </span>
              <span className="text-xs font-semibold text-stone-700 hidden sm:inline">
                {isAr ? 'الهدف الرئيسي' : 'Skin Goal'}
              </span>
            </div>
            <div className={`h-0.5 flex-1 mx-4 ${step === 3 ? 'bg-[#2D5A27]' : 'bg-stone-200'}`} />
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 3 ? 'bg-[#2D5A27] text-white' : 'bg-stone-100 text-stone-400'
              }`}>
                3
              </span>
              <span className="text-xs font-semibold text-stone-700 hidden sm:inline">
                {isAr ? 'روتينكِ النباتي' : 'Your Routine'}
              </span>
            </div>
          </div>

          {/* STEP 1: SKIN TYPE */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#1C241E] mb-6 text-center">
                {t.routine.step1Title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {skinTypesList.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedSkinType(st.id)}
                    className={`p-5 rounded-2xl border text-left rtl:text-right transition-all flex flex-col justify-between ${
                      selectedSkinType === st.id
                        ? 'border-[#2D5A27] bg-[#2D5A27]/5 ring-2 ring-[#2D5A27]/20 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{st.icon}</span>
                      {selectedSkinType === st.id && (
                        <div className="w-6 h-6 rounded-full bg-[#2D5A27] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1C241E] mb-1">{st.label}</h4>
                      <p className="text-xs text-stone-500 leading-relaxed">{st.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-8 py-3.5 rounded-2xl bg-[#2D5A27] text-white font-semibold text-sm hover:bg-[#23471f] transition-all flex items-center gap-2"
                >
                  <span>{isAr ? 'الخطوة التالية' : 'Next Step'}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SKIN GOAL */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#1C241E] mb-6 text-center">
                {t.routine.step2Title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {skinGoalsList.map((sg) => (
                  <button
                    key={sg.id}
                    type="button"
                    onClick={() => setSelectedGoal(sg.id)}
                    className={`p-5 rounded-2xl border text-left rtl:text-right transition-all flex flex-col justify-between ${
                      selectedGoal === sg.id
                        ? 'border-[#2D5A27] bg-[#2D5A27]/5 ring-2 ring-[#2D5A27]/20 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{sg.icon}</span>
                      {selectedGoal === sg.id && (
                        <div className="w-6 h-6 rounded-full bg-[#2D5A27] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1C241E] mb-1">{sg.label}</h4>
                      <p className="text-xs text-stone-500 leading-relaxed">{sg.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-2xl border border-stone-300 text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-all"
                >
                  {isAr ? 'السابق' : 'Back'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-8 py-3.5 rounded-2xl bg-[#2D5A27] text-white font-semibold text-sm hover:bg-[#23471f] transition-all flex items-center gap-2"
                >
                  <span>{isAr ? 'عرض روتيني المقترح' : 'Reveal My Routine'}</span>
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: RESULTS */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="text-center">
                <span className="text-3xl mb-2 inline-block">✨</span>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C241E]">
                  {t.routine.resultTitle}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  {isAr
                    ? `مصمم خصيصاً للبشرة (${skinTypesList.find((s) => s.id === selectedSkinType)?.label}) مع التركيز على (${skinGoalsList.find((g) => g.id === selectedGoal)?.label})`
                    : `Tailored for ${selectedSkinType} skin seeking ${selectedGoal}`}
                </p>
              </div>

              {/* AM & PM Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Morning Routine */}
                <div className="p-6 rounded-2xl bg-[#FFFDF5] border border-amber-200/60 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-amber-100">
                    <Sun className="w-5 h-5 text-amber-600" />
                    <h4 className="font-serif-luxury text-lg font-bold text-amber-950">
                      {t.routine.morning}
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {morningRoutine.map((p, idx) => (
                      <div key={`am-${p.id}`} className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-amber-100">
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <img
                          src={sanitizeImageUrl(p.images[0])}
                          alt={p.name[language]}
                          className="w-10 h-10 object-cover rounded-lg shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#1C241E] truncate">{p.name[language]}</p>
                          <p className="text-[11px] text-[#2D5A27] font-semibold">
                            {formatPrice(p.price, currency, settings.currencies, language)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evening Routine */}
                <div className="p-6 rounded-2xl bg-[#F4F8F4] border border-[#2D5A27]/15 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#2D5A27]/10">
                    <Moon className="w-5 h-5 text-[#2D5A27]" />
                    <h4 className="font-serif-luxury text-lg font-bold text-[#1C241E]">
                      {t.routine.evening}
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {eveningRoutine.map((p, idx) => (
                      <div key={`pm-${p.id}`} className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#2D5A27]/10">
                        <span className="w-6 h-6 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <img
                          src={sanitizeImageUrl(p.images[0])}
                          alt={p.name[language]}
                          className="w-10 h-10 object-cover rounded-lg shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#1C241E] truncate">{p.name[language]}</p>
                          <p className="text-[11px] text-[#2D5A27] font-semibold">
                            {formatPrice(p.price, currency, settings.currencies, language)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t.routine.restart}</span>
                </button>

                <button
                  type="button"
                  onClick={addAllRoutineToCart}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#2D5A27] text-white font-semibold text-sm hover:bg-[#23471f] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#2D5A27]/20"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t.routine.addAllToCart}</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
