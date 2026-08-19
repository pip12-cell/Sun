import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { X, Star, ShoppingBag, Heart, Check, ArrowUpRight } from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import { sanitizeImageUrl } from '../utils/sanitizeImageUrl';
import { motion, AnimatePresence } from 'motion/react';

export const ProductModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    language,
    currency,
    settings,
    t,
    addToCart,
    toggleWishlist,
    isInWishlist,
  } = useStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const isFavorited = isInWishlist(quickViewProduct.id);
  const images = quickViewProduct.images && quickViewProduct.images.length > 0
    ? quickViewProduct.images
    : [''];

  return (
    <AnimatePresence>
      <div
        id="product-quickview-modal"
        className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-[#2D5A27]/20 flex flex-col md:flex-row"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Gallery */}
          <div className="md:w-1/2 p-6 bg-stone-50 flex flex-col justify-between">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm mb-4">
              <img
                src={sanitizeImageUrl(images[selectedImageIndex])}
                alt={quickViewProduct.name[language]}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-[#2D5A27] ring-2 ring-[#2D5A27]/20'
                        : 'border-stone-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={sanitizeImageUrl(img)}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Rating & Wishlist */}
              <div className="flex items-center justify-between mb-2">
                {quickViewProduct.reviewCount > 0 ? (
                  <div className="flex items-center gap-1.5 text-[#D4AF37]">
                    <Star className="w-4 h-4 fill-[#D4AF37]" />
                    <span className="text-sm font-bold text-stone-800">{quickViewProduct.rating}</span>
                    <span className="text-xs text-stone-400">({quickViewProduct.reviewCount} {t.productDetail.customerReviews})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                    <Star className="w-4 h-4 text-stone-300" />
                    <span>{language === 'ar' ? 'منتج جديد' : 'New Product'}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => toggleWishlist(quickViewProduct.id)}
                  className={`p-2 rounded-xl transition-colors ${
                    isFavorited ? 'text-rose-500 bg-rose-50' : 'text-stone-400 hover:text-rose-500 bg-stone-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              {/* Title */}
              <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#1C241E] mb-3 leading-snug">
                {quickViewProduct.name[language]}
              </h3>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-bold text-[#2D5A27]">
                  {formatPrice(quickViewProduct.price, currency, settings.currencies, language)}
                </span>
                {quickViewProduct.compareAtPrice && quickViewProduct.compareAtPrice > quickViewProduct.price && (
                  <span className="text-sm text-stone-400 line-through">
                    {formatPrice(quickViewProduct.compareAtPrice, currency, settings.currencies, language)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6 line-clamp-3">
                {quickViewProduct.description[language]}
              </p>
            </div>

            {/* Actions & Quantity */}
            <div className="pt-4 border-t border-stone-100 space-y-4">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-stone-600 hover:bg-white"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-stone-600 hover:bg-white"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  type="button"
                  onClick={() => {
                    addToCart(quickViewProduct, quantity);
                    setQuickViewProduct(null);
                  }}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-[#2D5A27] text-white hover:bg-[#23471f] font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-[#2D5A27]/20"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t.catalog.addToCart}</span>
                </button>
              </div>

              {/* View Full Page Link */}
              <Link
                to={`/product/${quickViewProduct.id}`}
                onClick={() => setQuickViewProduct(null)}
                className="w-full text-center text-xs font-bold text-[#2D5A27] hover:underline flex items-center justify-center gap-1"
              >
                <span>{t.catalog.viewDetails}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
