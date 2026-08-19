import { CurrencyCode, CurrencyConfig, Language, Order, StoreSettings } from '../types';

/**
 * Format a price from base currency (EGP) to the selected currency.
 */
export function formatPrice(
  amountInEGP: number,
  currencyCode: CurrencyCode,
  currencies: CurrencyConfig[],
  lang: Language = 'ar'
): string {
  const config = currencies.find((c) => c.code === currencyCode) || {
    code: 'EGP',
    nameAr: 'جنيه مصري',
    nameEn: 'Egyptian Pound',
    symbolAr: 'ج.م',
    symbolEn: 'EGP',
    rateFromEGP: 1,
  };

  const converted = amountInEGP * (config.rateFromEGP || 1);
  const formattedNumber = Math.round(converted).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
  const symbol = lang === 'ar' ? config.symbolAr : config.symbolEn;

  return lang === 'ar' ? `${formattedNumber} ${symbol}` : `${symbol} ${formattedNumber}`;
}

/**
 * Generate a unique Order ID in the format SB-XXXXXX
 */
export function generateOrderId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `SB-${randomNum}`;
}

/**
 * Format date string for display
 */
export function formatDate(dateStr: string, lang: Language = 'ar'): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Build structured WhatsApp order message
 */
export function createWhatsAppOrderMessage(
  order: Order,
  settingsOrNumber: StoreSettings | string,
  lang: Language = 'ar'
): string {
  const isAr = lang === 'ar';
  const currencySymbol = isAr ? 'ج.م' : 'EGP';

  const productList = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${isAr ? item.productName.ar : item.productName.en} × ${item.quantity} = ${item.price * item.quantity} ${currencySymbol}`
    )
    .join('\n');

  const paymentLabels: Record<string, string> = {
    cod: isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery',
    vodafone_cash: isAr ? 'فودافون كاش' : 'Vodafone Cash',
    instapay: isAr ? 'إنستاباي InstaPay' : 'InstaPay',
    bank_transfer: isAr ? 'تحويل بنكي' : 'Bank Transfer',
  };

  const paymentName = paymentLabels[order.paymentMethod] || order.paymentMethod;

  const msg = `🌿 *${isAr ? 'طلب جديد من Sun Beauty' : 'New Sun Beauty Order'}* 🌿
━━━━━━━━━━━━━━━━━━
🆔 *${isAr ? 'رقم الطلب' : 'Order ID'}:* ${order.id}
👤 *${isAr ? 'العميل' : 'Customer'}:* ${order.customerName}
📞 *${isAr ? 'الهاتف' : 'Phone'}:* ${order.phone}
📍 *${isAr ? 'العنوان' : 'Address'}:* ${order.governorate}, ${order.city} - ${order.address}
${order.notes ? `📝 *${isAr ? 'ملاحظات' : 'Notes'}:* ${order.notes}\n` : ''}━━━━━━━━━━━━━━━━━━
📦 *${isAr ? 'المنتجات المطلوبة' : 'Ordered Products'}:*
${productList}
━━━━━━━━━━━━━━━━━━
💰 *${isAr ? 'المجموع الفرعي' : 'Subtotal'}:* ${order.subtotal} ${currencySymbol}
🚚 *${isAr ? 'الشحن' : 'Shipping'}:* ${order.shipping === 0 ? (isAr ? 'مجاني 🎉' : 'Free 🎉') : `${order.shipping} ${currencySymbol}`}
${order.discount > 0 ? `🏷️ *${isAr ? 'الخصم' : 'Discount'}:* -${order.discount} ${currencySymbol}\n` : ''}✨ *${isAr ? 'الإجمالي النهائي' : 'Grand Total'}:* ${order.total} ${currencySymbol}
💳 *${isAr ? 'طريقة الدفع' : 'Payment Method'}:* ${paymentName}
${order.senderTransferNumber ? `📲 *${isAr ? 'الرقم / الحساب المحول منه' : 'Sender Transfer Account'}:* ${order.senderTransferNumber}\n` : ''}━━━━━━━━━━━━━━━━━━
✨ ${isAr ? 'شكرًا لاختياركِ جمالكِ الطبيعي مع Sun Beauty!' : 'Thank you for choosing Sun Beauty!'}`;

  return msg;
}

export const generateWhatsAppOrderMessage = createWhatsAppOrderMessage;

/**
 * Generate a WhatsApp URL
 */
export function getWhatsAppLink(phone: string, text: string): string {
  // Clean phone number: remove non-digits except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('01')) {
    // Egyptian local format (e.g. 01012345678 -> 201012345678)
    cleaned = '2' + cleaned;
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${cleaned}?text=${encoded}`;
}
