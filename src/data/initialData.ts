import { Category, Coupon, DatabaseMeta, Product, Review, StoreSettings } from '../types';

export const DATA_VERSION = 1;

export const INITIAL_DATABASE_META: DatabaseMeta = {
  version: DATA_VERSION,
  initialized: true,
  updatedAt: new Date().toISOString(),
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-cleansers',
    slug: 'cleansers',
    name: { ar: 'غسول ومنظفات', en: 'Cleansers & Washes' },
    description: { ar: 'منظفات رقيقة بمستخلصات نباتية لتنقية وتلطيف المسام', en: 'Gentle plant-powered cleansers to purify and refresh pores' },
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    icon: 'Sparkles',
    order: 1,
  },
  {
    id: 'cat-serums',
    slug: 'serums',
    name: { ar: 'سيروم وعلاجات', en: 'Serums & Treatments' },
    description: { ar: 'تركيزات عالية من الفيتامينات ومضادات الأكسدة لنضارة فورية', en: 'Potent vitamin & antioxidant formulas for luminous skin' },
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    icon: 'Droplets',
    order: 2,
  },
  {
    id: 'cat-creams',
    slug: 'creams-moisturizers',
    name: { ar: 'كريمات وترطيب', en: 'Creams & Moisturizers' },
    description: { ar: 'ترطيب عميق يستعيد حاجز البشرة الطبيعي ومرونتها', en: 'Deep hydration to restore natural skin barrier and elasticity' },
    image: 'https://images.unsplash.com/photo-1608248597359-0a6962327599?auto=format&fit=crop&w=800&q=80',
    icon: 'Heart',
    order: 3,
  },
  {
    id: 'cat-sunscreen',
    slug: 'sunscreen',
    name: { ar: 'واقي شمس', en: 'Sun Protection' },
    description: { ar: 'حماية واسعة النطاق من أشعة الشمس بلمسة حريرية غير مرئية', en: 'Broad spectrum UV shield with invisible silky finish' },
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    icon: 'Sun',
    order: 4,
  },
  {
    id: 'cat-masks',
    slug: 'masks',
    name: { ar: 'ماسكات وعناية مكثفة', en: 'Masks & Peels' },
    description: { ar: 'أقنعة طين نباتية ومقشرات طبيعية لتجديد خلايا البشرة', en: 'Botanical clay masks and gentle natural exfoliants' },
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
    icon: 'Flower2',
    order: 5,
  },
  {
    id: 'cat-body',
    slug: 'body-care',
    name: { ar: 'العناية بالجسم', en: 'Body Care' },
    description: { ar: 'زيوت وكريمات مخملية لتغذية وتعطير الجسم بعبير طبيعي', en: 'Velvety oils & rich lotions infused with botanical essences' },
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80',
    icon: 'Shield',
    order: 6,
  },
  {
    id: 'cat-sets',
    slug: 'sets',
    name: { ar: 'مجموعات متكاملة', en: 'Skincare Sets' },
    description: { ar: 'روتينات متكاملة للعناية بالبشرة بأسعار مميزة وهدايا فاخرة', en: 'Complete curated routine sets with exclusive gift packaging' },
    image: 'https://images.unsplash.com/photo-1512290900672-1f55b965c404?auto=format&fit=crop&w=800&q=80',
    icon: 'Package',
    order: 7,
  },
];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_REVIEWS: Review[] = [];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cp-01',
    code: 'SUN20',
    type: 'percentage',
    value: 20,
    minOrder: 500,
    maxDiscount: 300,
    expiryDate: '2026-12-31',
    usageLimit: 1000,
    usedCount: 142,
    isActive: true,
  },
  {
    id: 'cp-02',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minOrder: 300,
    maxDiscount: 150,
    expiryDate: '2026-12-31',
    usageLimit: 500,
    usedCount: 89,
    isActive: true,
  },
  {
    id: 'cp-03',
    code: 'GLOW100',
    type: 'fixed',
    value: 100,
    minOrder: 800,
    expiryDate: '2026-12-31',
    usageLimit: 200,
    usedCount: 45,
    isActive: true,
  },
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: {
    ar: 'Sun Beauty',
    en: 'Sun Beauty',
  },
  tagline: {
    ar: 'العناية الفاخرة بالبشرة المستوحاة من الطبيعة والنقاء',
    en: 'Luxury Botanical Skincare & Pure Natural Radiance',
  },
  logoText: 'Sun Beauty',
  logoUrl: '',
  announcement: {
    enabled: true,
    ar: 'مرحباً بكِ في متجر Sun Beauty للعناية الطبيعية الفاخرة ✨',
    en: 'Welcome to Sun Beauty Luxury Botanical Skincare ✨',
    animated: true,
  },
  whatsappNumber: '+201012345678',
  vodafoneCashNumber: '01012345678',
  instapayAddress: '01012345678@instapay',
  phone: '+20 101 234 5678',
  email: 'info@sunbeauty.com',
  address: {
    ar: 'البحيرة، دمنهور',
    en: 'Damanhour, El Beheira',
  },
  shippingFee: 100,
  freeShippingThreshold: 1000,
  currencies: [
    {
      code: 'EGP',
      nameAr: 'جنيه مصري',
      nameEn: 'Egyptian Pound',
      symbolAr: 'ج.م',
      symbolEn: 'EGP',
      rateFromEGP: 1,
    },
  ],
  currentCurrency: 'EGP',
  currentLanguage: 'ar',
  adminPin: '123456',
  socialLinks: {
    instagram: 'https://instagram.com/sunbeauty',
    facebook: 'https://facebook.com/sunbeauty',
    tiktok: 'https://tiktok.com/@sunbeauty',
  },
};
