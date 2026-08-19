import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { Product } from '../types';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import { sanitizeImageUrl } from '../utils/sanitizeImageUrl';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    t,
    language,
    currency,
    settings,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setQuickViewProduct,
  } = useStore();

  const isAr = language === 'ar';
  const isFavorited = isInWishlist(product.id);
  const primaryImage = sanitizeImageUrl(product.images[0]);
  const hoverImage = product.images[1] ? sanitizeImageUrl(product.images[1]) : primaryImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-[#2D5A27]/10 p-3 sm:p-4 hover:border-[#2D5A27]/30 hover:shadow-xl transition-all duration-300"
    >
      {/* Badges Container */}
      <div className="absolute top-5 left-5 right-5 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1.5 items-start">
          {product.discount && product.discount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-[#D4AF37] text-white text-[10px] sm:text-xs font-bold tracking-wider shadow-sm">
              {product.discount}% {t.catalog.discount}
            </span>
          )}
          {product.newProduct && (
            <span className="px-2.5 py-1 rounded-full bg-[#2D5A27] text-white text-[10px] sm:text-xs font-bold tracking-wider shadow-sm">
              {t.catalog.new}
            </span>
          )}
          {product.bestSeller && !product.newProduct && (
            <span className="px-2.5 py-1 rounded-full bg-[#3E7B35] text-white text-[10px] sm:text-xs font-bold tracking-wider shadow-sm">
              {t.catalog.bestSellerBadge}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center pointer-events-auto transition-all backdrop-blur-md shadow-sm ${
            isFavorited
              ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-200'
              : 'bg-white/90 text-stone-600 hover:text-rose-600 hover:bg-white'
          }`}
          title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isFavorited ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Product Image Stage */}
      <Link
        to={`/product/${product.id}`}
        className="relative block w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-stone-100 mb-3 sm:mb-4 group-hover:scale-[1.01] transition-transform duration-300"
      >
        <img
          src={primaryImage}
          alt={product.name[language]}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover object-center transition-opacity duration-500 group-hover:opacity-0"
        />
        <img
          src={hoverImage}
          alt={product.name[language]}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />

        {/* Quick View overlay button */}
        <div className="absolute inset-x-3 bottom-3 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-white/95 backdrop-blur-md text-[#2D5A27] text-xs font-bold hover:bg-[#2D5A27] hover:text-white transition-colors shadow-md flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t.catalog.quickView}</span>
          </button>
        </div>
      </Link>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          {product.reviewCount > 0 ? (
            <div className="flex items-center gap-1 mb-1.5">
              <div className="flex items-center text-[#D4AF37]">
                <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
              </div>
              <span className="text-xs font-bold text-stone-800">{product.rating}</span>
              <span className="text-[11px] text-stone-400">({product.reviewCount})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 mb-1.5 text-stone-400 text-[11px]">
              <Star className="w-3 h-3 text-stone-300" />
              <span>{isAr ? 'منتج جديد' : 'New Product'}</span>
            </div>
          )}

          {/* Product Name */}
          <Link
            to={`/product/${product.id}`}
            className="block text-xs sm:text-sm font-bold text-[#1C241E] hover:text-[#2D5A27] transition-colors line-clamp-2 leading-snug mb-2"
          >
            {product.name[language]}
          </Link>
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-sm sm:text-base text-[#2D5A27]">
                {formatPrice(product.price, currency, settings.currencies, language)}
              </span>
            </div>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-[11px] text-stone-400 line-through">
                {formatPrice(product.compareAtPrice, currency, settings.currencies, language)}
              </span>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product, 1);
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#2D5A27] text-white hover:bg-[#23471f] transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm active:scale-95 shrink-0"
            title={t.catalog.addToCart}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden md:inline">{t.catalog.addToCart}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
