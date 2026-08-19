import React, { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { Star, MessageSquare, Plus, CheckCircle2, Sparkles, Filter } from 'lucide-react';

export const ReviewsPage: React.FC = () => {
  const { reviews, products, addReview, language, t } = useStore();
  const isAr = language === 'ar';

  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredReviews = useMemo(() => {
    if (selectedRatingFilter === 0) return reviews;
    return reviews.filter((r) => r.rating === selectedRatingFilter);
  }, [reviews, selectedRatingFilter]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 5;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    await addReview({
      productId: selectedProduct,
      customerName: name,
      rating,
      comment,
    });
    setName('');
    setComment('');
    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  return (
    <div id="reviews-page-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-xs font-bold mb-4">
          <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
          <span>{isAr ? 'تقييمات عميلاتنا' : 'Verified Community Reviews'}</span>
        </div>
        <h1 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-[#1C241E] mb-3">
          {isAr ? 'تجارب حقيقية مع Sun Beauty' : 'Real Glow Stories'}
        </h1>
        <p className="text-xs sm:text-base text-stone-600">
          {isAr
            ? 'نعتز بثقة آلاف العميلات اللواتي اختبرن النقاء والفعالية الاستثنائية لمنتجاتنا.'
            : 'Thousands of women have transformed their daily ritual. Read their real feedback.'}
        </p>
      </div>

      {/* Stats and Action Strip */}
      <div className="bg-[#FAFAF8] rounded-3xl border border-[#2D5A27]/10 p-6 sm:p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="text-center sm:text-left rtl:sm:text-right">
            <span className="font-serif-luxury text-4xl sm:text-5xl font-bold text-[#2D5A27]">
              {avgRating}
            </span>
            <div className="flex items-center justify-center sm:justify-start text-[#D4AF37] my-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
              ))}
            </div>
            <span className="text-xs text-stone-500">
              {isAr ? `بناءً على ${reviews.length} تقييم حقيقي` : `Based on ${reviews.length} real reviews`}
            </span>
          </div>
        </div>

        {/* Rating filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedRatingFilter(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedRatingFilter === 0
                ? 'bg-[#2D5A27] text-white'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {isAr ? 'جميع التقييمات' : 'All Reviews'}
          </button>
          {[5, 4, 3].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setSelectedRatingFilter(num)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                selectedRatingFilter === num
                  ? 'bg-[#2D5A27] text-white'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span>{num}</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </button>
          ))}
        </div>

        {/* Write a review button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 rounded-2xl bg-[#2D5A27] text-white hover:bg-[#23471f] text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-[#2D5A27]/20"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'أضيفي تقييمكِ الآن' : 'Write a Review'}</span>
        </button>
      </div>

      {/* Reviews Grid or Empty State */}
      {filteredReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredReviews.map((rev) => {
            const prod = products.find((p) => p.id === rev.productId);
            return (
              <div
                key={rev.id}
                className="p-6 rounded-3xl bg-white border border-[#2D5A27]/10 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-[#D4AF37]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                      ))}
                    </div>
                    <span className="text-[11px] text-stone-400">{rev.date}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic mb-4">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#1C241E] block">
                      {rev.customerName}
                    </span>
                    {prod && (
                      <span className="text-[11px] text-[#3E7B35] font-medium block truncate max-w-[180px]">
                        {prod.name[language]}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    {isAr ? 'موثق ✓' : 'Verified ✓'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-stone-300 space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <Star className="w-8 h-8 fill-amber-400" />
          </div>
          <div>
            <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
              {isAr ? 'لا توجد تقييمات حالياً' : 'No Reviews Yet'}
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
              {isAr
                ? 'تم إفراغ التقييمات السابقة. يمكنكِ الآن إضافة تجارب وتقييمات المنتجات بنفسك من لوحة التحكم أو عبر الزر أدناه.'
                : 'All reviews have been cleared. You can now add your own verified reviews directly from the admin panel or here.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-[#2D5A27] text-white hover:bg-[#23471f] text-xs font-bold transition-all inline-flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة تقييم جديد' : 'Add New Review'}</span>
          </button>
        </div>
      )}

      {/* Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#2D5A27]/20 relative">
            <h3 className="font-serif-luxury text-xl font-bold text-[#1C241E] mb-4">
              {isAr ? 'شاركينا تجربتكِ اللطيفة' : 'Share Your Experience'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.productDetail.yourName} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#2D5A27]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isAr ? 'المنتج الذي قمتِ بتجربته' : 'Product Reviewed'}
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#2D5A27]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name[language]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.productDetail.yourRating} *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 text-[#D4AF37]"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= rating ? 'fill-[#D4AF37]' : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.productDetail.yourComment} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={isAr ? 'كيف كانت نتائج المنتج على بشرتكِ؟' : 'How did this formulation enhance your skin?'}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#2D5A27]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#2D5A27] text-white text-xs font-bold rounded-xl hover:bg-[#23471f]"
                >
                  {t.productDetail.submitReview}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
