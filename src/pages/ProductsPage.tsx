import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { ProductGrid } from '../components/ProductGrid';
import { Sparkles } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || undefined;
  const { language, t } = useStore();
  const isAr = language === 'ar';

  return (
    <div id="products-catalog-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{isAr ? 'المجموعة الكاملة' : 'Botanical Collection'}</span>
        </div>
        <h1 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-[#1C241E] mb-3">
          {t.catalog.allProducts}
        </h1>
        <p className="text-xs sm:text-base text-stone-600 leading-relaxed">
          {isAr
            ? 'مستحضرات نباتية نقية صُممت بعناية فائقة لتغذية وحماية وإبراز جمال بشرتكِ الطبيعي.'
            : 'Pure botanical formulations meticulously crafted to nourish, protect, and illuminate your natural beauty.'}
        </p>
      </div>

      {/* Grid with filters and sorting */}
      <ProductGrid initialCategoryId={categoryParam} />
    </div>
  );
};
