import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { ProductCard } from '../components/ProductCard';
import { Heart, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { wishlist, products, addToCart, clearWishlist, language, t, showToast } = useStore();
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleMoveAllToCart = () => {
    wishlistProducts.forEach((p) => addToCart(p, 1));
    showToast(
      isAr ? 'تمت إضافة المنتجات' : 'Products Added',
      isAr ? 'تم نقل جميع المنتجات المفضلة إلى حقيبة التسوق' : 'Moved all favorites to shopping bag',
      'success'
    );
  };

  return (
    <div id="wishlist-page-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold mb-3">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>{t.nav.wishlist}</span>
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1C241E]">
            {isAr ? 'قائمة رغباتي ومنتجاتي المفضلة' : 'My Saved Botanical Favorites'}
          </h1>
        </div>

        {wishlistProducts.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleMoveAllToCart}
              className="px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white hover:bg-[#23471f] text-xs font-bold transition-colors flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isAr ? 'نقل الكل للحقيبة' : 'Move All to Bag'}</span>
            </button>
            <button
              type="button"
              onClick={clearWishlist}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-semibold transition-colors"
            >
              {isAr ? 'مسح القائمة' : 'Clear List'}
            </button>
          </div>
        )}
      </div>

      {/* Grid or Empty state */}
      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-serif-luxury text-2xl font-bold text-[#1C241E] mb-2">
            {isAr ? 'قائمة المفضلة فارغة' : 'Your Wishlist is Empty'}
          </h3>
          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            {isAr
              ? 'احفظي منتجاتكِ المفضلة بضغطة زر لتعودي إليها في أي وقت وتكملي روتينكِ النباتي.'
              : 'Save your favorite elixirs and treatments to easily revisit your personalized ritual.'}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#23471f] transition-all shadow-md"
          >
            <span>{isAr ? 'استكشفي المنتجات الآن' : 'Explore Products'}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};
