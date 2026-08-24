import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  CartItem,
  Category,
  Coupon,
  CurrencyCode,
  Language,
  Order,
  OrderStatus,
  Product,
  Review,
  StoreSettings,
  ToastMessage,
} from '../types';
import { storageService } from '../services/storageService';
import { firebaseService } from '../services/firebaseService';
import {
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
} from '../data/initialData';
import { translations } from '../i18n/translations';
import { generateOrderId } from '../utils/helpers';

interface StoreContextType {
  // Data
  products: Product[];
  categories: Category[];
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  settings: StoreSettings;
  cart: CartItem[];
  wishlist: string[];
  language: Language;
  currency: CurrencyCode;
  t: typeof translations['ar'];
  isLoading: boolean;

  // UI state
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  toast: ToastMessage | null;
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;

  // Cart & Discounts
  activeCoupon: Coupon | null;
  cartSubtotal: number;
  cartDiscount: number;
  cartShipping: number;
  cartTotal: number;
  cartCount: number;
  freeShippingProgress: number; // percentage (0 to 100)
  amountLeftForFreeShipping: number;

  // Actions
  addToCart: (product: Product, quantity?: number, selectedVariant?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  createOrder: (orderData: {
    customerName: string;
    phone: string;
    governorate: string;
    city: string;
    address: string;
    notes?: string;
    paymentMethod: Order['paymentMethod'];
    senderTransferNumber?: string;
  }) => Promise<Order>;
  addReview: (reviewData: {
    productId: string;
    customerName: string;
    rating: number;
    comment: string;
    date?: string;
    verifiedPurchase?: boolean;
    status?: 'approved' | 'pending';
  }) => Promise<void>;
  saveReview: (review: Review) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  clearAllReviews: () => Promise<void>;

  // Admin Actions
  saveProduct: (product: Product) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> | Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  clearAllProducts: () => Promise<void>;
  saveCategory: (category: Category) => Promise<void>;
  createCategory: (category: Omit<Category, 'id' | 'slug'> & { id?: string; slug?: string }) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  saveCoupon: (coupon: Coupon) => Promise<void>;
  createCoupon: (coupon: Omit<Coupon, 'id'> & { id?: string }) => Promise<void>;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  saveSettings: (settings: StoreSettings) => Promise<void>;
  updateSettings: (settings: StoreSettings) => Promise<void>;
  restoreBackup: (dump: any) => Promise<void>;
  restoreDatabase: (dump: any) => Promise<void>;
  resetDatabaseToDefaults: () => Promise<void>;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: CurrencyCode) => void;
  refreshAllData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sun_beauty_active_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem('sun_beauty_active_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('sun_beauty_lang') as Language;
      return saved === 'en' ? 'en' : 'ar';
    } catch {
      return 'ar';
    }
  });

  const [currency, setCurrencyState] = useState<CurrencyCode>('EGP');

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const t = useMemo(() => translations[language], [language]);

  // Toast notification helper
  const showToast = useCallback(
    (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
      const id = Date.now().toString();
      setToast({ id, title, message, type });
      setTimeout(() => {
        setToast((curr) => (curr?.id === id ? null : curr));
      }, 4000);
    },
    []
  );

  // Load initial data from StorageService (IndexedDB + localStorage)
