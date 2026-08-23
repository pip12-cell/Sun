import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { PaymentMethod } from '../types';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Tag,
  ArrowLeft,
  ArrowRight,
  Lock,
  Copy,
  Check,
  AlertCircle,
  Smartphone,
  Zap,
} from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import { sanitizeImageUrl } from '../utils/sanitizeImageUrl';

const EGYPT_GOVERNORATES = [
  'القاهرة (Cairo)',
  'الجيزة (Giza)',
  'الإسكندرية (Alexandria)',
  'الدقهلية (Mansoura)',
  'البحر الأحمر (Hurghada)',
  'البحيرة (Beheira)',
  'الفيوم (Fayoum)',
  'الغربية (Tanta)',
  'الإسماعيلية (Ismailia)',
  'المنوفية (Menofia)',
  'المنيا (Minya)',
  'القليوبية (Qalyubia)',
  'الوادي الجديد (New Valley)',
  'السويس (Suez)',
  'أسوان (Aswan)',
  'أسيوط (Assiut)',
  'بني سويف (Beni Suef)',
  'بورسعيد (Port Said)',
  'دمياط (Damietta)',
  'الشرقية (Sharqia)',
  'جنوب سيناء (South Sinai)',
  'كفر الشيخ (Kafr El Sheikh)',
  'مطروح (Matrouh)',
  'الأقصر (Luxor)',
  'قنا (Qena)',
  'شمال سيناء (North Sinai)',
  'سوهاج (Sohag)',
];

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartDiscount,
    cartShipping,
    cartTotal,
    currency,
    settings,
    language,
    t,
    activeCoupon,
    applyCoupon,
    removeCoupon,
    createOrder,
    clearCart,
  } = useStore();

  const navigate = useNavigate();
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState(EGYPT_GOVERNORATES[0]);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vodafone_cash');
  const [senderTransferNumber, setSenderTransferNumber] = useState('');
  const [transferError, setTransferError] = useState('');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (text: string, type: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      // ignore
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMsg({ text: res.message, success: res.success });
    if (res.success) setCouponInput('');
  };

  // داخل دالة إرسال الطلب في CheckoutPage.tsx

