import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';

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

  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  toast: ToastMessage | null;

  showToast: (
    title: string,
    message: string,
    type?: 'success' | 'error' | 'info' | 'warning'
  ) => void;

  activeCoupon: Coupon | null;
  cartSubtotal: number;
  cartDiscount: number;
  cartShipping: number;
  cartTotal: number;
  cartCount: number;
  freeShippingProgress: number;
  amountLeftForFreeShipping: number;

  addToCart: (
    product: Product,
    quantity?: number,
    selectedVariant?: string
  ) => void;

  removeFromCart: (productId: string) => void;

  updateCartQuantity: (
    productId: string,
    quantity: number
  ) => void;

  clearCart: () => void;

  toggleWishlist: (productId: string) => void;

  isInWishlist: (productId: string) => boolean;

  applyCoupon: (
    code: string
  ) => { success: boolean; message: string };

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

  saveProduct: (product: Product) => Promise<void>;

  addProduct: (
    product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> | Product
  ) => Promise<void>;

  updateProduct: (
    id: string,
    product: Partial<Product>
  ) => Promise<void>;

  deleteProduct: (id: string) => Promise<void>;

  clearAllProducts: () => Promise<void>;

  saveCategory: (category: Category) => Promise<void>;

  createCategory: (
    category: Omit<Category, 'id' | 'slug'> & {
      id?: string;
      slug?: string;
    }
  ) => Promise<void>;

  updateCategory: (
    id: string,
    category: Partial<Category>
  ) => Promise<void>;

  deleteCategory: (id: string) => Promise<void>;

  updateOrderStatus: (
    orderId: string,
    status: OrderStatus
  ) => Promise<void>;

  deleteOrder: (id: string) => Promise<void>;

  saveCoupon: (coupon: Coupon) => Promise<void>;

  createCoupon: (
    coupon: Omit<Coupon, 'id'> & {
      id?: string;
      minOrderAmount?: number;
      usageCount?: number;
    }
  ) => Promise<void>;

  updateCoupon: (
    id: string,
    coupon: Partial<Coupon>
  ) => Promise<void>;

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

const StoreContext = createContext<StoreContextType | undefined>(
  undefined
);

