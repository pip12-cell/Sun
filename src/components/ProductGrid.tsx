import React, { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { ProductCard } from './ProductCard';
import { Product } from '../types';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Sparkles } from 'lucide-react';
import { formatPrice } from '../utils/helpers';

interface ProductGridProps {
  initialCategoryId?: string;
  title?: string;
  subtitle?: string;
  limit?: number;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  initialCategoryId,
  title,
  subtitle,
  limit,
}) => {
  const { products, categories, language, currency, settings, t } = useStore();
  const isAr = language === 'ar';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId || 'all');
  const [sortBy, setSortBy] = useState<'featured' | 'bestSeller' | 'rating' | 'priceAsc' | 'priceDesc' | 'newest'>('featured');
  const [filterDiscountOnly, setFilterDiscountOnly] = useState(false);
  const [filterNewOnly, setFilterNewOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Filtered & Sorted list
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // Discount filter
    if (filterDiscountOnly) {
      result = result.filter((p) => (p.discount && p.discount > 0) || (p.compareAtPrice && p.compareAtPrice > p.price));
    }

    // New only
    if (filterNewOnly) {
      result = result.filter((p) => p.newProduct);
    }

    // Rating filter
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Price filter (based on EGP price)
    if (maxPrice < 2000) {
      result = result.filter((p) => p.price <= maxPrice);
    }

    // Sorting
    switch (sortBy) {
      case 'bestSeller':
        result.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'priceAsc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (b.newProduct ? 1 : 0) - (a.newProduct ? 1 : 0));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    if (limit && limit > 0) {
      result = result.slice(0, limit);
    }

    return result;
  }, [products, selectedCategory, filterDiscountOnly, filterNewOnly, minRating, maxPrice, sortBy, limit]);

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (filterDiscountOnly ? 1 : 0) +
    (filterNewOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (maxPrice < 2000 ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setFilterDiscountOnly(false);
    setFilterNewOnly(false);
    setMinRating(0);
    setMaxPrice(2000);
    setSortBy('featured');
  };

  return (
    <div className="w-full">
      {/* Optional Title Section */}
      {(title || subtitle) && (
        <div className="text-center max-w-2xl mx-auto mb-10">
          {title && (
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1C241E] mb-2">
              {title}
            </h2>
          )}
          {subtitle && <p className="text-sm sm:text-base text-stone-600">{subtitle}</p>}
        </div>
      )}

      {/* Filter and Category Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-stone-200">
        {/* Horizontal scrollable category pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#2D5A27] text-white shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {isAr ? 'الكل' : 'All'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#2D5A27] text-white shadow-sm'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat.name[language]}
            </button>
          ))}
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          {/* Filter Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeFiltersCount > 0
                ? 'border-[#2D5A27] bg-[#2D5A27]/5 text-[#2D5A27]'
                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t.catalog.filterBy}</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#2D5A27] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-stone-200 text-stone-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-[#2D5A27]"
            >
              <option value="featured">{t.catalog.sortOptions.featured}</option>
              <option value="bestSeller">{t.catalog.sortOptions.bestSeller}</option>
              <option value="rating">{t.catalog.sortOptions.rating}</option>
              <option value="priceAsc">{t.catalog.sortOptions.priceAsc}</option>
              <option value="priceDesc">{t.catalog.sortOptions.priceDesc}</option>
              <option value="newest">{t.catalog.sortOptions.newest}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {isFilterDrawerOpen && (
        <div className="bg-white p-5 rounded-2xl border border-[#2D5A27]/20 shadow-md mb-8 flex flex-wrap items-center gap-6">
          {/* Quick toggle chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterDiscountOnly(!filterDiscountOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                filterDiscountOnly
                  ? 'bg-[#D4AF37] text-white border-[#D4AF37]'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              🏷️ {isAr ? 'العروض والخصومات' : 'On Sale'}
            </button>
            <button
              type="button"
              onClick={() => setFilterNewOnly(!filterNewOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                filterNewOnly
                  ? 'bg-[#2D5A27] text-white border-[#2D5A27]'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              ✨ {isAr ? 'وصل حديثاً' : 'New Arrivals'}
            </button>
          </div>

          {/* Rating filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-semibold">{t.catalog.rating}:</span>
            {[4, 4.5, 4.8].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setMinRating(minRating === r ? 0 : r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                  minRating === r
                    ? 'bg-[#2D5A27] text-white border-[#2D5A27]'
                    : 'bg-stone-50 text-stone-600 border-stone-200'
                }`}
              >
                ★ {r}+
              </button>
            ))}
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 ml-auto rtl:ml-0 rtl:mr-auto"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.catalog.clearFilters}</span>
            </button>
          )}
        </div>
      )}

      {/* Products Grid: 4 cols desktop, 2-3 tablet, 2 mobile */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
          <Sparkles className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#1C241E] mb-2">{t.catalog.noProducts}</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto mb-6">
            {isAr
              ? 'جربي تعديل الفلاتر أو تصفح باقي التصنيفات لاكتشاف روتينكِ النباتي.'
              : 'Try adjusting your filters or explore other botanical categories.'}
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="px-6 py-2.5 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#23471f] transition-colors"
          >
            {t.catalog.clearFilters}
          </button>
        </div>
      )}
    </div>
  );
};
