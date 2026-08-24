import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { PaymentMethod } from '../types';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  Lock,
  Copy,
  Check,
  AlertCircle,
  Smartphone,
  Zap,
  ArrowLeft,
  ArrowRight,
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
    createOrder,
  } = useStore();

  const navigate = useNavigate();

  const isAr = language === 'ar';

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [governorate, setGovernorate] = useState(
    EGYPT_GOVERNORATES[0]
  );

  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('vodafone_cash');

  const [senderTransferNumber, setSenderTransferNumber] =
    useState('');

  const [transferError, setTransferError] =
    useState('');

  const [copiedType, setCopiedType] =
    useState<string | null>(null);

  const [couponInput, setCouponInput] =
    useState('');

  const [couponMsg, setCouponMsg] = useState<{
    text: string;
    success: boolean;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // =========================================================
  // COPY
  // =========================================================

  const handleCopy = async (
    text: string,
    type: string
  ) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedType(type);

      setTimeout(() => {
        setCopiedType(null);
      }, 2500);
    } catch (error) {
      console.error(
        'Failed to copy:',
        error
      );
    }
  };

  // =========================================================
  // COUPON
  // =========================================================

  const handleApplyCoupon = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!couponInput.trim()) {
      return;
    }

    const result = applyCoupon(
      couponInput.trim()
    );

    setCouponMsg({
      text: result.message,
      success: result.success,
    });

    if (result.success) {
      setCouponInput('');
    }
  };

  // =========================================================
  // PLACE ORDER
  // =========================================================

  const handlePlaceOrder = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (cart.length === 0) {
      return;
    }

    setTransferError('');

    // Vodafone Cash validation
    if (
      paymentMethod === 'vodafone_cash' &&
      !senderTransferNumber.trim()
    ) {
      setTransferError(
        isAr
          ? '⚠️ يرجى إدخال رقم محفظة فودافون كاش التي قمت بالتحويل منها لتأكيد طلبك.'
          : '⚠️ Please enter the sender Vodafone Cash wallet number.'
      );

      return;
    }

    // InstaPay validation
    if (
      paymentMethod === 'instapay' &&
      !senderTransferNumber.trim()
    ) {
      setTransferError(
        isAr
          ? '⚠️ يرجى إدخال الحساب أو الرقم المحول منه عبر إنستا باي لتأكيد طلبك.'
          : '⚠️ Please enter the InstaPay account or phone number used for the transfer.'
      );

      return;
    }

    try {
      setIsSubmitting(true);

      /*
       * IMPORTANT:
       * createOrder داخل StoreContext هو المسؤول
       * عن حساب:
       * - items
       * - subtotal
       * - discount
       * - shipping
       * - total
       * - coupon
       * - stock
       *
       * لذلك لا نرسل هذه البيانات مرة أخرى هنا.
       */

      const newOrder = await createOrder({
        customerName: fullName.trim(),

        phone: phone.trim(),

        governorate,

        city: city.trim(),

        address: address.trim(),

        notes: notes.trim(),

        paymentMethod,

        senderTransferNumber:
          paymentMethod === 'vodafone_cash' ||
          paymentMethod === 'instapay'
            ? senderTransferNumber.trim()
            : undefined,
      });

      /*
       * لا نستخدم clearCart هنا.
       *
       * createOrder داخل StoreContext
       * يقوم بالفعل بمسح السلة بعد نجاح الطلب.
       */

      navigate(
        `/order-success/${newOrder.id}`
      );
    } catch (error) {
      console.error(
        'Error creating order:',
        error
      );

      setTransferError(
        isAr
          ? 'حدث خطأ أثناء تأكيد الطلب. يرجى المحاولة مرة أخرى.'
          : 'An error occurred while placing your order. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // EMPTY CART
  // =========================================================

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-400">
          <ShoppingBag className="w-8 h-8" />
        </div>

        <h2 className="font-serif-luxury text-2xl font-bold text-[#1C241E] mb-2">
          {t.cart.emptyTitle}
        </h2>

        <p className="text-xs text-stone-500 mb-6">
          {t.cart.emptySubtitle}
        </p>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2D5A27] text-white text-xs font-bold"
        >
          {t.cart.continueShopping}
        </Link>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div
      id="checkout-page-container"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16"
    >
      {/* HEADER */}
      <div className="mb-10 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-xs font-bold mb-3">
          <Lock className="w-3.5 h-3.5" />

          <span>
            {isAr
              ? 'دفع آمن ومشفر 100%'
              : '100% Encrypted & Safe Checkout'}
          </span>
        </div>

        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1C241E]">
          {t.checkout.title}
        </h1>
      </div>

      <form
        onSubmit={handlePlaceOrder}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
      >
        {/* =====================================================
            CUSTOMER INFORMATION
        ====================================================== */}

        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2D5A27]/10 shadow-sm space-y-6">
            <h3 className="font-serif-luxury text-xl font-bold text-[#1C241E] flex items-center gap-2 border-b border-stone-100 pb-3">
              <Truck className="w-5 h-5 text-[#2D5A27]" />

              <span>
                {t.checkout.shippingInfo}
              </span>
            </h3>

            {/* NAME + PHONE */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {t.checkout.fullName} *
                </label>

                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) =>
                    setFullName(
                      e.target.value
                    )
                  }
                  placeholder={
                    isAr
                      ? 'مثال: سارة أحمد'
                      : 'e.g. Sarah Ahmed'
                  }
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
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  placeholder={
                    isAr
                      ? 'مثال: 01012345678'
                      : 'e.g. 01012345678'
                  }
                  className="w-full px-3.5 py-2.5 text-xs border border-stone-200 rounded-xl bg-[#FAFAF8] focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                />
              </div>
            </div>

            {/* GOVERNORATE + CITY */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {t.checkout.governorate} *
                </label>

                <select
                  required
                  value={governorate}
                  onChange={(e) =>
                    setGovernorate(
                      e.target.value
                    )
                  }
                  className="w-full px-3.5 py-2.5 text-xs border border-stone-200 rounded-xl bg-[#FAFAF8] focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                >
                  {EGYPT_GOVERNORATES.map(
                    (gov) => (
                      <option
                        key={gov}
                        value={gov}
                      >
                        {gov}
                      </option>
                    )
                  )}
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
                  onChange={(e) =>
                    setCity(
                      e.target.value
                    )
                  }
                  placeholder={
                    isAr
                      ? 'المنطقة أو الحي'
                      : 'District or area'
                  }
                  className="w-full px-3.5 py-2.5 text-xs border border-stone-200 rounded-xl bg-[#FAFAF8] focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                />
              </div>
            </div>

            {/* ADDRESS */}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.checkout.address} *
              </label>

              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
                placeholder={
                  isAr
                    ? 'اسم الشارع، رقم العمارة، رقم الشقة أو علامة مميزة'
                    : 'Street name, building number, apartment'
                }
                className="w-full px-3.5 py-2.5 text-xs border border-stone-200 rounded-xl bg-[#FAFAF8] focus:bg-white focus:outline-none focus:border-[#2D5A27]"
              />
            </div>

            {/* NOTES */}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.checkout.notes}
              </label>

              <input
                type="text"
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                placeholder={
                  isAr
                    ? 'أي ملاحظات لمندوب الشحن...'
                    : 'Special delivery instructions...'
                }
                className="w-full px-3.5 py-2.5 text-xs border border-stone-200 rounded-xl bg-[#FAFAF8] focus:bg-white focus:outline-none focus:border-[#2D5A27]"
              />
            </div>
          </div>

          {/* ===================================================
              PAYMENT METHODS
          ==================================================== */}

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2D5A27]/10 shadow-sm space-y-5">
            <h3 className="font-serif-luxury text-xl font-bold text-[#1C241E] flex items-center gap-2 border-b border-stone-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-[#2D5A27]" />

              <span>
                {t.checkout.paymentMethod}
              </span>
            </h3>

            {/* ERROR */}

            {transferError && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />

                <span>
                  {transferError}
                </span>
              </div>
            )}

            <div className="space-y-3">
              {/* ===============================================
                  VODAFONE CASH
              ================================================= */}

              <div
                className={`rounded-2xl border transition-all overflow-hidden ${
                  paymentMethod ===
                  'vodafone_cash'
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
                      checked={
                        paymentMethod ===
                        'vodafone_cash'
                      }
                      onChange={() => {
                        setPaymentMethod(
                          'vodafone_cash'
                        );

                        setTransferError(
                          ''
                        );

                        setSenderTransferNumber(
                          ''
                        );
                      }}
                      className="accent-[#2D5A27]"
                    />

                    <div>
                      <span className="text-xs font-bold text-[#1C241E]">
                        {
                          t.checkout
                            .paymentMethods
                            .vodafoneCash
                        }
                      </span>

                      <p className="text-[11px] text-stone-500">
                        {isAr
                          ? 'تحويل فوري لمحفظة فودافون كاش'
                          : 'Direct mobile wallet transfer'}
                      </p>
                    </div>
                  </div>

                  <span className="text-lg">
                    📱
                  </span>
                </label>

                {paymentMethod ===
                  'vodafone_cash' && (
                  <div className="p-4 pt-2 border-t border-[#2D5A27]/15 bg-white/70 space-y-4">
                    <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-bold text-rose-900 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-rose-700" />

                          {isAr
                            ? 'رقم محفظة فودافون كاش للتحويل:'
                            : 'Vodafone Cash Wallet:'}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              settings.vodafoneCashNumber ||
                                '01012345678',
                              'vodafone'
                            )
                          }
                          className="px-2.5 py-1 rounded-xl bg-white border border-rose-200 hover:bg-rose-100/50 text-[11px] font-bold text-rose-800 flex items-center gap-1 transition-all"
                        >
                          {copiedType ===
                          'vodafone' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />

                              <span className="text-emerald-700">
                                {isAr
                                  ? 'تم النسخ ✓'
                                  : 'Copied ✓'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-rose-700" />

                              <span>
                                {isAr
                                  ? 'نسخ الرقم'
                                  : 'Copy Number'}
                              </span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-baseline justify-between pt-1 gap-3">
                        <span
                          className="font-mono text-base font-bold text-rose-950 tracking-wider"
                          dir="ltr"
                        >
                          {settings.vodafoneCashNumber ||
                            '01012345678'}
                        </span>

                        <span className="text-[11px] text-stone-600 font-semibold">
                          {isAr
                            ? 'المبلغ المطلوب:'
                            : 'Amount to transfer:'}{' '}

                          <span className="text-[#2D5A27] font-bold">
                            {formatPrice(
                              cartTotal,
                              currency,
                              settings.currencies,
                              language
                            )}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-900 mb-1.5">
                        {isAr
                          ? 'رقم المحفظة التي ستقومين بالتحويل منها *'
                          : 'Sender Vodafone Cash wallet number *'}
                      </label>

                      <input
                        type="tel"
                        required
                        value={
                          senderTransferNumber
                        }
                        onChange={(e) => {
                          setSenderTransferNumber(
                            e.target.value
                          );

                          if (
                            transferError
                          ) {
                            setTransferError(
                              ''
                            );
                          }
                        }}
                        placeholder={
                          isAr
                            ? 'مثال: 01012345678'
                            : 'e.g. 01012345678'
                        }
                        className={`w-full px-3.5 py-2.5 text-xs border rounded-xl bg-white focus:outline-none transition-all ${
                          transferError
                            ? 'border-rose-500 ring-2 ring-rose-200'
                            : 'border-stone-300 focus:border-[#2D5A27]'
                        }`}
                      />

                      <p className="text-[10px] text-stone-500 mt-1">
                        {isAr
                          ? 'يرجى كتابة الرقم المستخدم في التحويل لتسهيل مراجعة الطلب.'
                          : 'Enter the number used for the transfer to help verify your payment.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ===============================================
                  INSTAPAY
              ================================================= */}

              <div
                className={`rounded-2xl border transition-all overflow-hidden ${
                  paymentMethod ===
                  'instapay'
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
                      checked={
                        paymentMethod ===
                        'instapay'
                      }
                      onChange={() => {
                        setPaymentMethod(
                          'instapay'
                        );

                        setTransferError(
                          ''
                        );

                        setSenderTransferNumber(
                          ''
                        );
                      }}
                      className="accent-[#2D5A27]"
                    />

                    <div>
                      <span className="text-xs font-bold text-[#1C241E]">
                        {
                          t.checkout
                            .paymentMethods
                            .instapay
                        }
                      </span>

                      <p className="text-[11px] text-stone-500">
                        {isAr
                          ? 'تحويل لحظي عن طريق إنستاباي'
                          : 'Instant transfer via InstaPay'}
                      </p>
                    </div>
                  </div>

                  <span className="text-lg">
                    ⚡
                  </span>
                </label>

                {paymentMethod ===
                  'instapay' && (
                  <div className="p-4 pt-2 border-t border-[#2D5A27]/15 bg-white/70 space-y-4">
                    <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-indigo-700" />

                          {isAr
                            ? 'حساب إنستاباي للتحويل إليه:'
                            : 'InstaPay account:'}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              settings.instapayAddress ||
                                '01012345678@instapay',
                              'instapay'
                            )
                          }
                          className="px-2.5 py-1 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-100/50 text-[11px] font-bold text-indigo-800 flex items-center gap-1 transition-all"
                        >
                          {copiedType ===
                          'instapay' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />

                              <span className="text-emerald-700">
                                {isAr
                                  ? 'تم النسخ ✓'
                                  : 'Copied ✓'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-indigo-700" />

                              <span>
                                {isAr
                                  ? 'نسخ الحساب'
                                  : 'Copy Account'}
                              </span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-baseline justify-between pt-1 gap-3">
                        <span
                          className="font-mono text-base font-bold text-indigo-950 tracking-wider"
                          dir="ltr"
                        >
                          {settings.instapayAddress ||
                            '01012345678@instapay'}
                        </span>

                        <span className="text-[11px] text-stone-600 font-semibold">
                          {isAr
                            ? 'المبلغ المطلوب:'
                            : 'Amount to transfer:'}{' '}

                          <span className="text-[#2D5A27] font-bold">
                            {formatPrice(
                              cartTotal,
                              currency,
                              settings.currencies,
                              language
                            )}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-900 mb-1.5">
                        {isAr
                          ? 'الحساب أو رقم الهاتف المحوّل منه عبر إنستاباي *'
                          : 'Sender InstaPay account or phone number *'}
                      </label>

                      <input
                        type="text"
                        required
                        value={
                          senderTransferNumber
                        }
                        onChange={(e) => {
                          setSenderTransferNumber(
                            e.target.value
                          );

                          if (
                            transferError
                          ) {
                            setTransferError(
                              ''
                            );
                          }
                        }}
                        placeholder={
                          isAr
                            ? 'مثال: username@instapay أو 01012345678'
                            : 'e.g. username@instapay or 01012345678'
                        }
                        className={`w-full px-3.5 py-2.5 text-xs border rounded-xl bg-white focus:outline-none transition-all ${
                          transferError
                            ? 'border-rose-500 ring-2 ring-rose-200'
                            : 'border-stone-300 focus:border-[#2D5A27]'
                        }`}
                      />

                      <p className="text-[10px] text-stone-500 mt-1">
                        {isAr
                          ? 'يرجى كتابة الحساب أو الرقم المستخدم في التحويل لتسهيل مراجعة الطلب.'
                          : 'Enter the account or number used for the transfer to help verify your payment.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            ORDER SUMMARY
        ====================================================== */}

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2D5A27]/10 shadow-sm space-y-6">
            <h3 className="font-serif-luxury text-xl font-bold text-[#1C241E] border-b border-stone-100 pb-3">
              {t.checkout.orderSummary}
            </h3>

            {/* PRODUCTS */}

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedVariant || ''}`}
                  className="flex items-center gap-3"
                >
                  <img
                    src={sanitizeImageUrl(
                      item.product.images?.[0]
                    )}
                    alt={
                      item.product
                        .name[language]
                    }
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#1C241E] truncate">
                      {
                        item.product
                          .name[language]
                      }
                    </p>

                    <p className="text-[11px] text-stone-500">
                      {item.quantity} ×{' '}
                      {formatPrice(
                        item.product.price,
                        currency,
                        settings.currencies,
                        language
                      )}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-[#2D5A27]">
                    {formatPrice(
                      item.product.price *
                        item.quantity,
                      currency,
                      settings.currencies,
                      language
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* COUPON */}

            <div className="pt-3 border-t border-stone-100">
              <form
                onSubmit={
                  handleApplyCoupon
                }
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) =>
                    setCouponInput(
                      e.target.value
                    )
                  }
                  placeholder={
                    isAr
                      ? 'كود الخصم'
                      : 'Coupon code'
                  }
                  className="flex-1 px-3.5 py-2.5 text-xs border border-stone-200 rounded-xl bg-[#FAFAF8] focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                />

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#2D5A27] text-white text-xs font-bold"
                >
                  {isAr
                    ? 'تطبيق'
                    : 'Apply'}
                </button>
              </form>

              {couponMsg && (
                <p
                  className={`text-[11px] mt-2 font-semibold ${
                    couponMsg.success
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {couponMsg.text}
                </p>
              )}

              {activeCoupon && (
                <p className="text-[11px] text-emerald-600 mt-2 font-semibold">
                  {isAr
                    ? `تم تطبيق الكود ${activeCoupon.code}`
                    : `Coupon ${activeCoupon.code} applied`}
                </p>
              )}
            </div>

            {/* TOTALS */}

            <div className="space-y-2 text-xs text-stone-600 pt-3 border-t border-stone-100">
              <div className="flex justify-between">
                <span>
                  {t.cart.subtotal}
                </span>

                <span className="font-semibold text-stone-900">
                  {formatPrice(
                    cartSubtotal,
                    currency,
                    settings.currencies,
                    language
                  )}
                </span>
              </div>

              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>
                    {t.cart.discount}
                  </span>

                  <span>
                    -
                    {formatPrice(
                      cartDiscount,
                      currency,
                      settings.currencies,
                      language
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>
                  {t.cart.shipping}
                </span>

                <span className="font-semibold text-stone-900">
                  {cartShipping === 0
                    ? t.cart
                        .freeShipping
                    : formatPrice(
                        cartShipping,
                        currency,
                        settings.currencies,
                        language
                      )}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-[#1C241E] pt-3 border-t border-stone-200">
                <span>
                  {t.cart.total}
                </span>

                <span className="text-xl font-bold text-[#2D5A27]">
                  {formatPrice(
                    cartTotal,
                    currency,
                    settings.currencies,
                    language
                  )}
                </span>
              </div>
            </div>

            {/* PLACE ORDER */}

            <div className="pt-2">
              <button
                type="submit"
                id="checkout-submit-btn"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-[#2D5A27] text-white hover:bg-[#23471f] disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#2D5A27]/20 active:scale-[0.99]"
              >
                <span>
                  {isSubmitting
                    ? isAr
                      ? 'جاري تأكيد الطلب...'
                      : 'Processing...'
                    : t.checkout
                        .placeOrder}
                </span>

                {isAr ? (
                  <ArrowLeft className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;