const handlePlaceOrder = async () => {
  const newOrder: Order = {
    id: orderId, // مثل SB-274190
    items: cart,
    total: finalTotal,
    customerName: formData.fullName,
    shippingAddress: formData,
    paymentMethod: selectedPaymentMethod,
    status: 'new',
    createdAt: new Date().toISOString()
  };

  try {
    // 🔴 أهم سطر: حفظ الطلب فعلياً في قاعدة بيانات Firebase
    await firebaseService.saveOrder(newOrder);

    // تفريغ السلة والتوجيه لصفحة النجاح
    clearCart();
    navigate(`/order-success/${newOrder.id}`);
  } catch (error) {
    console.error("Failed to save order to Firebase:", error);
  }
};

    // Strict validation for Vodafone Cash and InstaPay
    if (paymentMethod === 'vodafone_cash') {
      if (!senderTransferNumber.trim()) {
        setTransferError(
          isAr
            ? '⚠️ يرجى إدخال رقم محفظة فودافون كاش التي قمتِ بالتحويل منها لتأكيد طلبكِ.'
            : '⚠️ Please enter the sender Vodafone Cash wallet number to confirm your order.'
        );
        return;
      }
    } else if (paymentMethod === 'instapay') {
      if (!senderTransferNumber.trim()) {
        setTransferError(
          isAr
            ? '⚠️ يرجى إدخال الحساب أو الرقم المحوّل منه عبر إنستاباي لتأكيد طلبكِ.'
            : '⚠️ Please enter your InstaPay username or account/phone number to confirm your order.'
        );
        return;
      }
    }

    setTransferError('');
    setIsSubmitting(true);

    const newOrder = await createOrder({
      customerName: fullName,
      phone: phone,
      governorate,
      city,
      address,
      notes,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0] || '',
      })),
      subtotal: cartSubtotal,
      discount: cartDiscount,
      shipping: cartShipping,
      total: cartTotal,
      currency,
      paymentMethod,
      senderTransferNumber:
        paymentMethod === 'vodafone_cash' || paymentMethod === 'instapay'
          ? senderTransferNumber.trim()
          : undefined,
      couponCode: activeCoupon?.code,
    });

    clearCart();
    setIsSubmitting(false);
    navigate(`/order-success/${newOrder.id}`);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif-luxury text-2xl font-bold text-[#1C241E] mb-2">
          {t.cart.emptyTitle}
        </h2>
        <p className="text-xs text-stone-500 mb-6">{t.cart.emptySubtitle}</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2D5A27] text-white text-xs font-bold"
        >
          {t.cart.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div id="checkout-page-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="mb-10 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-xs font-bold mb-3">
          <Lock className="w-3.5 h-3.5" />
          <span>{isAr ? 'دفع آمن ومشفر 100%' : '100% Encrypted & Safe Checkout'}</span>
        </div>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1C241E]">
          {t.checkout.title}
        </h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Customer and Shipping Information */}
        <div className="lg:col-span-7 space-y-8">
          {/* Customer Info */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2D5A27]/10 shadow-sm space-y-6">
            <h3 className="font-serif-luxury text-xl font-bold text-[#1C241E] flex items-center gap-2 border-b border-stone-100 pb-3">
              <Truck className="w-5 h-5 text-[#2D5A27]" />
              <span>{t.checkout.shippingInfo}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {t.checkout.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isAr ? 'مثال: سارة أحمد' : 'e.g. Sarah Ahmed'}
                  className="w-full px-3.5 py-2.5 text-xs border border-stone-200 rounded-xl bg-[#FAFAF8] focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {t.checkout.phone} *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={isAr ? 'مثال: 01012345678' : 'e.g. 01012345678'}
                  className="w-full px-3.5 py-2.5 text-xs border border-stone-200 rounded-xl bg-[#FAFAF8] focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {t.checkout.governorate} *
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-stone-200 rounded-xl bg-[#FAFAF8] focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                >
                  {EGYPT_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {t.checkout.city} *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={isAr ? 'المنطقة أو الحي' : 'District or area'}
                  className="w-full px-3.5 py-2.5 text-xs border border-stone-200 rounded-xl bg-[#FAFAF8] focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.checkout.address} *
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={isAr ? 'اسم الشارع، رقم العمارة، رقم الشقة أو علامة مميزة' : 'Street name, building number, apartment'}
                className="w-full px-3.5 py-2.5 text-xs border border-stone-200 rounded-xl bg-[#FAFAF8] focus:bg-white focus:outline-none focus:border-[#2D5A27]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.checkout.notes}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isAr ? 'أي ملاحظات لمندوب الشحن...' : 'Special delivery instructions...'}
                className="w-full px-3.5 py-2.5 text-xs border border-stone-200 rounded-xl bg-[#FAFAF8] focus:bg-white focus:outline-none focus:border-[#2D5A27]"
              />
            </div>
          </div>

          {/* Payment Methods Selection */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2D5A27]/10 shadow-sm space-y-5">
            <h3 className="font-serif-luxury text-xl font-bold text-[#1C241E] flex items-center gap-2 border-b border-stone-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-[#2D5A27]" />
              <span>{t.checkout.paymentMethod}</span>
            </h3>

            {/* Error Message if transfer number is missing */}
            {transferError && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* Vodafone Cash Option */}
              <div
                className={`rounded-2xl border transition-all overflow-hidden ${
                  paymentMethod === 'vodafone_cash'
                    ? 'border-[#2D5A27] bg-[#2D5A27]/5 ring-2 ring-[#2D5A27]/10'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <label className="flex items-center justify-between p-4 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="vodafone_cash"
                      checked={paymentMethod === 'vodafone_cash'}
                      onChange={() => {
                        setPaymentMethod('vodafone_cash');
                        setTransferError('');
                      }}
                      className="accent-[#2D5A27]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#1C241E]">
                        {t.checkout.paymentMethods.vodafoneCash}
                      </span>
                      <p className="text-[11px] text-stone-500">
                        {isAr ? 'تحويل فوري لمحفظة فودافون كاش الرسمية' : 'Direct mobile wallet transfer'}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg">📱</span>
                </label>

                {/* Sub-panel when Vodafone Cash is selected */}
                {paymentMethod === 'vodafone_cash' && (
                  <div className="p-4 pt-2 border-t border-[#2D5A27]/15 bg-white/70 space-y-4">
                    {/* Vodafone Cash Receiver Box */}
                    <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-rose-900 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-rose-700" />
                          {isAr ? 'رقم محفظة فودافون كاش للتحويل:' : 'Vodafone Cash Wallet to transfer to:'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(settings.vodafoneCashNumber || '01012345678', 'vodafone')}
                          className="px-2.5 py-1 rounded-xl bg-white border border-rose-200 hover:bg-rose-100/50 text-[11px] font-bold text-rose-800 flex items-center gap-1 transition-all shadow-2xs"
                        >
                          {copiedType === 'vodafone' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">{isAr ? 'تم النسخ ✓' : 'Copied ✓'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-rose-700" />
                              <span>{isAr ? 'نسخ الرقم' : 'Copy Number'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <span className="font-mono text-base font-bold text-rose-950 tracking-wider" dir="ltr">
                          {settings.vodafoneCashNumber || '01012345678'}
                        </span>
                        <span className="text-[11px] text-stone-600 font-semibold">
                          {isAr ? 'المبلغ المطلوب:' : 'Amount to transfer:'}{' '}
                          <span className="text-[#2D5A27] font-bold">
                            {formatPrice(cartTotal, currency, settings.currencies, language)}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Sender Transfer Number Input (MANDATORY) */}
                    <div>
                      <label className="block text-xs font-bold text-stone-900 mb-1.5">
                        {isAr
                          ? 'الرقم الذي ستقومين بالتحويل منه (مطلوب لتأكيد الطلب) *'
                          : 'Sender Vodafone Cash wallet phone number (Required) *'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={senderTransferNumber}
                        onChange={(e) => {
                          setSenderTransferNumber(e.target.value);
                          if (transferError) setTransferError('');
                        }}
                        placeholder={isAr ? 'مثال: 01012345678' : 'e.g. 01012345678'}
                        className={`w-full px-3.5 py-2.5 text-xs border rounded-xl bg-white focus:outline-none transition-all ${
                          transferError
                            ? 'border-rose-500 ring-2 ring-rose-200'
                            : 'border-stone-300 focus:border-[#2D5A27]'
                        }`}
                      />
                      <p className="text-[10px] text-stone-500 mt-1">
                        {isAr
                          ? '🔒 لن يتم اعتماد الطلب إلا بعد كتابة الرقم للتحقق الفوري من استلام التحويل.'
                          : '🔒 Order will only be processed once this sender phone number is provided to verify payment.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* InstaPay Option */}
              <div
                className={`rounded-2xl border transition-all overflow-hidden ${
                  paymentMethod === 'instapay'
                    ? 'border-[#2D5A27] bg-[#2D5A27]/5 ring-2 ring-[#2D5A27]/10'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <label className="flex items-center justify-between p-4 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="instapay"
                      checked={paymentMethod === 'instapay'}
                      onChange={() => {
                        setPaymentMethod('instapay');
                        setTransferError('');
                      }}
                      className="accent-[#2D5A27]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#1C241E]">
                        {t.checkout.paymentMethods.instapay}
                      </span>
                      <p className="text-[11px] text-stone-500">
                        {isAr ? 'تحويل لحظي عن طريق شبكة إنستاباي InstaPay' : 'Instant bank transfer via InstaPay IPN'}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg">⚡</span>
                </label>

                {/* Sub-panel when InstaPay is selected */}
                {paymentMethod === 'instapay' && (
                  <div className="p-4 pt-2 border-t border-[#2D5A27]/15 bg-white/70 space-y-4">
                    {/* InstaPay Receiver Box */}
                    <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-indigo-700" />
                          {isAr ? 'معرف / رقم إنستاباي للتحويل إليه:' : 'InstaPay handle/account to transfer to:'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(settings.instapayAddress || '01012345678@instapay', 'instapay')}
                          className="px-2.5 py-1 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-100/50 text-[11px] font-bold text-indigo-800 flex items-center gap-1 transition-all shadow-2xs"
                        >
                          {copiedType === 'instapay' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">{isAr ? 'تم النسخ ✓' : 'Copied ✓'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-indigo-700" />
                              <span>{isAr ? 'نسخ الحساب' : 'Copy Handle'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <span className="font-mono text-base font-bold text-indigo-950 tracking-wider" dir="ltr">
                          {settings.instapayAddress || '01012345678@instapay'}
                        </span>
                        <span className="text-[11px] text-stone-600 font-semibold">
                          {isAr ? 'المبلغ المطلوب:' : 'Amount to transfer:'}{' '}
                          <span className="text-[#2D5A27] font-bold">
                            {formatPrice(cartTotal, currency, settings.currencies, language)}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Sender InstaPay Account/Phone Input (MANDATORY) */}
                    <div>
                      <label className="block text-xs font-bold text-stone-900 mb-1.5">
                        {isAr
                          ? 'معرف أو رقم الحساب / الهاتف المحوّل منه عبر إنستاباي (مطلوب لتأكيد الطلب) *'
                          : 'Sender InstaPay username or account/phone number (Required) *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={senderTransferNumber}
                        onChange={(e) => {
                          setSenderTransferNumber(e.target.value);
                          if (transferError) setTransferError('');
                        }}
                        placeholder={isAr ? 'مثال: username@instapay أو 01012345678' : 'e.g. username@instapay or 01012345678'}
                        className={`w-full px-3.5 py-2.5 text-xs border rounded-xl bg-white focus:outline-none transition-all ${
                          transferError
                            ? 'border-rose-500 ring-2 ring-rose-200'
                            : 'border-stone-300 focus:border-[#2D5A27]'
                        }`}
                      />
                      <p className="text-[10px] text-stone-500 mt-1">
                        {isAr
                          ? '🔒 لن يتم اعتماد الطلب إلا بعد كتابة الحساب/الرقم المحوّل منه لمطابقة المعاملة فوراً.'
                          : '🔒 Order confirmation requires your transfer handle/number for swift verification.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2D5A27]/10 shadow-sm space-y-6">
            <h3 className="font-serif-luxury text-xl font-bold text-[#1C241E] border-b border-stone-100 pb-3">
              {t.checkout.orderSummary}
            </h3>

            {/* Items Mini-list */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <img
                    src={sanitizeImageUrl(item.product.images[0])}
                    alt={item.product.name[language]}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#1C241E] truncate">
                      {item.product.name[language]}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      {item.quantity} ×{' '}
                      {formatPrice(item.product.price, currency, settings.currencies, language)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#2D5A27]">
                    {formatPrice(
                      item.product.price * item.quantity,
                      currency,
                      settings.currencies,
                      language
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 text-xs text-stone-600 pt-3 border-t border-stone-100">
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

              <div className="flex justify-between text-base font-bold text-[#1C241E] pt-3 border-t border-stone-200">
                <span>{t.cart.total}</span>
                <span className="text-xl font-bold text-[#2D5A27]">
                  {formatPrice(cartTotal, currency, settings.currencies, language)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                id="checkout-submit-btn"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-[#2D5A27] text-white hover:bg-[#23471f] font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#2D5A27]/20 active:scale-[0.99]"
              >
                <span>{isSubmitting ? (isAr ? 'جاري التأكيد...' : 'Processing...') : t.checkout.placeOrder}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
