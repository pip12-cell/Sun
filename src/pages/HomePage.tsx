import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Star,
  Quote,
  CheckCircle2,
  Leaf,
  Droplet,
  Search,
  Grid,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { categories, products, reviews, language, t } = useStore();
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.categoryId === selectedCategory;

      const matchesSearch =
        searchQuery.trim() === '' ||
        product.name.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.en.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div id="home-page-container" className="space-y-16 sm:space-y-24">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Unified All-Products Showcase with Category Tabs */}
      <section id="all-products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-stone-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-xs font-bold mb-3">
              <Grid className="w-3.5 h-3.5 text-[#3E7B35]" />
              <span>{isAr ? 'مجموعتنا الكاملة' : 'Full Collection'}</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1C241E]">
              {isAr ? 'جميع المنتجات' : 'All Products'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              {isAr
                ? 'تصفحي جميع مستحضرات العناية الطبيعية واختاري ما يناسب بشرتكِ'
                : 'Explore all pure skincare elixirs crafted for your daily glow'}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحثي عن منتج...' : 'Search products...'}
              className="w-full ps-10 pe-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-[#2D5A27] shadow-xs"
            />
          </div>
        </div>

        {/* Category Tabs Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedCategory === 'all'
                ? 'bg-[#2D5A27] text-white shadow-md shadow-[#2D5A27]/20'
                : 'bg-white border border-stone-200 text-stone-700 hover:border-[#2D5A27]/40 hover:bg-stone-50'
            }`}
          >
            <span>{isAr ? 'الكل' : 'All'}</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                selectedCategory === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              {products.length}
            </span>
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#2D5A27] text-white shadow-md shadow-[#2D5A27]/20'
                    : 'bg-white border border-stone-200 text-stone-700 hover:border-[#2D5A27]/40 hover:bg-stone-50'
                }`}
              >
                <span>{cat.name[language]}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-800 text-sm">
              {isAr ? 'لم يتم العثور على منتجات مطابقة' : 'No products found'}
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {isAr
                ? 'جربي البحث بكلمات أخرى أو اختاري تصنيفاً مختلفاً.'
                : 'Try searching with different keywords or switch the active category tab.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#23471f] transition-colors"
            >
              {isAr ? 'إعادة ضبط الفلتر' : 'Reset Filters'}
            </button>
          </div>
        )}
      </section>

      {/* 3. Brand Values Banner */}
      <section className="bg-[#2D5A27] text-white py-14 sm:py-18 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
                {isAr ? 'فلسفة النقاء والجمال' : 'Pure Botanical Philosophy'}
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                {isAr ? 'عناية فاخرة مستخلصة من قلب الطبيعة' : 'Crafted with Pure Botanicals & Potent Actives'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-w-lg">
                {isAr
                  ? 'نبتكر تركيبات استثنائية تمزج بين خلاصات الزهور وأجود المكونات الطبيعية الفعالة، لنمنحكِ بشرة صحية متوهجة دون أي كيماويات قاسية.'
                  : 'We blend pure floral extracts and potent natural actives for transformative luminosity.'}
              </p>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <Leaf className="w-6 h-6 text-[#D4AF37] mb-3" />
                <h4 className="font-bold text-sm mb-1">{isAr ? 'نباتي 100%' : '100% Botanical'}</h4>
                <p className="text-xs text-stone-200">
                  {isAr ? 'خالٍ تماماً من البارابين والسلفات والعطور الاصطناعية.' : 'Zero parabens, sulfates, or irritating synthetic fillers.'}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <Droplet className="w-6 h-6 text-[#D4AF37] mb-3" />
                <h4 className="font-bold text-sm mb-1">{isAr ? 'ترطيب عميق' : 'Deep Hydration'}</h4>
                <p className="text-xs text-stone-200">
                  {isAr ? 'سيراميدات نباتية تقوي حاجز البشرة وتحميها من الجفاف.' : 'Plant ceramides locking in moisture and barrier protection.'}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <CheckCircle2 className="w-6 h-6 text-[#D4AF37] mb-3" />
                <h4 className="font-bold text-sm mb-1">{isAr ? 'نتائج مثبتة' : 'Proven Results'}</h4>
                <p className="text-xs text-stone-200">
                  {isAr ? 'نضارة وتوحيد ملحوظ لملمس البشرة خلال فترة قصيرة.' : 'Visible glow and skin refining with regular care.'}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <Sparkles className="w-6 h-6 text-[#D4AF37] mb-3" />
                <h4 className="font-bold text-sm mb-1">{isAr ? 'إشراقة متألقة' : 'Radiant Glow'}</h4>
                <p className="text-xs text-stone-200">
                  {isAr ? 'مستخلصات نباتية تمنحكِ بريقاً طبيعياً وصحياً.' : 'Natural botanicals imparting an enduring sheen.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Real Customer Reviews */}
      {reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-xs font-bold mb-3">
              <Quote className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{t.nav.reviews}</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1C241E] mb-2">
              {isAr ? 'ماذا تقول عميلات Sun Beauty؟' : 'Loved by Our Community'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              {isAr ? 'تجارب حقيقية لنتائج ملموسة مع مستحضراتنا الطبيعية' : 'Real experiences from women who transformed their skincare ritual'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {reviews.slice(0, 4).map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-3xl bg-white border border-[#2D5A27]/10 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-[#D4AF37] mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic mb-4">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="font-bold text-xs text-[#1C241E]">{rev.customerName}</span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    {isAr ? 'شراء موثق ✓' : 'Verified Buyer ✓'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
