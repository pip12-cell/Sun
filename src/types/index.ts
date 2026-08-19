export type Language = 'ar' | 'en';
export type CurrencyCode = 'EGP' | 'SAR' | 'AED' | 'USD';

export interface LocalizedString {
  ar: string;
  en: string;
}

export type SkinType = 'all' | 'oily' | 'dry' | 'combination' | 'sensitive';
export type SkinGoal = 'hydration' | 'glow' | 'antiaging' | 'blemish' | 'soothing' | 'sun_protection';
export type RoutineStep = 'cleanse' | 'treat' | 'hydrate' | 'protect' | 'mask';

export interface Product {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  ingredients: LocalizedString;
  howToUse: LocalizedString;
  benefits?: LocalizedString;
  categoryId: string;
  price: number;
  compareAtPrice?: number;
  discount?: number; // percentage
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  newProduct: boolean;
  bestSeller: boolean;
  skinType?: SkinType[];
  skinGoal?: SkinGoal[];
  routineStep?: RoutineStep;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: LocalizedString;
  description?: LocalizedString;
  image?: string;
  icon?: string;
  order?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';
export type PaymentMethod = 'cod' | 'vodafone_cash' | 'instapay' | 'bank_transfer';

export interface OrderItem {
  productId: string;
  productName: LocalizedString;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string; // e.g. SB-84920
  customerName: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  senderTransferNumber?: string; // الرقم أو الحساب الذي تم التحويل منه
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase?: boolean;
  status?: 'approved' | 'pending';
}

export type ProductReview = Review;

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface CurrencyConfig {
  code: CurrencyCode;
  nameAr: string;
  nameEn: string;
  symbolAr: string;
  symbolEn: string;
  rateFromEGP: number; // e.g. 1 EGP = 0.021 USD, etc.
}

export interface StoreSettings {
  storeName: LocalizedString;
  tagline: LocalizedString;
  logoText: string;
  logoUrl?: string;
  announcement: {
    enabled: boolean;
    ar: string;
    en: string;
    animated: boolean;
  };
  whatsappNumber: string;
  vodafoneCashNumber?: string;
  instapayAddress?: string;
  phone: string;
  email: string;
  address: LocalizedString;
  shippingFee: number;
  freeShippingThreshold: number;
  currencies: CurrencyConfig[];
  currentCurrency: CurrencyCode;
  currentLanguage: Language;
  adminPin: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
}

export interface DatabaseMeta {
  version: number;
  initialized: boolean;
  updatedAt: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
