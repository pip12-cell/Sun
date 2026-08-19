import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight, Sparkles, Tag } from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import { sanitizeImageUrl } from '../utils/sanitizeImageUrl';
import { motion, AnimatePresence } from 'motion/react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    cartDiscount,
    cartShipping,
    cartTotal,
    cartCount,
    freeShippingProgress,
    amountLeftForFreeShipping,
    currency,
    settings,
    language,
    t,
    activeCoupon,
    applyCoupon,
    removeCoupon,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; success: boolean } | null>(null);
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const navigate = useNavigate();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput);
    setCouponMessage({ text: res.message, success: res.success });
    if (res.success) {
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="cart-drawer-overlay"
        className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs"
      >
        <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

        <div className="fixed inset-y-0 right-0 rtl:right-auto rtl:left-0 max-w-full flex pl-10 rtl:pl-0 rtl:pr-10">
          <motion.div
            initial={{ x: isAr ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isAr ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l rtl:border-l-0 rtl:border-r border-[#2D5A27]/10"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-[#FAFAF8]">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#2D5A27]" />
                <h3 className="font-serif-luxury text-xl font-bold text-[#1C241E]">
                  {t.cart.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-xs font-bold">
                  {cartCount}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedVariant || 'def'}`}
                    className="flex gap-3.5 p-3 rounded-2xl bg-white border border-stone-100 shadow-xs hover:border-[#2D5A27]/20 transition-all"
                  >
                    {/* Item Image */}
                    <img
                      src={sanitizeImageUrl(item.product.images[0])}
                      alt={item.product.name[language]}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-stone-50 shrink-0"
                    />

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          to={`/product/${item.product.id}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-xs sm:text-sm font-bold text-[#1C241E] hover:text-[#2D5A27] transition-colors line-clamp-1"
                        >
                          {item.product.name[language]}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          title={t.cart.removeItem}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-bold text-[#2D5A27]">
                          {formatPrice(item.product.price * item.quantity, currency, settings.currencies, language)}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-stone-600 hover:text-[#2D5A27]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-stone-600 hover:text-[#2D5A27]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-[#1C241E] text-base mb-1">{t.cart.emptyTitle}</h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto mb-6">
                    {t.cart.emptySubtitle}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#23471f] transition-all"
                  >
                    {t.cart.continueShopping}
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Checkout & Summary Footer */}
            {cart.length > 0 && (
              <div className="p-5 sm:p-6 bg-[#FAFAF8] border-t border-stone-200 space-y-4">
                {/* Totals Breakdown */}
                <div className="space-y-2 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>{t.cart.subtotal}</span>
                    <span className="font-semibold text-stone-900">
                      {formatPrice(cartSubtotal, currency, settings.currencies, language)}
                    </span>
                  </div>

                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>{t.cart.discount}</span>
                      <span>-{formatPrice(cartDiscount, currency, settings.currencies, language)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>{t.cart.shipping}</span>
                    <span className="font-semibold text-stone-900">
                      {cartShipping === 0
                        ? t.cart.freeShipping
                        : formatPrice(cartShipping, currency, settings.currencies, language)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm sm:text-base font-bold text-[#1C241E] pt-2 border-t border-stone-200">
                    <span>{t.cart.total}</span>
                    <span className="text-[#2D5A27]">
                      {formatPrice(cartTotal, currency, settings.currencies, language)}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  id="cart-drawer-checkout-btn"
                  onClick={handleProceedToCheckout}
                  className="w-full py-4 px-4 rounded-2xl bg-[#2D5A27] text-white hover:bg-[#23471f] font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#2D5A27]/20 active:scale-[0.99]"
                >
                  <span>{t.cart.proceedToCheckout}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
