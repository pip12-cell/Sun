import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { CheckCircle2, MessageCircle, ArrowRight, ArrowLeft, PackageCheck, Truck, Clock } from 'lucide-react';
import { formatPrice, generateWhatsAppOrderMessage, getWhatsAppLink } from '../utils/helpers';
import confetti from 'canvas-confetti';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { orders, language, currency, settings, t } = useStore();
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const order = orders.find((o) => o.id === id);

  useEffect(() => {
    // Trigger celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2D5A27', '#D4AF37', '#3E7B35', '#F5E6C8'],
      });
    } catch {
      // ignore
    }
  }, []);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-stone-800 mb-4">
          {isAr ? 'الطلب غير موجود' : 'Order Not Found'}
        </h2>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2D5A27] text-white text-xs font-bold"
        >
          {t.nav.home}
        </Link>
      </div>
    );
  }

  const waMessage = generateWhatsAppOrderMessage(order, settings.whatsappNumber, language);
  const waUrl = getWhatsAppLink(settings.whatsappNumber, waMessage);

  return (
    <div id="order-success-page-container" className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="bg-white rounded-3xl border border-[#2D5A27]/15 p-6 sm:p-10 shadow-xl text-center space-y-8">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center mx-auto ring-8 ring-[#2D5A27]/5">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Title */}
        <div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1C241E] mb-2">
            {t.orderSuccess.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            {t.orderSuccess.subtitle}
          </p>
        </div>

        {/* Order ID Badge */}
        <div className="inline-block px-4 py-2 rounded-xl bg-[#FAFAF8] border border-stone-200 text-xs font-mono font-bold text-[#2D5A27]">
          {t.orderSuccess.orderNumber}: {order.id}
        </div>

        {/* Status Tracker */}
        <div className="bg-[#FAFAF8] p-6 rounded-2xl border border-stone-200/80">
          <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-6">
            <span className="flex items-center gap-1.5 text-[#2D5A27]">
              <Clock className="w-4 h-4" />
              <span>{isAr ? 'تم استلام الطلب' : 'Received'}</span>
            </span>
            <span className="text-stone-400">•</span>
            <span className="flex items-center gap-1.5 text-stone-400">
              <PackageCheck className="w-4 h-4" />
              <span>{isAr ? 'قيد التجهيز' : 'Processing'}</span>
            </span>
            <span className="text-stone-400">•</span>
            <span className="flex items-center gap-1.5 text-stone-400">
              <Truck className="w-4 h-4" />
              <span>{isAr ? 'جاري الشحن' : 'Shipped'}</span>
            </span>
          </div>

          <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
            <div className="bg-[#2D5A27] h-full w-1/3 rounded-full" />
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div className="text-left rtl:text-right space-y-4 pt-4 border-t border-stone-100">
          <h3 className="font-serif-luxury text-lg font-bold text-[#1C241E]">
            {isAr ? 'ملخص الطلب' : 'Order Details'}
          </h3>

          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-stone-100">
                <span className="font-medium text-stone-800">
                  {item.productName[language]} × {item.quantity}
                </span>
                <span className="font-bold text-[#2D5A27]">
                  {formatPrice(item.price * item.quantity, currency, settings.currencies, language)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1 pt-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>{t.cart.subtotal}</span>
              <span>{formatPrice(order.subtotal, currency, settings.currencies, language)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>{t.cart.discount}</span>
                <span>-{formatPrice(order.discount, currency, settings.currencies, language)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{t.cart.shipping}</span>
              <span>
                {order.shipping === 0
                  ? t.cart.freeShipping
                  : formatPrice(order.shipping, currency, settings.currencies, language)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#1C241E] pt-2 border-t border-stone-200">
              <span>{t.cart.total}</span>
              <span className="text-[#2D5A27]">
                {formatPrice(order.total, currency, settings.currencies, language)}
              </span>
            </div>
          </div>

          {/* Payment Method & Transfer Info Card */}
          {(order.paymentMethod === 'vodafone_cash' || order.paymentMethod === 'instapay') && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-stone-900">
                <span>
                  {order.paymentMethod === 'vodafone_cash'
                    ? (isAr ? '📱 الدفع عبر فودافون كاش' : '📱 Vodafone Cash Payment')
                    : (isAr ? '⚡ الدفع عبر إنستاباي' : '⚡ InstaPay Payment')}
                </span>
                <span className="font-mono text-[#2D5A27]" dir="ltr">
                  {order.paymentMethod === 'vodafone_cash'
                    ? settings.vodafoneCashNumber || '01012345678'
                    : settings.instapayAddress || '01012345678@instapay'}
                </span>
              </div>
              {order.senderTransferNumber && (
                <div className="flex items-center justify-between text-[11px] text-stone-700 pt-1 border-t border-amber-200/60">
                  <span>{isAr ? 'الرقم / الحساب المحوّل منه:' : 'Sender account/number:'}</span>
                  <span className="font-mono font-bold text-[#1C241E]" dir="ltr">
                    {order.senderTransferNumber}
                  </span>
                </div>
              )}
              <p className="text-[11px] text-amber-900 leading-relaxed pt-1">
                {isAr
                  ? '💡 يمكنكِ إرسال صورة إيصال التحويل عبر واتساب لتسريع تجهيز وشحن طلبكِ فوراً.'
                  : '💡 You can send your payment transfer receipt via WhatsApp to expedite processing.'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#25D366] text-white hover:bg-[#20bd5a] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>{isAr ? 'متابعة الطلب عبر واتساب' : 'Track via WhatsApp'}</span>
          </a>

          <Link
            to="/products"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#2D5A27] text-white hover:bg-[#23471f] font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <span>{t.cart.continueShopping}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
