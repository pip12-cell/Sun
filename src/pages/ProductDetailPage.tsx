import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { ProductCard } from '../components/ProductCard';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Leaf,
  Plus,
  Minus,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import { sanitizeImageUrl } from '../utils/sanitizeImageUrl';
import { motion } from 'motion/react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    products,
    categories,
    reviews,
    language,
    currency,
    settings,
    t,
    addToCart,
    toggleWishlist,
    isInWishlist,
    addReview,
    setIsCartOpen,
  } = useStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'ing' | 'how' | 'benefits' | 'rev'>('desc');

  // Review Form state
  const [revName, setRevName] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const product = products.find((p) => p.id === id);
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedImageIndex(0);
    setQuantity(1);
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">
          {isAr ? 'المنتج غير موجود أو تمت إزالته' : 'Product Not Found'}
        </h2>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2D5A27] text-white text-sm font-bold"
        >
          {isAr ? 'تصفح جميع المنتجات' : 'Explore All Products'}
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const category = categories.find((c) => c.id === product.categoryId);
  const productReviews = reviews.filter((r) => r.productId === product.id);
  const relatedProducts = products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

  const images = product.images && product.images.length > 0 ? product.images : [''];

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName.trim() || !revComment.trim()) return;

    setIsSubmittingReview(true);
    await addReview({
      productId: product.id,
      customerName: revName,
      rating: revRating,
      comment: revComment,
    });
    setRevName('');
    setRevComment('');
    setIsSubmittingReview(false);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setIsCartOpen(true);
  };

  return (
    <div id="product-detail-page-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 mb-8 overflow-x-auto pb-1">
        <Link to="/" className="hover:text-[#2D5A27]">
          {t.nav.home}
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-[#2D5A27]">
          {t.nav.products}
        </Link>
        {category && (
          <>
            <span>/</span>
            <Link to={`/products?category=${category.id}`} className="hover:text-[#2D5A27]">
              {category.name[language]}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="font-semibold text-stone-800 truncate">{product.name[language]}</span>
      </nav>

      {/* Main Grid: Gallery + Purchasing Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        {/* Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-[#2D5A27]/10 shadow-lg">
            <img
              src={sanitizeImageUrl(images[selectedImageIndex])}
              alt={product.name[language]}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-all duration-300"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
              <div className="flex flex-col gap-1.5">
                {product.discount && product.discount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-[#D4AF37] text-white text-xs font-bold shadow-md">
                    {product.discount}% {t.catalog.discount}
                  </span>
                )}
                {product.newProduct && (
                  <span className="px-3 py-1 rounded-full bg-[#2D5A27] text-white text-xs font-bold shadow-md">
                    {t.catalog.new}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[#2D5A27] ring-2 ring-[#2D5A27]/20 shadow-md'
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

        {/* Purchasing Controls */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            {/* Category tag & Wishlist */}
            <div className="flex items-center justify-between mb-3">
              {category && (
                <span className="text-xs font-bold text-[#3E7B35] uppercase tracking-wider">
                  {category.name[language]}
                </span>
              )}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 rounded-full border transition-all ${
                  isFavorited
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-stone-200 text-stone-500 hover:text-rose-600 hover:border-rose-200'
                }`}
                title={t.nav.wishlist}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Title */}
            <h1 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C241E] mb-4 leading-tight">
              {product.name[language]}
            </h1>

            {/* Rating summary */}
            {product.reviewCount > 0 ? (
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-1 text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'fill-[#D4AF37]' : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-stone-800">{product.rating}</span>
                <span className="text-xs text-stone-500">
                  ({product.reviewCount} {t.productDetail.customerReviews})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-stone-100 text-stone-400 text-xs">
                <Star className="w-4 h-4 text-stone-300" />
                <span>{isAr ? 'منتج جديد - لم يتم إضافة تقييمات بعد' : 'New Product - No reviews yet'}</span>
              </div>
            )}

            {/* Pricing */}
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#2D5A27]">
                {formatPrice(product.price, currency, settings.currencies, language)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-base sm:text-lg text-stone-400 line-through">
                  {formatPrice(product.compareAtPrice, currency, settings.currencies, language)}
                </span>
              )}
            </div>

            {/* Short highlight */}
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-8">
              {product.description[language]}
            </p>

            {/* Stock status */}
            <div className="flex items-center gap-2 mb-6">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  product.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="text-xs font-semibold text-stone-700">
                {product.stock > 0
                  ? `${t.catalog.inStock} (${product.stock} ${isAr ? 'قطعة متوفرة' : 'items left'})`
                  : t.catalog.outOfStock}
              </span>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-8">
              <div className="flex items-center justify-between border border-stone-200 rounded-2xl bg-stone-50 p-2 sm:w-36">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center font-bold text-stone-700 hover:text-[#2D5A27]"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-sm text-stone-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center font-bold text-stone-700 hover:text-[#2D5A27]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => addToCart(product, quantity)}
                className="flex-1 py-4 px-6 rounded-2xl bg-[#2D5A27] text-white hover:bg-[#23471f] font-semibold text-sm transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-[#2D5A27]/20 active:scale-[0.99]"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{t.catalog.addToCart}</span>
              </button>
            </div>
          </div>

          {/* Delivery & Security Badges */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#FAFAF8] border border-stone-200/80 text-center">
            <div className="flex flex-col items-center">
              <Truck className="w-5 h-5 text-[#2D5A27] mb-1" />
              <span className="text-[11px] font-bold text-stone-800">
                {isAr ? 'شحن فوري' : 'Fast Delivery'}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-[#2D5A27] mb-1" />
              <span className="text-[11px] font-bold text-stone-800">
                {isAr ? 'نباتي أصلي 100%' : '100% Authentic'}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="w-5 h-5 text-[#2D5A27] mb-1" />
              <span className="text-[11px] font-bold text-stone-800">
                {isAr ? 'ضمان الرضا' : 'Satisfaction'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Ingredients, How to Use, Benefits, Reviews */}
      <div className="bg-white rounded-3xl border border-[#2D5A27]/10 p-6 sm:p-10 shadow-sm mb-16">
        {/* Tab Buttons */}
        <div className="flex items-center gap-3 sm:gap-6 border-b border-stone-200 overflow-x-auto pb-4 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('desc')}
            className={`text-sm font-bold pb-2 transition-colors shrink-0 relative ${
              activeTab === 'desc' ? 'text-[#2D5A27]' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {isAr ? 'الوصف الكامل' : 'Description'}
            {activeTab === 'desc' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#2D5A27] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ing')}
            className={`text-sm font-bold pb-2 transition-colors shrink-0 relative ${
              activeTab === 'ing' ? 'text-[#2D5A27]' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {t.productDetail.ingredients}
            {activeTab === 'ing' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#2D5A27] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('how')}
            className={`text-sm font-bold pb-2 transition-colors shrink-0 relative ${
              activeTab === 'how' ? 'text-[#2D5A27]' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {t.productDetail.howToUse}
            {activeTab === 'how' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#2D5A27] rounded-full" />
            )}
          </button>

          {product.benefits && (
            <button
              type="button"
              onClick={() => setActiveTab('benefits')}
              className={`text-sm font-bold pb-2 transition-colors shrink-0 relative ${
                activeTab === 'benefits' ? 'text-[#2D5A27]' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {t.productDetail.benefits}
              {activeTab === 'benefits' && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#2D5A27] rounded-full" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('rev')}
            className={`text-sm font-bold pb-2 transition-colors shrink-0 relative ${
              activeTab === 'rev' ? 'text-[#2D5A27]' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {t.productDetail.customerReviews} ({productReviews.length})
            {activeTab === 'rev' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#2D5A27] rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'desc' && (
            <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed max-w-3xl">
              <p>{product.description[language]}</p>
            </div>
          )}

          {activeTab === 'ing' && (
            <div className="space-y-4 max-w-3xl">
              <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-stone-200">
                <div className="flex items-center gap-2 mb-2 font-bold text-xs text-[#2D5A27]">
                  <Leaf className="w-4 h-4" />
                  <span>{isAr ? 'مكونات نباتية معتمدة' : 'Certified Botanical Actives'}</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {product.ingredients[language]}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'how' && (
            <div className="space-y-4 max-w-3xl">
              <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-stone-200">
                <div className="flex items-center gap-2 mb-2 font-bold text-xs text-[#2D5A27]">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>{isAr ? 'خطوات التطبيق الصحيحة' : 'Application Ritual'}</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {product.howToUse[language]}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'benefits' && product.benefits && (
            <div className="space-y-4 max-w-3xl">
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/50">
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {product.benefits[language]}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'rev' && (
            <div className="space-y-8">
              {/* Existing Reviews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productReviews.length > 0 ? (
                  productReviews.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-xs text-stone-900">{r.customerName}</span>
                          <span className="text-[10px] text-stone-400">{r.date}</span>
                        </div>
                        <div className="flex items-center text-[#D4AF37] mb-2">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                          ))}
                        </div>
                        <p className="text-xs text-stone-700 leading-relaxed">{r.comment}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-500">
                    {isAr ? 'كن أول من يقيّم هذا المنتج الرائع!' : 'Be the first to review this product!'}
                  </p>
                )}
              </div>

              {/* Add Review Form */}
              <div className="pt-6 border-t border-stone-200 max-w-xl">
                <h4 className="font-serif-luxury text-lg font-bold text-[#1C241E] mb-4">
                  {t.productDetail.leaveReviewTitle}
                </h4>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t.productDetail.yourName}
                    </label>
                    <input
                      type="text"
                      required
                      value={revName}
                      onChange={(e) => setRevName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t.productDetail.yourRating}
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRevRating(star)}
                          className="p-1 text-[#D4AF37]"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= revRating ? 'fill-[#D4AF37]' : 'text-stone-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t.productDetail.yourComment}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={revComment}
                      onChange={(e) => setRevComment(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-6 py-2.5 bg-[#2D5A27] text-white text-xs font-bold rounded-xl hover:bg-[#23471f] transition-colors"
                  >
                    {t.productDetail.submitReview}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h3 className="font-serif-luxury text-2xl font-bold text-[#1C241E] mb-6">
            {t.productDetail.relatedProducts}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