export const StoreProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] =
    useState<StoreSettings>(INITIAL_SETTINGS);

  const [wishlist, setWishlist] = useState<string[]>([]);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(
        'sun_beauty_active_cart'
      );

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeCoupon, setActiveCoupon] =
    useState<Coupon | null>(() => {
      try {
        const saved = localStorage.getItem(
          'sun_beauty_active_coupon'
        );

        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    });

  const [language, setLanguageState] =
    useState<Language>(() => {
      try {
        const saved = localStorage.getItem(
          'sun_beauty_lang'
        ) as Language;

        return saved === 'en' ? 'en' : 'ar';
      } catch {
        return 'ar';
      }
    });

  const [currency, setCurrencyState] =
    useState<CurrencyCode>(() => {
      try {
        const saved = localStorage.getItem(
          'sun_beauty_currency'
        );

        return (saved as CurrencyCode) || 'EGP';
      } catch {
        return 'EGP';
      }
    });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [quickViewProduct, setQuickViewProduct] =
    useState<Product | null>(null);

  const [toast, setToast] =
    useState<ToastMessage | null>(null);

  const t = useMemo(
    () => translations[language],
    [language]
  );

  const showToast = useCallback(
    (
      title: string,
      message: string,
      type:
        | 'success'
        | 'error'
        | 'info'
        | 'warning' = 'success'
    ) => {
      const id = Date.now().toString();

      setToast({
        id,
        title,
        message,
        type,
      });

      setTimeout(() => {
        setToast((current) =>
          current?.id === id ? null : current
        );
      }, 4000);
    },
    []
  );

  /*
   * =========================================================
   * MERGE PRODUCTS
   * =========================================================
   *
   * مهم:
   * لو عندنا منتجات محفوظة قديمة، لا نحذف المنتجات الموجودة
   * في INITIAL_PRODUCTS.
   *
   * لو نفس ID موجود في الاثنين، البيانات المحفوظة هي التي
   * تأخذ الأولوية.
   */

  const mergeProducts = useCallback(
    (storedProducts: Product[] = []) => {
      const productMap = new Map<string, Product>();

      INITIAL_PRODUCTS.forEach((product) => {
        productMap.set(product.id, product);
      });

      storedProducts.forEach((product) => {
        productMap.set(product.id, product);
      });

      return Array.from(productMap.values());
    },
    []
  );

  // =========================================================
  // LOAD ALL DATA
  // =========================================================

  const refreshAllData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [
        prods,
        cats,
        ords,
        revs,
        cps,
        sttngs,
        wsh,
      ] = await Promise.all([
        storageService.getProducts(),
        storageService.getCategories(),
        storageService.getOrders(),
        storageService.getReviews(),
        storageService.getCoupons(),
        storageService.getSettings(),
        storageService.getWishlist(),
      ]);

      // FIX:
      // دمج المنتجات المحفوظة مع INITIAL_PRODUCTS
      setProducts(
        mergeProducts(prods || [])
      );

      setCategories(
        cats && cats.length > 0
          ? cats
          : INITIAL_CATEGORIES
      );

      setOrders(ords || []);

      setReviews(
        revs && revs.length > 0
          ? revs
          : INITIAL_REVIEWS
      );

      setCoupons(
        cps && cps.length > 0
          ? cps
          : INITIAL_COUPONS
      );

      setSettings(
        sttngs || INITIAL_SETTINGS
      );

      setWishlist(wsh || []);

      try {
        const firebaseOrders =
          await firebaseService.getOrders();

        if (
          firebaseOrders &&
          firebaseOrders.length > 0
        ) {
          setOrders(firebaseOrders);
        }
      } catch (error) {
        console.warn(
          'Firebase orders unavailable:',
          error
        );
      }
    } catch (error) {
      console.error(
        'Failed to load store data:',
        error
      );

      setProducts(
        mergeProducts([])
      );

      setCategories(INITIAL_CATEGORIES);
      setOrders([]);
      setReviews(INITIAL_REVIEWS);
      setCoupons(INITIAL_COUPONS);
      setSettings(INITIAL_SETTINGS);
      setWishlist([]);
    } finally {
      setIsLoading(false);
    }
  }, [mergeProducts]);

  // =========================================================
  // INITIAL LOAD + FIREBASE
  // =========================================================

  useEffect(() => {
    let unsubscribeProducts: (() => void) | undefined;
    let unsubscribeCategories: (() => void) | undefined;
    let unsubscribeOrders: (() => void) | undefined;
    let unsubscribeReviews: (() => void) | undefined;
    let unsubscribeCoupons: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;

    const initializeStore = async () => {
      await refreshAllData();

      try {
        unsubscribeProducts =
          firebaseService.subscribeToProducts(
            (cloudProducts) => {
              /*
               * FIX:
               * Firebase لو عنده منتج واحد فقط لا يمسح
               * INITIAL_PRODUCTS.
               */
              if (
                cloudProducts &&
                cloudProducts.length > 0
              ) {
                setProducts(
                  mergeProducts(cloudProducts)
                );
              }
            }
          );

        unsubscribeCategories =
          firebaseService.subscribeToCategories(
            (cloudCategories) => {
              if (cloudCategories) {
                setCategories(cloudCategories);
              }
            }
          );

        unsubscribeOrders =
          firebaseService.subscribeToOrders(
            (cloudOrders) => {
              if (cloudOrders) {
                setOrders(cloudOrders);
              }
            }
          );

        unsubscribeReviews =
          firebaseService.subscribeToReviews(
            (cloudReviews) => {
              if (cloudReviews) {
                setReviews(cloudReviews);
              }
            }
          );

        unsubscribeCoupons =
          firebaseService.subscribeToCoupons(
            (cloudCoupons) => {
              if (cloudCoupons) {
                setCoupons(cloudCoupons);
              }
            }
          );

        unsubscribeSettings =
          firebaseService.subscribeToSettings(
            (cloudSettings) => {
              if (cloudSettings) {
                setSettings(cloudSettings);
              }
            }
          );
      } catch (error) {
        console.warn(
          'Firebase realtime subscriptions:',
          error
        );
      }
    };

    initializeStore();

    return () => {
      try {
        unsubscribeProducts?.();
        unsubscribeCategories?.();
        unsubscribeOrders?.();
        unsubscribeReviews?.();
        unsubscribeCoupons?.();
        unsubscribeSettings?.();
      } catch (error) {
        console.warn(
          'Error unsubscribing Firebase listeners:',
          error
        );
      }
    };
  }, [refreshAllData, mergeProducts]);

  // =========================================================
  // LANGUAGE
  // =========================================================

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;

      document.documentElement.dir =
        language === 'ar' ? 'rtl' : 'ltr';
    }

    localStorage.setItem(
      'sun_beauty_lang',
      language
    );
  }, [language]);

  // =========================================================
  // CURRENCY
  // =========================================================

  useEffect(() => {
    localStorage.setItem(
      'sun_beauty_currency',
      currency
    );
  }, [currency]);

  // =========================================================
  // CART STORAGE
  // =========================================================

  useEffect(() => {
    localStorage.setItem(
      'sun_beauty_active_cart',
      JSON.stringify(cart)
    );
  }, [cart]);

  // =========================================================
  // COUPON STORAGE
  // =========================================================

  useEffect(() => {
    if (activeCoupon) {
      localStorage.setItem(
        'sun_beauty_active_coupon',
        JSON.stringify(activeCoupon)
      );
    } else {
      localStorage.removeItem(
        'sun_beauty_active_coupon'
      );
    }
  }, [activeCoupon]);

  // =========================================================
  // LANGUAGE / CURRENCY ACTIONS
  // =========================================================

  const setLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang);
    },
    []
  );

  const setCurrency = useCallback(
    (curr: CurrencyCode) => {
      setCurrencyState(curr);
    },
    []
  );

  // =========================================================
  // CART
  // =========================================================

  const addToCart = useCallback(
    (
      product: Product,
      quantity = 1,
      selectedVariant?: string
    ) => {
      setCart((previous) => {
        const existingIndex =
          previous.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.selectedVariant === selectedVariant
          );

        if (existingIndex >= 0) {
          const updated = [...previous];

          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity:
              updated[existingIndex].quantity +
              quantity,
          };

          return updated;
        }

        return [
          ...previous,
          {
            product,
            quantity,
            selectedVariant,
          },
        ];
      });

      const productName =
        language === 'ar'
          ? product.name.ar
          : product.name.en;

      showToast(
        language === 'ar'
          ? 'تمت الإضافة للسلة'
          : 'Added to Bag',
        `${productName} (${quantity})`,
        'success'
      );
    },
    [language, showToast]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setCart((previous) =>
        previous.filter(
          (item) => item.product.id !== productId
        )
      );
    },
    []
  );

  const updateCartQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        setCart((previous) =>
          previous.filter(
            (item) =>
              item.product.id !== productId
          )
        );

        return;
      }

      setCart((previous) =>
        previous.map((item) =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setActiveCoupon(null);
  }, []);

  // =========================================================
  // WISHLIST
  // =========================================================

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((previous) => {
        const exists =
          previous.includes(productId);

        const updated = exists
          ? previous.filter(
              (id) => id !== productId
            )
          : [...previous, productId];

        storageService.saveWishlist(updated);

        showToast(
          language === 'ar'
            ? exists
              ? 'تمت الإزالة من المفضلة'
              : 'تمت الإضافة للمفضلة'
            : exists
            ? 'Removed from Wishlist'
            : 'Added to Wishlist',
          '',
          exists ? 'info' : 'success'
        );

        return updated;
      });
    },
    [language, showToast]
  );

  const isInWishlist = useCallback(
    (productId: string) =>
      wishlist.includes(productId),
    [wishlist]
  );

  // =========================================================
  // CART CALCULATIONS
  // =========================================================

  const cartSubtotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        item.product.price * item.quantity,
      0
    );
  }, [cart]);

  const cartDiscount = useMemo(() => {
    if (!activeCoupon || cartSubtotal <= 0) {
      return 0;
    }

    if (
      cartSubtotal <
      activeCoupon.minOrder
    ) {
      return 0;
    }

    if (
      activeCoupon.type === 'percentage'
    ) {
      const discount =
        (cartSubtotal *
          activeCoupon.value) /
        100;

      return activeCoupon.maxDiscount
        ? Math.min(
            discount,
            activeCoupon.maxDiscount
          )
        : discount;
    }

    return Math.min(
      activeCoupon.value,
      cartSubtotal
    );
  }, [activeCoupon, cartSubtotal]);

  const cartShipping = useMemo(() => {
    if (cartSubtotal <= 0) {
      return 0;
    }

    if (
      cartSubtotal >=
      settings.freeShippingThreshold
    ) {
      return 0;
    }

    return settings.shippingFee;
  }, [
    cartSubtotal,
    settings.freeShippingThreshold,
    settings.shippingFee,
  ]);

  const cartTotal = useMemo(() => {
    return Math.max(
      0,
      cartSubtotal -
        cartDiscount +
        cartShipping
    );
  }, [
    cartSubtotal,
    cartDiscount,
    cartShipping,
  ]);

  const cartCount = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );
  }, [cart]);

  const freeShippingProgress = useMemo(() => {
    if (
      cartSubtotal >=
      settings.freeShippingThreshold
    ) {
      return 100;
    }

    if (
      settings.freeShippingThreshold <= 0
    ) {
      return 100;
    }

    return Math.min(
      100,
      Math.round(
        (cartSubtotal /
          settings.freeShippingThreshold) *
          100
      )
    );
  }, [
    cartSubtotal,
    settings.freeShippingThreshold,
  ]);

  const amountLeftForFreeShipping =
    useMemo(() => {
      return Math.max(
        0,
        settings.freeShippingThreshold -
          cartSubtotal
      );
    }, [
      settings.freeShippingThreshold,
      cartSubtotal,
    ]);

  // =========================================================
  // COUPONS
  // =========================================================

  const applyCoupon = useCallback(
    (code: string) => {
      const cleaned =
        code.trim().toUpperCase();

      const match = coupons.find(
        (coupon) =>
          coupon.code.toUpperCase() ===
            cleaned &&
          coupon.isActive
      );

      if (!match) {
        return {
          success: false,
          message:
            language === 'ar'
              ? 'كود الخصم غير صحيح أو منتهي الصلاحية'
              : 'Invalid promo code',
        };
      }

      if (
        cartSubtotal <
        match.minOrder
      ) {
        const difference =
          match.minOrder -
          cartSubtotal;

        return {
          success: false,
          message:
            language === 'ar'
              ? `الحد الأدنى لتطبيق الكود هو ${match.minOrder} ج.م (أضيفي منتجات بقيمة ${difference} ج.م)`
              : `Minimum order for this code is ${match.minOrder} EGP (add ${difference} EGP more)`,
        };
      }

      if (
        match.usageLimit &&
        match.usedCount >=
          match.usageLimit
      ) {
        return {
          success: false,
          message:
            language === 'ar'
              ? 'تم الوصول للحد الأقصى لاستخدام هذا الكود'
              : 'This coupon has reached its usage limit',
        };
      }

      if (
        match.expiryDate &&
        new Date(match.expiryDate) <
          new Date()
      ) {
        return {
          success: false,
          message:
            language === 'ar'
              ? 'هذا الكود منتهي الصلاحية'
              : 'This coupon has expired',
        };
      }

      setActiveCoupon(match);

      return {
        success: true,
        message:
          language === 'ar'
            ? 'تم تطبيق كود الخصم بنجاح! 🎉'
            : 'Coupon applied successfully! 🎉',
      };
    },
    [coupons, cartSubtotal, language]
  );

  const removeCoupon = useCallback(() => {
    setActiveCoupon(null);
  }, []);

  // =========================================================
  // CREATE ORDER
  // =========================================================

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
      const orderId =
        generateOrderId();

      const orderItems =
        cart.map((item) => ({
          productId:
            item.product.id,
          productName:
            item.product.name,
          price:
            item.product.price,
          quantity:
            item.quantity,
          image:
            item.product.images[0] || '',
        }));

      const newOrder: Order = {
        id: orderId,
        customerName:
          orderData.customerName,
        phone:
          orderData.phone,
        governorate:
          orderData.governorate,
        city:
          orderData.city,
        address:
          orderData.address,
        notes:
          orderData.notes,
        items:
          orderItems,
        subtotal:
          cartSubtotal,
        discount:
          cartDiscount,
        shipping:
          cartShipping,
        total:
          cartTotal,
        couponCode:
          activeCoupon?.code,
        paymentMethod:
          orderData.paymentMethod,
        senderTransferNumber:
          orderData.senderTransferNumber,
        status: 'new',
        createdAt:
          new Date().toISOString(),
        updatedAt:
          new Date().toISOString(),
      };

      await storageService.saveOrder(
        newOrder
      );

      setOrders((previous) => [
        newOrder,
        ...previous,
      ]);

      try {
        await firebaseService.saveOrder(
          newOrder
        );
      } catch (error) {
        console.warn(
          'Firebase order save failed:',
          error
        );
      }

      if (activeCoupon) {
        const updatedCoupon = {
          ...activeCoupon,
          usedCount:
            activeCoupon.usedCount + 1,
        };

        await storageService.saveCoupon(
          updatedCoupon
        );

        setCoupons((previous) =>
          previous.map((coupon) =>
            coupon.id ===
            updatedCoupon.id
              ? updatedCoupon
              : coupon
          )
        );
      }

      for (const item of cart) {
        const product =
          products.find(
            (p) =>
              p.id ===
              item.product.id
          );

        if (!product) {
          continue;
        }

        const updatedProduct = {
          ...product,
          stock: Math.max(
            0,
            product.stock -
              item.quantity
          ),
          updatedAt:
            new Date().toISOString(),
        };

        await storageService.saveProduct(
          updatedProduct
        );

        setProducts((previous) =>
          previous.map((p) =>
            p.id ===
            updatedProduct.id
              ? updatedProduct
              : p
          )
        );
      }

      clearCart();

      return newOrder;
    },
    [
      cart,
      cartSubtotal,
      cartDiscount,
      cartShipping,
      cartTotal,
      activeCoupon,
      products,
      clearCart,
    ]
  );

  // =========================================================
  // REVIEWS
  // =========================================================

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
        productId:
          reviewData.productId,
        customerName:
          reviewData.customerName,
        rating:
          reviewData.rating,
        comment:
          reviewData.comment,
        date:
          reviewData.date ||
          new Date()
            .toISOString()
            .split('T')[0],
        verifiedPurchase:
          reviewData.verifiedPurchase ??
          true,
        status:
          reviewData.status ||
          'approved',
      };

      await storageService.saveReview(
        newReview
      );

      setReviews((previous) => [
        newReview,
        ...previous,
      ]);

      const product =
        products.find(
          (p) =>
            p.id ===
            reviewData.productId
        );

      if (product) {
        const productReviews = [
          ...reviews.filter(
            (review) =>
              review.productId ===
              product.id
          ),
          newReview,
        ];

        const average =
          productReviews.reduce(
            (sum, review) =>
              sum + review.rating,
            0
          ) /
          productReviews.length;

        const updatedProduct: Product = {
          ...product,
          rating:
            Number(
              average.toFixed(1)
            ),
          reviewCount:
            productReviews.length,
        };

        await storageService.saveProduct(
          updatedProduct
        );

        setProducts((previous) =>
          previous.map((p) =>
            p.id ===
            updatedProduct.id
              ? updatedProduct
              : p
          )
        );
      }

      showToast(
        language === 'ar'
          ? 'تم إضافة التقييم بنجاح'
          : 'Review Added',
        language === 'ar'
          ? 'تم حفظ التقييم ونشره في المتجر'
          : 'Review has been saved and published',
        'success'
      );
    },
    [
      products,
      reviews,
      language,
      showToast,
    ]
  );

  const saveReview = useCallback(
    async (review: Review) => {
      await storageService.saveReview(
        review
      );

      setReviews((previous) => {
        const index =
          previous.findIndex(
            (r) =>
              r.id === review.id
          );

        if (index >= 0) {
          const updated = [
            ...previous,
          ];

          updated[index] = review;

          return updated;
        }

        return [
          review,
          ...previous,
        ];
      });

      const product =
        products.find(
          (p) =>
            p.id ===
            review.productId
        );

      if (product) {
        const otherReviews =
          reviews.filter(
            (r) =>
              r.productId ===
                product.id &&
              r.id !== review.id
          );

        const allReviews = [
          ...otherReviews,
          review,
        ];

        const average =
          allReviews.reduce(
            (sum, r) =>
              sum + r.rating,
            0
          ) /
          allReviews.length;

        const updatedProduct: Product = {
          ...product,
          rating:
            Number(
              average.toFixed(1)
            ),
          reviewCount:
            allReviews.length,
        };

        await storageService.saveProduct(
          updatedProduct
        );

        setProducts((previous) =>
          previous.map((p) =>
            p.id ===
            updatedProduct.id
              ? updatedProduct
              : p
          )
        );
      }

      showToast(
        language === 'ar'
          ? 'تم حفظ التقييم'
          : 'Review Saved',
        language === 'ar'
          ? 'تم تحديث بيانات التقييم بنجاح'
          : 'Review updated successfully',
        'success'
      );
    },
    [
      products,
      reviews,
      language,
      showToast,
    ]
  );

  const deleteReview = useCallback(
    async (id: string) => {
      const review =
        reviews.find(
          (r) => r.id === id
        );

      await storageService.deleteReview(
        id
      );

      setReviews((previous) =>
        previous.filter(
          (r) => r.id !== id
        )
      );

      if (
        review &&
        review.productId
      ) {
        const remaining =
          reviews.filter(
            (r) =>
              r.productId ===
                review.productId &&
              r.id !== id
          );

        const product =
          products.find(
            (p) =>
              p.id ===
              review.productId
          );

        if (product) {
          const average =
            remaining.length > 0
              ? remaining.reduce(
                  (sum, r) =>
                    sum + r.rating,
                  0
                ) /
                remaining.length
              : 5;

          const updatedProduct: Product = {
            ...product,
            rating:
              Number(
                average.toFixed(1)
              ),
            reviewCount:
              remaining.length,
          };

          await storageService.saveProduct(
            updatedProduct
          );

          setProducts((previous) =>
            previous.map((p) =>
              p.id ===
              updatedProduct.id
                ? updatedProduct
                : p
            )
          );
        }
      }
    },
    [products, reviews]
  );

  const clearAllReviews =
    useCallback(async () => {
      await storageService.clearAllReviews();

      setReviews([]);

      const updatedProducts =
        products.map((product) => ({
          ...product,
          rating: 5,
          reviewCount: 0,
        }));

      for (const product of updatedProducts) {
        await storageService.saveProduct(
          product
        );
      }

      setProducts(updatedProducts);

      showToast(
        language === 'ar'
          ? 'تم تنظيف التقييمات'
          : 'Reviews Cleared',
        language === 'ar'
          ? 'تم حذف كافة التقييمات السابقة بنجاح'
          : 'All reviews have been deleted',
        'success'
      );
    }, [
      products,
      language,
      showToast,
    ]);

  // =========================================================
  // PRODUCTS
  // =========================================================

  const saveProduct = useCallback(
    async (product: Product) => {
      await storageService.saveProduct(
        product
      );

      setProducts((previous) => {
        const index =
          previous.findIndex(
            (p) =>
              p.id === product.id
          );

        if (index >= 0) {
          const updated = [
            ...previous,
          ];

          updated[index] = product;

          return updated;
        }

        return [
          ...previous,
          product,
        ];
      });
    },
    []
  );

  const addProduct = useCallback(
    async (
      product:
        | Omit<
            Product,
            'id' |
              'createdAt' |
              'updatedAt'
          >
        | Product
    ) => {
      const newProduct: Product = {
        ...product,

        id:
          'id' in product &&
          product.id
            ? product.id
            : `prod-${Date.now()}`,

        createdAt:
          'createdAt' in product &&
          product.createdAt
            ? product.createdAt
            : new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),
      };

      await saveProduct(
        newProduct
      );
    },
    [saveProduct]
  );

  const updateProduct = useCallback(
    async (
      id: string,
      partial: Partial<Product>
    ) => {
      const existing =
        products.find(
          (product) =>
            product.id === id
        );

      if (!existing) {
        return;
      }

      const updatedProduct: Product = {
        ...existing,
        ...partial,
        updatedAt:
          new Date().toISOString(),
      };

      await saveProduct(
        updatedProduct
      );
    },
    [products, saveProduct]
  );

  const deleteProduct =
    useCallback(async (id: string) => {
      await storageService.deleteProduct(
        id
      );

      setProducts((previous) =>
        previous.filter(
          (product) =>
            product.id !== id
        )
      );
    }, []);

  const clearAllProducts =
    useCallback(async () => {
      await storageService.clearAllProducts();

      setProducts([]);

      showToast(
        language === 'ar'
          ? 'تم حذف المنتجات'
          : 'Products Cleared',
        language === 'ar'
          ? 'تم مسح جميع المنتجات بنجاح'
          : 'All products have been removed successfully',
        'info'
      );
    }, [
      language,
      showToast,
    ]);

  // =========================================================
  // CATEGORIES
  // =========================================================

  const saveCategory = useCallback(
    async (category: Category) => {
      await storageService.saveCategory(
        category
      );

      setCategories((previous) => {
        const index =
          previous.findIndex(
            (c) =>
              c.id === category.id
          );

        if (index >= 0) {
          const updated = [
            ...previous,
          ];

          updated[index] = category;

          return updated;
        }

        return [
          ...previous,
          category,
        ];
      });
    },
    []
  );

  const createCategory =
    useCallback(
      async (
        category: Omit<
          Category,
          'id' | 'slug'
        > & {
          id?: string;
          slug?: string;
        }
      ) => {
        const slug =
          category.slug ||
          category.name.en
            .toLowerCase()
            .replace(
              /[^a-z0-9]+/g,
              '-'
            )
            .replace(
              /^-|-$/g,
              ''
            );

        const newCategory: Category = {
          ...category,
          id:
            category.id ||
            `cat-${Date.now()}`,
          slug,
        };

        await saveCategory(
          newCategory
        );
      },
      [saveCategory]
    );

  const updateCategory =
    useCallback(
      async (
        id: string,
        partial: Partial<Category>
      ) => {
        const existing =
          categories.find(
            (category) =>
              category.id === id
          );

        if (!existing) {
          return;
        }

        await saveCategory({
          ...existing,
          ...partial,
        });
      },
      [categories, saveCategory]
    );

  const deleteCategory =
    useCallback(async (id: string) => {
      await storageService.deleteCategory(
        id
      );

      setCategories((previous) =>
        previous.filter(
          (category) =>
            category.id !== id
        )
      );
    }, []);

  // =========================================================
  // ORDERS
  // =========================================================

  const updateOrderStatus =
    useCallback(
      async (
        orderId: string,
        status: OrderStatus
      ) => {
        const existingOrders =
          await storageService.getOrders();

        const order =
          existingOrders.find(
            (item) =>
              item.id === orderId
          );

        if (!order) {
          return;
        }

        const updatedOrder: Order = {
          ...order,
          status,
          updatedAt:
            new Date().toISOString(),
        };

        await storageService.saveOrder(
          updatedOrder
        );

        setOrders((previous) =>
          previous.map((item) =>
            item.id === orderId
              ? updatedOrder
              : item
          )
        );

        try {
          await firebaseService.saveOrder(
            updatedOrder
          );
        } catch (error) {
          console.warn(
            'Firebase order update failed:',
            error
          );
        }
      },
      []
    );

  const deleteOrder =
    useCallback(async (id: string) => {
      await storageService.deleteOrder(
        id
      );

      setOrders((previous) =>
        previous.filter(
          (order) =>
            order.id !== id
        )
      );
    }, []);

  // =========================================================
  // COUPONS
  // =========================================================

  const saveCoupon = useCallback(
    async (coupon: Coupon) => {
      await storageService.saveCoupon(
        coupon
      );

      setCoupons((previous) => {
        const index =
          previous.findIndex(
            (item) =>
              item.id === coupon.id
          );

        if (index >= 0) {
          const updated = [
            ...previous,
          ];

          updated[index] = coupon;

          return updated;
        }

        return [
          ...previous,
          coupon,
        ];
      });
    },
    []
  );

  const createCoupon =
    useCallback(
      async (
        coupon: Omit<Coupon, 'id'> & {
          id?: string;
          minOrderAmount?: number;
          usageCount?: number;
        }
      ) => {
        const newCoupon: Coupon = {
          id:
            coupon.id ||
            `cp-${Date.now()}`,

          code: coupon.code,

          type: coupon.type,

          value: coupon.value,

          minOrder:
            coupon.minOrder ??
            coupon.minOrderAmount ??
            0,

          usedCount:
            coupon.usedCount ??
            coupon.usageCount ??
            0,

          isActive:
            coupon.isActive ??
            true,

          expiryDate:
            coupon.expiryDate,

          usageLimit:
            coupon.usageLimit,

          maxDiscount:
            coupon.maxDiscount,
        };

        await saveCoupon(
          newCoupon
        );
      },
      [saveCoupon]
    );

  const updateCoupon =
    useCallback(
      async (
        id: string,
        partial: Partial<Coupon>
      ) => {
        const existing =
          coupons.find(
            (coupon) =>
              coupon.id === id
          );

        if (!existing) {
          return;
        }

        await saveCoupon({
          ...existing,
          ...partial,
        });
      },
      [coupons, saveCoupon]
    );

  const deleteCoupon =
    useCallback(async (id: string) => {
      await storageService.deleteCoupon(
        id
      );

      setCoupons((previous) =>
        previous.filter(
          (coupon) =>
            coupon.id !== id
        )
      );
    }, []);

  // =========================================================
  // SETTINGS
  // =========================================================

  const saveSettings = useCallback(
    async (
      newSettings: StoreSettings
    ) => {
      await storageService.saveSettings(
        newSettings
      );

      setSettings(newSettings);
    },
    []
  );

  const updateSettings = saveSettings;

  // =========================================================
  // DATABASE
  // =========================================================

  const restoreBackup = useCallback(
    async (dump: any) => {
      await storageService.restoreFullDatabase(
        dump
      );

      await refreshAllData();
    },
    [refreshAllData]
  );

  const restoreDatabase =
    restoreBackup;

  const resetDatabaseToDefaults =
    useCallback(async () => {
      await storageService.restoreFullDatabase(
        {
          meta: {
            version: 1,
            initialized: true,
            updatedAt:
              new Date().toISOString(),
          },

          products:
            INITIAL_PRODUCTS,

          categories:
            INITIAL_CATEGORIES,

          reviews:
            INITIAL_REVIEWS,

          coupons:
            INITIAL_COUPONS,

          settings:
            INITIAL_SETTINGS,

          orders: [],

          wishlist: [],
        }
      );

      await refreshAllData();
    }, [refreshAllData]);

  // =========================================================
  // PROVIDER
  // =========================================================

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
        saveReview,
        deleteReview,
        clearAllReviews,

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

// =========================================================
// HOOK
// =========================================================

export const useStore = () => {
  const context =
    useContext(StoreContext);

  if (!context) {
    throw new Error(
      'useStore must be used within a StoreProvider'
    );
  }

  return context;
};