const refreshAllData = useCallback(async () => {
  try {
    await storageService.restoreFullDatabase({
  meta: { version: 1, initialized: true, updatedAt: new Date().toISOString() },
  products: INITIAL_PRODUCTS,
  categories: INITIAL_CATEGORIES,
  reviews: [],
  coupons: [],
  settings: INITIAL_SETTINGS,
  orders: [],
  wishlist: [],
});
// أضف قراءة الطلبات من firebaseService بعد تحميل StorageService
try {
  const firebaseOrders = await firebaseService.getOrders();
  if (firebaseOrders && firebaseOrders.length > 0) {
    setOrders(firebaseOrders);
  } else {
    const localOrders = await storageService.getOrders();
    setOrders(localOrders || []);
  }
} catch (err) {
  console.error("Error loading orders from firebase:", err);
  const localOrders = await storageService.getOrders();
  setOrders(localOrders || []);
}
    setIsLoading(true);

      setProducts(prods);
      setCategories(cats);
      setOrders(ords);
      setReviews(revs);
      setCoupons(cps);
      setSettings(sttngs);
      setWishlist(wsh);
    } catch (err) {
      console.error('Failed to load store data:', err);
      //showToast('تنبيه التخزين', 'تم استخدام التخزين المحلي الاحتياطي بنجاح', 'info');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshAllData();

    // Setup live real-time cloud sync with Firebase Firestore
    let unsubs: (() => void)[] = [];
    try {
      unsubs = [
        firebaseService.subscribeToProducts((cloudProducts) => {
          if (cloudProducts) {
            setProducts(cloudProducts);
          }
        }),
        firebaseService.subscribeToCategories((cloudCats) => {
          if (cloudCats) {
            setCategories(cloudCats);
          }
        }),
        firebaseService.subscribeToOrders((cloudOrders) => {
          if (cloudOrders) {
            setOrders(cloudOrders);
          }
        }),
        firebaseService.subscribeToReviews((cloudReviews) => {
          if (cloudReviews) {
            setReviews(cloudReviews);
          }
        }),
        firebaseService.subscribeToCoupons((cloudCoupons) => {
          if (cloudCoupons) {
            setCoupons(cloudCoupons);
          }
        }),
        firebaseService.subscribeToSettings((cloudSettings) => {
          if (cloudSettings) {
            setSettings(cloudSettings);
          }
        }),
      ];
    } catch (e) {
      console.warn('Real-time subscriptions initialization:', e);
    }



    // One-time automatic purge of pre-existing sample reviews so admin can add their own reviews
    const hasCleanedSampleReviews = localStorage.getItem('sun_beauty_reviews_purged_v3');
    if (!hasCleanedSampleReviews) {
      storageService.clearAllReviews().then(() => {
        setReviews([]);
        localStorage.setItem('sun_beauty_reviews_purged_v3', 'true');
      }).catch((e) => console.warn('Review purge notice:', e));
    }

    return () => {
      unsubs.forEach((unsub) => {
        try {
          unsub();
        } catch {}
      });
    };
  }, [refreshAllData]);

  // Sync language to document dir & lang
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
    localStorage.setItem('sun_beauty_lang', language);
  }, [language]);

  // Sync currency
  useEffect(() => {
    localStorage.setItem('sun_beauty_currency', currency);
  }, [currency]);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('sun_beauty_active_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync active coupon
  useEffect(() => {
    if (activeCoupon) {
      localStorage.setItem('sun_beauty_active_coupon', JSON.stringify(activeCoupon));
    } else {
      localStorage.removeItem('sun_beauty_active_coupon');
    }
  }, [activeCoupon]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setCurrency = (curr: CurrencyCode) => {
    setCurrencyState(curr);
  };

  // Cart operations
  const addToCart = useCallback(
    (product: Product, quantity = 1, selectedVariant?: string) => {
      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.product.id === product.id && item.selectedVariant === selectedVariant
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          return updated;
        } else {
          return [...prev, { product, quantity, selectedVariant }];
        }
      });

      const productName = language === 'ar' ? product.name.ar : product.name.en;
      showToast(
        language === 'ar' ? 'تمت الإضافة للسلة' : 'Added to Bag',
        `${productName} (${quantity})`,
        'success'
      );
    },
    [language, showToast]
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setActiveCoupon(null);
  }, []);

  // Wishlist
  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => {
        const isPresent = prev.includes(productId);
        let updated: string[];
        if (isPresent) {
          updated = prev.filter((id) => id !== productId);
          showToast(
            language === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from Wishlist',
            '',
            'info'
          );
        } else {
          updated = [...prev, productId];
          showToast(
            language === 'ar' ? 'تمت الإضافة للمفضلة' : 'Added to Wishlist',
            '',
            'success'
          );
        }
        storageService.saveWishlist(updated);
        return updated;
      });
    },
    [language, showToast]
  );

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlist.includes(productId);
    },
    [wishlist]
  );

  // Cart Calculations in base EGP
  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartDiscount = useMemo(() => {
    if (!activeCoupon || cartSubtotal <= 0) return 0;
    if (cartSubtotal < activeCoupon.minOrder) return 0;

    if (activeCoupon.type === 'percentage') {
      const calculated = (cartSubtotal * activeCoupon.value) / 100;
      return activeCoupon.maxDiscount ? Math.min(calculated, activeCoupon.maxDiscount) : calculated;
    } else {
      return Math.min(activeCoupon.value, cartSubtotal);
    }
  }, [activeCoupon, cartSubtotal]);

  const cartShipping = useMemo(() => {
    if (cartSubtotal <= 0) return 0;
    if (cartSubtotal >= settings.freeShippingThreshold) return 0;
    return settings.shippingFee;
  }, [cartSubtotal, settings.freeShippingThreshold, settings.shippingFee]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - cartDiscount + cartShipping);
  }, [cartSubtotal, cartDiscount, cartShipping]);

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const freeShippingProgress = useMemo(() => {
    if (cartSubtotal >= settings.freeShippingThreshold) return 100;
    return Math.min(100, Math.round((cartSubtotal / settings.freeShippingThreshold) * 100));
  }, [cartSubtotal, settings.freeShippingThreshold]);

  const amountLeftForFreeShipping = useMemo(() => {
    return Math.max(0, settings.freeShippingThreshold - cartSubtotal);
  }, [cartSubtotal, settings.freeShippingThreshold]);

  // Apply Coupon
  const applyCoupon = useCallback(
    (code: string) => {
      const cleaned = code.trim().toUpperCase();
      const match = coupons.find((c) => c.code.toUpperCase() === cleaned && c.isActive);

      if (!match) {
        return {
          success: false,
          message: language === 'ar' ? 'كود الخصم غير صحيح أو منتهي الصلاحية' : 'Invalid promo code',
        };
      }

      if (cartSubtotal < match.minOrder) {
        const diff = match.minOrder - cartSubtotal;
        return {
          success: false,
          message:
            language === 'ar'
              ? `الحد الأدنى لتطبيق الكود هو ${match.minOrder} ج.م (أضيفي منتجات بقيمة ${diff} ج.م)`
              : `Minimum order for this code is ${match.minOrder} EGP (add ${diff} EGP more)`,
        };
      }

      setActiveCoupon(match);
      return {
        success: true,
        message: language === 'ar' ? 'تم تطبيق كود الخصم بنجاح! 🎉' : 'Coupon applied successfully! 🎉',
      };
    },
    [coupons, cartSubtotal, language]
  );

  const removeCoupon = useCallback(() => {
    setActiveCoupon(null);
  }, []);

  // Create Order
  const createOrder = useCallback(
    async (orderData: {
      customerName: string;
      phone: string;
      governorate: string;
      city: string;
      address: string;
      notes?: string;
      paymentMethod: Order['paymentMethod'];
      senderTransferNumber?: string;
    }): Promise<Order> => {
      const orderId = generateOrderId();
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0] || '',
      }));

      const newOrder: Order = {
        id: orderId,
        customerName: orderData.customerName,
        phone: orderData.phone,
        governorate: orderData.governorate,
        city: orderData.city,
        address: orderData.address,
        notes: orderData.notes,
        items: orderItems,
        subtotal: cartSubtotal,
        discount: cartDiscount,
        shipping: cartShipping,
        total: cartTotal,
        couponCode: activeCoupon?.code,
        paymentMethod: orderData.paymentMethod,
        senderTransferNumber: orderData.senderTransferNumber,
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await storageService.saveOrder(newOrder);
      setOrders((prev) => [newOrder, ...prev]);

      // Update coupon usage
      if (activeCoupon) {
        const updatedCoupon = {
          ...activeCoupon,
          usedCount: activeCoupon.usedCount + 1,
        };
        await storageService.saveCoupon(updatedCoupon);
        setCoupons((prev) => prev.map((c) => (c.id === updatedCoupon.id ? updatedCoupon : c)));
      }

      // Update product stock counts
      for (const item of cart) {
        const prod = products.find((p) => p.id === item.product.id);
        if (prod) {
          const updatedProd = {
            ...prod,
            stock: Math.max(0, prod.stock - item.quantity),
          };
          await storageService.saveProduct(updatedProd);
        }
      }

      // Clear active cart & active coupon
      clearCart();

      return newOrder;
    },
    [cart, cartSubtotal, cartDiscount, cartShipping, cartTotal, activeCoupon, products, clearCart]
  );

  // Add Review
  const addReview = useCallback(
    async (reviewData: {
      productId: string;
      customerName: string;
      rating: number;
      comment: string;
      date?: string;
      verifiedPurchase?: boolean;
      status?: 'approved' | 'pending';
    }) => {
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        productId: reviewData.productId,
        customerName: reviewData.customerName,
        rating: reviewData.rating,
        comment: reviewData.comment,
        date: reviewData.date || new Date().toISOString().split('T')[0],
        verifiedPurchase: reviewData.verifiedPurchase !== undefined ? reviewData.verifiedPurchase : true,
        status: reviewData.status || 'approved',
      };

      await storageService.saveReview(newReview);
      setReviews((prev) => [newReview, ...prev]);

      // Recalculate product rating
      const prod = products.find((p) => p.id === reviewData.productId);
      if (prod) {
        const allProductReviews = [...reviews.filter((r) => r.productId === prod.id), newReview];
        const avg =
          allProductReviews.reduce((acc, r) => acc + r.rating, 0) / allProductReviews.length;
        const updatedProd: Product = {
          ...prod,
          rating: Number(avg.toFixed(1)),
          reviewCount: allProductReviews.length,
        };
        await storageService.saveProduct(updatedProd);
        setProducts((prev) => prev.map((p) => (p.id === prod.id ? updatedProd : p)));
      }

      showToast(
        language === 'ar' ? 'تم إضافة التقييم بنجاح' : 'Review Added',
        language === 'ar' ? 'تم حفظ التقييم ونشره في المتجر' : 'Review has been saved and published',
        'success'
      );
    },
    [products, reviews, language, showToast]
  );

  const saveReview = useCallback(
    async (review: Review) => {
      await storageService.saveReview(review);
      setReviews((prev) => {
        const idx = prev.findIndex((r) => r.id === review.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = review;
          return updated;
        }
        return [review, ...prev];
      });

      // Recalculate product rating
      const prod = products.find((p) => p.id === review.productId);
      if (prod) {
        const otherReviews = reviews.filter((r) => r.productId === prod.id && r.id !== review.id);
        const allProductReviews = [...otherReviews, review];
        const avg =
          allProductReviews.reduce((acc, r) => acc + r.rating, 0) / allProductReviews.length;
        const updatedProd: Product = {
          ...prod,
          rating: Number(avg.toFixed(1)),
          reviewCount: allProductReviews.length,
        };
        await storageService.saveProduct(updatedProd);
        setProducts((prev) => prev.map((p) => (p.id === prod.id ? updatedProd : p)));
      }

      showToast(
        language === 'ar' ? 'تم حفظ التقييم' : 'Review Saved',
        language === 'ar' ? 'تم تحديث بيانات التقييم بنجاح' : 'Review updated successfully',
        'success'
      );
    },
    [products, reviews, language, showToast]
  );

  // Admin CRUD Actions
  const saveProduct = useCallback(async (product: Product) => {
    await storageService.saveProduct(product);
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = product;
        return updated;
      }
      return [product, ...prev];
    });
  }, []);

  const addProduct = useCallback(
    async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> | Product) => {
      const newProd: Product = {
        ...product,
        id: 'id' in product && product.id ? product.id : `prod-${Date.now()}`,
        createdAt: 'createdAt' in product && product.createdAt ? product.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveProduct(newProd);
    },
    [saveProduct]
  );

  const updateProduct = useCallback(
    async (id: string, partial: Partial<Product>) => {
      const existing = products.find((p) => p.id === id);
      if (existing) {
        const updated: Product = {
          ...existing,
          ...partial,
          updatedAt: new Date().toISOString(),
        };
        await saveProduct(updated);
      }
    },
    [products, saveProduct]
  );

  const deleteProduct = useCallback(async (id: string) => {
    await storageService.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearAllProducts = useCallback(async () => {
    await storageService.clearAllProducts();
    setProducts([]);
    showToast(
      language === 'ar' ? 'تم حذف المنتجات' : 'Products Cleared',
      language === 'ar' ? 'تم مسح جميع المنتجات بنجاح، يمكنك الآن إضافة منتجاتك الخاصة' : 'All products have been removed successfully',
      'info'
    );
  }, [language, showToast]);

  const saveCategory = useCallback(async (category: Category) => {
    await storageService.saveCategory(category);
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === category.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = category;
        return updated;
      }
      return [...prev, category];
    });
  }, []);

  const createCategory = useCallback(
    async (cat: Omit<Category, 'id' | 'slug'> & { id?: string; slug?: string }) => {
      const slug = cat.slug || cat.name.en.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newCat: Category = {
        ...cat,
        id: cat.id || `cat-${Date.now()}`,
        slug,
      };
      await saveCategory(newCat);
    },
    [saveCategory]
  );

  const updateCategory = useCallback(
    async (id: string, partial: Partial<Category>) => {
      const existing = categories.find((c) => c.id === id);
      if (existing) {
        const updated: Category = { ...existing, ...partial };
        await saveCategory(updated);
      }
    },
    [categories, saveCategory]
  );

  const deleteCategory = useCallback(async (id: string) => {
    await storageService.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const ord = (await storageService.getOrders()).find((o) => o.id === orderId);
    if (ord) {
      const updated: Order = { ...ord, status, updatedAt: new Date().toISOString() };
      await storageService.saveOrder(updated);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    }
  }, []);

  const deleteOrder = useCallback(async (id: string) => {
    await storageService.deleteOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const saveCoupon = useCallback(async (coupon: Coupon) => {
    await storageService.saveCoupon(coupon);
    setCoupons((prev) => {
      const idx = prev.findIndex((c) => c.id === coupon.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = coupon;
        return updated;
      }
      return [...prev, coupon];
    });
  }, []);

  const createCoupon = useCallback(
    async (cp: Omit<Coupon, 'id'> & { id?: string; minOrderAmount?: number; usageCount?: number }) => {
      const newCp: Coupon = {
        id: cp.id || `cp-${Date.now()}`,
        code: cp.code,
        type: cp.type,
        value: cp.value,
        minOrder: (cp as any).minOrder ?? (cp as any).minOrderAmount ?? 0,
        usedCount: (cp as any).usedCount ?? (cp as any).usageCount ?? 0,
        isActive: cp.isActive !== undefined ? cp.isActive : true,
      };
      await saveCoupon(newCp);
    },
    [saveCoupon]
  );

  const updateCoupon = useCallback(
    async (id: string, partial: Partial<Coupon>) => {
      const existing = coupons.find((c) => c.id === id);
      if (existing) {
        const updated: Coupon = { ...existing, ...partial };
        await saveCoupon(updated);
      }
    },
    [coupons, saveCoupon]
  );

  const deleteCoupon = useCallback(async (id: string) => {
    await storageService.deleteCoupon(id);
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const deleteReview = useCallback(
    async (id: string) => {
      const reviewToDelete = reviews.find((r) => r.id === id);
      await storageService.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));

      if (reviewToDelete && reviewToDelete.productId) {
        const remainingProdReviews = reviews.filter(
          (r) => r.productId === reviewToDelete.productId && r.id !== id
        );
        const prod = products.find((p) => p.id === reviewToDelete.productId);
        if (prod) {
          const avg =
            remainingProdReviews.length > 0
              ? remainingProdReviews.reduce((acc, r) => acc + r.rating, 0) / remainingProdReviews.length
              : 5;
          const updatedProd: Product = {
            ...prod,
            rating: Number(avg.toFixed(1)),
            reviewCount: remainingProdReviews.length,
          };
          await storageService.saveProduct(updatedProd);
          setProducts((prev) => prev.map((p) => (p.id === prod.id ? updatedProd : p)));
        }
      }
    },
    [products, reviews]
  );

  const clearAllReviews = useCallback(async () => {
    await storageService.clearAllReviews();
    setReviews([]);
    // Reset all product rating and review count
    const updatedProducts = products.map((p) => ({
      ...p,
      rating: 5,
      reviewCount: 0,
    }));
    for (const p of updatedProducts) {
      await storageService.saveProduct(p);
    }
    setProducts(updatedProducts);
    showToast(
      language === 'ar' ? 'تم تنظيف التقييمات' : 'Reviews Cleared',
      language === 'ar' ? 'تم حذف كافة التقييمات السابقة بنجاح' : 'All reviews have been deleted',
      'success'
    );
  }, [products, language, showToast]);

  const saveSettings = useCallback(async (newSettings: StoreSettings) => {
    await storageService.saveSettings(newSettings);
    setSettings(newSettings);
  }, []);

  const updateSettings = saveSettings;

  const restoreBackup = useCallback(async (dump: any) => {
    await storageService.restoreFullDatabase(dump);
    await refreshAllData();
  }, [refreshAllData]);

  const restoreDatabase = restoreBackup;

  const resetDatabaseToDefaults = useCallback(async () => {
    await storageService.restoreFullDatabase({
      meta: { version: 1, initialized: true, updatedAt: new Date().toISOString() },
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      reviews: INITIAL_REVIEWS,
      coupons: INITIAL_COUPONS,
      settings: INITIAL_SETTINGS,
      orders: [],
      wishlist: [],
    });
    await refreshAllData();
  }, [refreshAllData]);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        orders,
        reviews,
        coupons,
        settings,
        cart,
        wishlist,
        language,
        currency,
        t,
        isLoading,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        quickViewProduct,
        setQuickViewProduct,
        toast,
        showToast,
        activeCoupon,
        cartSubtotal,
        cartDiscount,
        cartShipping,
        cartTotal,
        cartCount,
        freeShippingProgress,
        amountLeftForFreeShipping,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        applyCoupon,
        removeCoupon,
        createOrder,
        addReview,
        saveProduct,
        addProduct,
        updateProduct,
        deleteProduct,
        clearAllProducts,
        saveCategory,
        createCategory,
        updateCategory,
        deleteCategory,
        updateOrderStatus,
        deleteOrder,
        saveCoupon,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        deleteReview,
        saveReview,
        clearAllReviews,
        saveSettings,
        updateSettings,
        restoreBackup,
        restoreDatabase,
        resetDatabaseToDefaults,
        setLanguage,
        setCurrency,
        refreshAllData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
