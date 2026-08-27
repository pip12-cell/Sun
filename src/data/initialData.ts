import {
  Category,
  Coupon,
  DatabaseMeta,
  Product,
  Review,
  StoreSettings,
} from '../types';

export const DATA_VERSION = 1;

export const INITIAL_DATABASE_META: DatabaseMeta = {
  version: DATA_VERSION,
  initialized: true,
  updatedAt: new Date().toISOString(),
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-sweet',
    slug: 'sweet',
    name: { ar: 'سويت', en: 'Wax & Sweet' },
    description: {
      ar: 'منتجات إزالة الشعر',
      en: 'Natural Honey Hair Removal',
    },
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    icon: 'Sparkles',
    order: 1,
  },
  {
    id: 'cat-shower',
    slug: 'shower-gel',
    name: { ar: 'شاور جل', en: 'Shower Gel' },
    description: {
      ar: 'جل الاستحمام المنعش',
      en: 'Refreshing Shower Gel',
    },
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    icon: 'Droplets',
    order: 2,
  },
  {
    id: 'cat-scrub',
    slug: 'scrubs',
    name: { ar: 'مقشرات', en: 'Scrubs' },
    description: {
      ar: 'مقشرات الجسم والبشرة',
      en: 'Body Scrubs',
    },
    image:
      'https://images.unsplash.com/photo-1608248597262-83802996d929?auto=format&fit=crop&w=800&q=80',
    icon: 'Sparkles',
    order: 3,
  },
  {
    id: 'cat-whitening',
    slug: 'whitening-mask',
    name: { ar: 'ماسك للتفتيح', en: 'Whitening Mask' },
    description: {
      ar: 'ماسكات تفتيح البشرة',
      en: 'Whitening Masks',
    },
    image:
      'https://images.unsplash.com/photo-1567928254714-273f55093556?auto=format&fit=crop&w=800&q=80',
    icon: 'Sun',
    order: 4,
  },
  {
    id: 'cat-heel',
    slug: 'heel-gel',
    name: { ar: 'جل كعب غزال', en: 'Heel Gel' },
    description: {
      ar: 'جل التوريد للقدمين',
      en: 'Heel Gel',
    },
    image:
      'https://images.unsplash.com/photo-1519735777090-ec97162dc266?auto=format&fit=crop&w=800&q=80',
    icon: 'Heart',
    order: 5,
  },
  {
    id: 'cat-bleach',
    slug: 'bleaching-powder',
    name: { ar: 'بودرة للتشقير', en: 'Bleaching Powder' },
    description: {
      ar: 'بودرة تشقير الشعر',
      en: 'Bleaching Powder',
    },
    image:
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    icon: 'Sparkles',
    order: 6,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    name: {
      ar: 'شريط صن سويت بالعسل الطبيعي',
      en: 'Sun Sweet Strip with Natural Honey',
    },
    description: {
      ar: 'شريط صن سويت بالعسل الطبيعي هو شريط لإزالة الشعر من الجذور، بتركيبة تحتوي على العسل الطبيعي، يساعد على إزالة الشعر بفعالية ويترك البشرة ناعمة.',
      en: 'Sun Sweet Natural Honey Hair Removal Strip — a hair removal strip designed to remove hair from the roots, leaving the skin smooth and soft.',
    },
    price: 30,
    categoryId: 'cat-sweet',
    images: ['/honey-strip.jpeg'],
    stock: 2000,
    rating: 5,
    reviewCount: 0,
    featured: true,
    bestSeller: true,
    newProduct: false,
  },
  {
    id: 'prod-02',
    name: {
      ar: 'شريط صن سويت بالورد',
      en: 'Sun Sweet Strip with Natural Rose',
    },
    description: {
      ar: 'شريط صن سويت بالورد هو شريط لإزالة الشعر من الجذور، بتركيبة تحتوي على الورد الطبيعي، يساعد على إزالة الشعر بفعالية ويترك البشرة ناعمة.',
      en: 'Sun Sweet Natural Rose Hair Removal Strip — a hair removal strip designed to remove hair from the roots, leaving the skin smooth and soft.',
    },
    price: 30,
    categoryId: 'cat-sweet',
    images: ['/Rose-strip.jpeg'],
    stock: 2000,
    rating: 5,
    reviewCount: 0,
    featured: true,
    bestSeller: false,
    newProduct: false,
  },
  {
    id: 'prod-03',
    name: {
      ar: 'شريط صن سويت بالزيتون',
      en: 'Sun Sweet Strip with Natural olive',
    },
    description: {
      ar: 'شريط صن سويت بالزيتون هو شريط لإزالة الشعر من الجذور، بتركيبة تحتوي على الورد الطبيعي، يساعد على إزالة الشعر بفعالية ويترك البشرة ناعمة.',
      en: 'Sun Sweet Natural Rose Hair Removal Strip — a hair removal strip designed to remove hair from the roots, leaving the skin smooth and soft.',
    },
    price: 30,
    categoryId: 'cat-sweet',
    images: ['/Olive-strip.jpeg'],
    stock: 2000,
    rating: 5,
    reviewCount: 0,
    featured: true,
    bestSeller: false,
    newProduct: false,
  },
  {
    id: 'prod-04',
    name: {
      ar: 'شريط صن سويت بالليمون',
      en: 'Sun Sweet Strip with Natural Lemon ',
    },
    description: {
      ar: 'شريط صن سويت بالليمون هو شريط لإزالة الشعر من الجذور، بتركيبة تحتوي على الورد الطبيعي، يساعد على إزالة الشعر بفعالية ويترك البشرة ناعمة.',
      en: 'Sun Sweet Natural Rose Hair Removal Strip — a hair removal strip designed to remove hair from the roots, leaving the skin smooth and soft.',
    },
    price: 30,
    categoryId: 'cat-sweet',
    images: ['/Lemon-strip.jpeg'],
    stock: 2000,
    rating: 5,
    reviewCount: 0,
    featured: true,
    bestSeller: false,
    newProduct: false,
  },
  {
  id: 'prod-05',
  name: {
    ar: 'شاور جل بزهور الربيع',
    en: 'Spring Flowers Shower Gel',
  },
  description: {
    ar: 'شاور جل بزهور الربيع بتركيبة منعشة ولطيفة تساعد على تنظيف البشرة وتركها ناعمة برائحة زهور الربيع الجميلة.',
    en: 'Spring Flowers Shower Gel with a refreshing and gentle formula that helps cleanse the skin, leaving it soft with a beautiful spring flower fragrance.',
  },
  price: 90,
  categoryId: 'cat-shower',
  images: ['/Spring-Flowers-Shower-Gel.jpeg'],
  stock: 2000,
  rating: 5,
  reviewCount: 0,
  featured: true,
  bestSeller: false,
  newProduct: true,
},
{
  id: 'prod-06',
  name: {
    ar: 'شاور جل ليمون نعناع ',
    en: 'Lemon Mint Shower Gel',
  },
  description: {
    ar: 'شاور جل ليمون نعناع بتركيبة منعشة ولطيفة تساعد على تنظيف البشرة وتركها ناعمة برائحة زهور الربيع الجميلة.',
    en: 'Lemon Mint  Shower Gel with a refreshing and gentle formula that helps cleanse the skin, leaving it soft with a beautiful spring flower fragrance.',
  },
  price: 90,
  categoryId: 'cat-shower',
  images: ['/Lemon-Mint-Shower-Gel.jpeg'],
  stock: 2000,
  rating: 5,
  reviewCount: 0,
  featured: true,
  bestSeller: false,
  newProduct: true,
},
{
  id: 'prod-07',
  name: {
    ar: 'شاور جل بالعطور الفرنسيه ',
    en: 'French perfumes Shower Gel',
  },
  description: {
    ar: 'شاور جل  بالعطور الفرنسيه بتركيبة منعشة ولطيفة تساعد على تنظيف البشرة وتركها ناعمة برائحة زهور الربيع الجميلة.',
    en: 'French perfumes Shower Gel with a refreshing and gentle formula that helps cleanse the skin, leaving it soft with a beautiful spring flower fragrance.',
  },
  price: 90,
  categoryId: 'cat-shower',
  images: ['/French-perfumes-Shower-Gel.jpeg'],
  stock: 2000,
  rating: 5,
  reviewCount: 0,
  featured: true,
  bestSeller: false,
  newProduct: false,
},
{
  id: 'prod-08',
  name: {
    ar: 'شاور جل بالخوخ ',
    en: 'Peach Shower Gel',
  },
  description: {
    ar: 'شاور جل  بالخوخ  بتركيبة منعشة ولطيفة تساعد على تنظيف البشرة وتركها ناعمة برائحة زهور الربيع الجميلة.',
    en: 'Peach Shower Gel with a refreshing and gentle formula that helps cleanse the skin, leaving it soft with a beautiful spring flower fragrance.',
  },
  price: 90,
  categoryId: 'cat-shower',
  images: ['/Peach-Shower-Gel.jpeg'],
  stock: 2000,
  rating: 5,
  reviewCount: 0,
  featured: true,
  bestSeller: false,
  newProduct: false,
},
{
  id: 'prod-09',
  name: {
    ar: 'شاور جل بالتوت البري ',
    en: 'Berries Shower Gel',
  },
  description: {
    ar: 'شاور جل  بالتوت البري  بتركيبة منعشة ولطيفة تساعد على تنظيف البشرة وتركها ناعمة برائحة زهور الربيع الجميلة.',
    en: 'Berries Shower Gel with a refreshing and gentle formula that helps cleanse the skin, leaving it soft with a beautiful spring flower fragrance.',
  },
  price: 90,
  categoryId: 'cat-shower',
  images: ['/Berries-Shower-Gel.jpeg'],
  stock: 2000,
  rating: 5,
  reviewCount: 0,
  featured: true,
  bestSeller: true,
  newProduct: false,
},
{
  id: 'prod-10',
  name: {
    ar: 'شاور جل  بالبطيخ  ',
    en: 'watermelon Shower Gel',
  },
  description: {
    ar: 'شاور جل   بالبطيخ  بتركيبة منعشة ولطيفة تساعد على تنظيف البشرة وتركها ناعمة برائحة زهور الربيع الجميلة.',
    en: 'watermelon Shower Gel with a refreshing and gentle formula that helps cleanse the skin, leaving it soft with a beautiful spring flower fragrance.',
  },
  price: 90,
  categoryId: 'cat-shower',
  images: ['/watermelon-Shower-Gel.jpeg'],
  stock: 2000,
  rating: 5,
  reviewCount: 0,
  featured: true,
  bestSeller: false,
  newProduct: false,
},
{
  id: 'prod-11',
  name: {
    ar: ' 300g ماسك حليب للتفتيح',
    en: 'Milk Brightening Face Mask 300g ',
  },
  description: {
    ar: 'ماسك الحليب للتفتيح بتركيبة لطيفة تساعد على تنظيف البشرة ومنحها مظهرًا أكثر إشراقًا ونضارة، مع ترك البشرة ناعمة ومرطبة.',
    en: 'Milk Brightening Face Mask with a gentle formula that helps cleanse the skin and give it a brighter, fresher appearance while leaving the skin soft and moisturized.',
  },
  price: 80,
  categoryId: 'cat-whitening',
  images: ['/Milk-Mask.jpeg'],
  stock: 2000,
  rating: 5,
  reviewCount: 0,
  featured: true,
  bestSeller: false,
  newProduct: false,
},
{
  id: 'prod-12',
  name: {
    ar: ' 150g ماسك حليب للتفتيح',
    en: 'Milk Brightening Face Mask 150g ',
  },
  description: {
    ar: 'ماسك الحليب للتفتيح بتركيبة لطيفة تساعد على تنظيف البشرة ومنحها مظهرًا أكثر إشراقًا ونضارة، مع ترك البشرة ناعمة ومرطبة.',
    en: 'Milk Brightening Face Mask with a gentle formula that helps cleanse the skin and give it a brighter, fresher appearance while leaving the skin soft and moisturized.',
  },
  price: 55,
  categoryId: 'cat-whitening',
  images: ['/milk-mask150g.jpeg'],
  stock: 2000,
  rating: 5,
  reviewCount: 0,
  featured: true,
  bestSeller: false,
  newProduct: true,
},
{
  id: 'prod-13',
  name: {
    ar: 'بودرة تشقير Sun Styling 40g',
    en: 'Sun Styling Bleaching Powder 40g',
  },
  description: {
    ar: 'بودرة تشقير Sun Styling مصممة لتفتيح الشعر الزائد ومنحه مظهرًا أفتح بشكل متناسق، بتركيبة سهلة الاستخدام للاستخدام التجميلي.',
    en: 'Sun Styling Bleaching Powder is designed to lighten unwanted hair and give it a more even, lighter appearance, with an easy-to-use formula for cosmetic use.',
  },
  price: 30,
  categoryId: 'cat-bleach',
  images: ['/Sun-Styling-Bleaching-Powder.jpeg'],
  stock: 2000,
  rating: 5,
  reviewCount: 0,
  featured: true,
  bestSeller: false,
  newProduct: false,
}
];

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
  logoUrl: '/logo.jpeg',
  announcement: {
    enabled: true,
    ar: 'مرحباً بكِ في متجر Sun Beauty للعناية الطبيعية الفاخرة ✨',
    en: 'Welcome to Sun Beauty Luxury Botanical Skincare ✨',
    animated: true,
  },
  whatsappNumber: '01080919723',
  vodafoneCashNumber: '01080919723',
  instapayAddress: '01225100680',
  phone: '01080919723',
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