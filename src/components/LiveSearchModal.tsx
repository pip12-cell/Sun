import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { Search, X, Star, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import { sanitizeImageUrl } from '../utils/sanitizeImageUrl';
import { motion, AnimatePresence } from 'motion/react';

export const LiveSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, products, categories, language, currency, settings, t } =
    useStore();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isAr = language === 'ar';

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Live instant search across Arabic & English names, descriptions, ingredients, and categories
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return products.filter((p) => {
      const nameAr = p.name.ar.toLowerCase();
      const nameEn = p.name.en.toLowerCase();
      const descAr = p.description.ar.toLowerCase();
      const descEn = p.description.en.toLowerCase();
      const ingAr = p.ingredients.ar.toLowerCase();
      const ingEn = p.ingredients.en.toLowerCase();

      // Check category name as well
      const cat = categories.find((c) => c.id === p.categoryId);
      const catAr = cat?.name.ar.toLowerCase() || '';
      const catEn = cat?.name.en.toLowerCase() || '';

      return (
        nameAr.includes(q) ||
        nameEn.includes(q) ||
        descAr.includes(q) ||
        descEn.includes(q) ||
        ingAr.includes(q) ||
        ingEn.includes(q) ||
        catAr.includes(q) ||
        catEn.includes(q)
      );
    });
  }, [query, products, categories]);

  if (!isSearchOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="live-search-modal"
        className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 md:p-12 flex items-start justify-center"
      >
        <div className="fixed inset-0" onClick={() => setIsSearchOpen(false)} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#2D5A27]/20 z-10"
        >
          {/* Search Input Bar */}
          <div className="p-4 sm:p-6 border-b border-stone-100 flex items-center gap-3 bg-[#FAFAF8]">
            <Search className="w-5 h-5 text-[#2D5A27] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isAr ? 'ابحثي عن سيروم، غسول، مرطب، مكونات...' : 'Search serums, creams, cleansers, ingredients...'}
              className="flex-1 bg-transparent text-sm sm:text-base font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-500 hover:bg-stone-200/60 transition-colors"
            >
              {isAr ? 'إغلاق' : 'ESC'}
            </button>
          </div>

          {/* Quick Category Chips if no query */}
          {!query && (
            <div className="p-6">
              <div className="flex items-center gap-1.5 text-xs text-stone-400 font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{isAr ? 'التصنيفات الرائجة:' : 'Popular Categories:'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setQuery(cat.name[language])}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-50 hover:bg-[#2D5A27]/10 hover:text-[#2D5A27] border border-stone-200 text-xs font-semibold text-stone-700 transition-colors"
                  >
                    {cat.name[language]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results List */}
          {query && (
            <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-3">
              {searchResults.length > 0 ? (
                <>
                  <div className="text-xs text-stone-500 font-semibold mb-2">
                    {isAr ? `نتائج البحث (${searchResults.length})` : `Found ${searchResults.length} results`}
                  </div>
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#FAFAF8] border border-transparent hover:border-[#2D5A27]/15 transition-all group"
                    >
                      <img
                        src={sanitizeImageUrl(product.images[0])}
                        alt={product.name[language]}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-xl object-cover bg-stone-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[#1C241E] group-hover:text-[#2D5A27] transition-colors truncate">
                          {product.name[language]}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-[#2D5A27]">
                            {formatPrice(product.price, currency, settings.currencies, language)}
                          </span>
                          <div className="flex items-center text-[#D4AF37] text-[11px]">
                            <Star className="w-3 h-3 fill-[#D4AF37] mr-1" />
                            <span>{product.rating}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#2D5A27] opacity-0 group-hover:opacity-100 transition-opacity">
                        {isAr ? '←' : '→'}
                      </span>
                    </Link>
                  ))}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm font-semibold text-stone-600 mb-1">
                    {isAr ? 'لم نجد نتائج مطابقة لبحثكِ' : 'No matching botanical products found'}
                  </p>
                  <p className="text-xs text-stone-400">
                    {isAr ? 'جربي البحث بكلمات أخرى مثل "سيروم" أو "ترطيب"' : 'Try searching for "serum", "cleanse", or "hydra"'}
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
