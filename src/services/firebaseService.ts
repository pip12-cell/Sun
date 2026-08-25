import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';

import { db } from './firebase';

import {
  Category,
  Coupon,
  Order,
  Product,
  Review,
  StoreSettings,
} from '../types';

import {
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
} from '../data/initialData';

// ============================================================
// FIRESTORE COLLECTIONS
// ============================================================

const COLLECTIONS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  COUPONS: 'coupons',
  SETTINGS: 'settings',
  META: 'meta',
} as const;

// ============================================================
// FIREBASE SERVICE
// ============================================================

class FirebaseService {
  private isInitialized = false;

  // ==========================================================
  // INITIALIZE FIRESTORE
  // ==========================================================

  public async initializeFirestoreIfNeeded(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const metaDocRef = doc(
        db,
        COLLECTIONS.META,
        'db_meta'
      );

      const metaSnap = await getDoc(metaDocRef);

      // ------------------------------------------------------
      // Database already initialized
      // ------------------------------------------------------

      if (metaSnap.exists()) {
        this.isInitialized = true;
        return;
      }

      console.log(
        '⚡ Initializing Sun Beauty Firestore database...'
      );

      const batch = writeBatch(db);

      // ------------------------------------------------------
      // Products
      // ------------------------------------------------------

      for (const product of INITIAL_PRODUCTS) {
        const ref = doc(
          db,
          COLLECTIONS.PRODUCTS,
          product.id
        );

        batch.set(ref, product);
      }

      // ------------------------------------------------------
      // Categories
      // ------------------------------------------------------

      for (const category of INITIAL_CATEGORIES) {
        const ref = doc(
          db,
          COLLECTIONS.CATEGORIES,
          category.id
        );

        batch.set(ref, category);
      }

      // ------------------------------------------------------
      // Reviews
      // ------------------------------------------------------

      for (const review of INITIAL_REVIEWS) {
        const ref = doc(
          db,
          COLLECTIONS.REVIEWS,
          review.id
        );

        batch.set(ref, review);
      }

      // ------------------------------------------------------
      // Coupons
      // ------------------------------------------------------

      for (const coupon of INITIAL_COUPONS) {
        const ref = doc(
          db,
          COLLECTIONS.COUPONS,
          coupon.id
        );

        batch.set(ref, coupon);
      }

      // ------------------------------------------------------
      // Settings
      // ------------------------------------------------------

      const settingsRef = doc(
        db,
        COLLECTIONS.SETTINGS,
        'main_settings'
      );

      batch.set(
        settingsRef,
        INITIAL_SETTINGS
      );

      // ------------------------------------------------------
      // Meta
      // ------------------------------------------------------

      batch.set(
        metaDocRef,
        {
          initialized: true,
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
        }
      );

      await batch.commit();

      console.log(
        '✅ Sun Beauty Firestore initialized successfully!'
      );

      this.isInitialized = true;
    } catch (error) {
      console.error(
        '❌ Firestore initialization error:',
        error
      );

      // لا نرمي الخطأ حتى لا يمنع التطبيق من العمل
      this.isInitialized = true;
    }
  }

  // ==========================================================
  // PRODUCTS
  // ==========================================================

  public async getProducts(): Promise<Product[]> {
    try {
      const snapshot = await getDocs(
        collection(db, COLLECTIONS.PRODUCTS)
      );

      const products: Product[] = [];

      snapshot.forEach((item) => {
        if (item.exists()) {
          products.push({
            id: item.id,
            ...item.data(),
          } as Product);
        }
      });

      return products;
    } catch (error) {
      console.error(
        '❌ Firestore getProducts error:',
        error
      );

      return [];
    }
  }

  public subscribeToProducts(
    callback: (products: Product[]) => void
  ): Unsubscribe {
    const collectionRef = collection(
      db,
      COLLECTIONS.PRODUCTS
    );

    return onSnapshot(
      collectionRef,
      (snapshot) => {
        const products: Product[] = [];

        snapshot.forEach((item) => {
          if (item.exists()) {
            products.push({
              id: item.id,
              ...item.data(),
            } as Product);
          }
        });

        callback(products);
      },
      (error) => {
        console.error(
          '❌ Products subscription error:',
          error
        );
      }
    );
  }

  public async saveProduct(
    product: Product
  ): Promise<void> {
    const ref = doc(
      db,
      COLLECTIONS.PRODUCTS,
      product.id
    );

    await setDoc(
      ref,
      product,
      { merge: true }
    );
  }

  public async deleteProduct(
    productId: string
  ): Promise<void> {
    const ref = doc(
      db,
      COLLECTIONS.PRODUCTS,
      productId
    );

    await deleteDoc(ref);
  }

  public async clearAllProducts(): Promise<void> {
    try {
      const snapshot = await getDocs(
        collection(
          db,
          COLLECTIONS.PRODUCTS
        )
      );

      if (snapshot.empty) {
        return;
      }

      const batch = writeBatch(db);

      snapshot.forEach((item) => {
        batch.delete(item.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error(
        '❌ clearAllProducts error:',
        error
      );
    }
  }

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  public async getCategories(): Promise<Category[]> {
    try {
      const snapshot = await getDocs(
        collection(
          db,
          COLLECTIONS.CATEGORIES
        )
      );

      if (snapshot.empty) {
        return INITIAL_CATEGORIES;
      }

      const categories: Category[] = [];

      snapshot.forEach((item) => {
        if (item.exists()) {
          categories.push({
            id: item.id,
            ...item.data(),
          } as Category);
        }
      });

      categories.sort(
        (a, b) =>
          (a.order ?? 0) -
          (b.order ?? 0)
      );

      return categories;
    } catch (error) {
      console.error(
        '❌ getCategories error:',
        error
      );

      return INITIAL_CATEGORIES;
    }
  }

  public subscribeToCategories(
    callback: (categories: Category[]) => void
  ): Unsubscribe {
    const collectionRef = collection(
      db,
      COLLECTIONS.CATEGORIES
    );

    return onSnapshot(
      collectionRef,
      (snapshot) => {
        const categories: Category[] = [];

        snapshot.forEach((item) => {
          if (item.exists()) {
            categories.push({
              id: item.id,
              ...item.data(),
            } as Category);
          }
        });

        categories.sort(
          (a, b) =>
            (a.order ?? 0) -
            (b.order ?? 0)
        );

        callback(categories);
      },
      (error) => {
        console.error(
          '❌ Categories subscription error:',
          error
        );
      }
    );
  }

  public async saveCategory(
    category: Category
  ): Promise<void> {
    const ref = doc(
      db,
      COLLECTIONS.CATEGORIES,
      category.id
    );

    await setDoc(
      ref,
      category,
      { merge: true }
    );
  }

  public async deleteCategory(
    categoryId: string
  ): Promise<void> {
    const ref = doc(
      db,
      COLLECTIONS.CATEGORIES,
      categoryId
    );

    await deleteDoc(ref);
  }

  // ==========================================================
  // ORDERS
  // ==========================================================

  /**
   * مهم:
   *
   * Promise<Order[] | null>
   *
   * []   = Firebase اشتغل بنجاح ولكن لا توجد طلبات
   * null = حصل خطأ في Firebase
   *
   * هذا يمنع مسح الـ local cache عند حدوث خطأ.
   */

  public async getOrders(): Promise<Order[] | null> {
    try {
      const snapshot = await getDocs(
        collection(
          db,
          COLLECTIONS.ORDERS
        )
      );

      const orders: Order[] = [];

      snapshot.forEach((item) => {
        if (item.exists()) {
          orders.push({
            id: item.id,
            ...item.data(),
          } as Order);
        }
      });

      // ------------------------------------------------------
      // Sort newest first
      // ------------------------------------------------------

      orders.sort((a, b) => {
        const getTime = (
          order: Order
        ): number => {
          const createdAt = order?.createdAt;

          if (
            typeof createdAt === 'string'
          ) {
            const time =
              new Date(
                createdAt
              ).getTime();

            return Number.isNaN(time)
              ? 0
              : time;
          }

          if (
            createdAt &&
            typeof createdAt === 'object' &&
            'seconds' in createdAt
          ) {
            return (
              Number(
                createdAt.seconds
              ) * 1000
            );
          }

          return 0;
        };

        return (
          getTime(b) -
          getTime(a)
        );
      });

      // Firebase نجح
      return orders;
    } catch (error) {
      console.error(
        '❌ Firestore getOrders error:',
        error
      );

      // مهم جدًا:
      // لا ترجع [] هنا
      // لأن [] معناها "مفيش طلبات"
      // بينما null معناها "Firebase فيه مشكلة"
      return null;
    }
  }

  public subscribeToOrders(
    callback: (orders: Order[]) => void
  ): Unsubscribe {
    const collectionRef = collection(
      db,
      COLLECTIONS.ORDERS
    );

    return onSnapshot(
      collectionRef,
      (snapshot) => {
        const orders: Order[] = [];

        snapshot.forEach((item) => {
          if (item.exists()) {
            orders.push({
              id: item.id,
              ...item.data(),
            } as Order);
          }
        });

        orders.sort((a, b) => {
          const getTime = (
            order: Order
          ): number => {
            const createdAt =
              order?.createdAt;

            if (
              typeof createdAt === 'string'
            ) {
              const time =
                new Date(
                  createdAt
                ).getTime();

              return Number.isNaN(time)
                ? 0
                : time;
            }

            if (
              createdAt &&
              typeof createdAt === 'object' &&
              'seconds' in createdAt
            ) {
              return (
                Number(
                  createdAt.seconds
                ) * 1000
              );
            }

            return 0;
          };

          return (
            getTime(b) -
            getTime(a)
          );
        });

        callback(orders);
      },
      (error) => {
        console.error(
          '❌ Orders subscription error:',
          error
        );

        // لا نرسل [] هنا
        // حتى لا نمسح البيانات الموجودة محليًا
      }
    );
  }

  public async saveOrder(
    order: Order
  ): Promise<void> {
    const ref = doc(
      db,
      COLLECTIONS.ORDERS,
      order.id
    );

    const safeOrder = {
      ...order,

      createdAt:
        typeof order.createdAt === 'string'
          ? order.createdAt
          : new Date().toISOString(),
    };

    await setDoc(
      ref,
      safeOrder,
      { merge: true }
    );
  }

  public async deleteOrder(
    orderId: string
  ): Promise<void> {
    const ref = doc(
      db,
      COLLECTIONS.ORDERS,
      orderId
    );

    await deleteDoc(ref);
  }

  // ==========================================================
  // REVIEWS
  // ==========================================================

  public async getReviews(): Promise<Review[]> {
    try {
      const snapshot = await getDocs(
        collection(
          db,
          COLLECTIONS.REVIEWS
        )
      );

      if (snapshot.empty) {
        return INITIAL_REVIEWS;
      }

      const reviews: Review[] = [];

      snapshot.forEach((item) => {
        if (item.exists()) {
          reviews.push({
            id: item.id,
            ...item.data(),
          } as Review);
        }
      });

      reviews.sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );

      return reviews;
    } catch (error) {
      console.error(
        '❌ getReviews error:',
        error
      );

      return INITIAL_REVIEWS;
    }
  }

  public subscribeToReviews(
    callback: (reviews: Review[]) => void
  ): Unsubscribe {
    const collectionRef = collection(
      db,
      COLLECTIONS.REVIEWS
    );

    return onSnapshot(
      collectionRef,
      (snapshot) => {
        const reviews: Review[] = [];

        snapshot.forEach((item) => {
          if (item.exists()) {
            reviews.push({
              id: item.id,
              ...item.data(),
            } as Review);
          }
        });

        reviews.sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        );

        callback(reviews);
      },
      (error) => {
        console.error(
          '❌ Reviews subscription error:',
          error
        );
      }
    );
  }

  public async saveReview(
    review: Review
  ): Promise<void> {
    const ref = doc(
      db,
      COLLECTIONS.REVIEWS,
      review.id
    );

    await setDoc(
      ref,
      review,
      { merge: true }
    );
  }

  public async deleteReview(
    reviewId: string
  ): Promise<void> {
    const ref = doc(
      db,
      COLLECTIONS.REVIEWS,
      reviewId
    );

    await deleteDoc(ref);
  }

  public async clearAllReviews(): Promise<void> {
    try {
      const snapshot = await getDocs(
        collection(
          db,
          COLLECTIONS.REVIEWS
        )
      );

      if (snapshot.empty) {
        return;
      }

      const batch = writeBatch(db);

      snapshot.forEach((item) => {
        batch.delete(item.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error(
        '❌ clearAllReviews error:',
        error
      );
    }
  }

  // ==========================================================
  // COUPONS
  // ==========================================================

  public async getCoupons(): Promise<Coupon[]> {
    try {
      const snapshot = await getDocs(
        collection(
          db,
          COLLECTIONS.COUPONS
        )
      );

      if (snapshot.empty) {
        return INITIAL_COUPONS;
      }

      const coupons: Coupon[] = [];

      snapshot.forEach((item) => {
        if (item.exists()) {
          coupons.push({
            id: item.id,
            ...item.data(),
          } as Coupon);
        }
      });

      return coupons;
    } catch (error) {
      console.error(
        '❌ getCoupons error:',
        error
      );

      return INITIAL_COUPONS;
    }
  }

  public subscribeToCoupons(
    callback: (coupons: Coupon[]) => void
  ): Unsubscribe {
    const collectionRef = collection(
      db,
      COLLECTIONS.COUPONS
    );

    return onSnapshot(
      collectionRef,
      (snapshot) => {
        const coupons: Coupon[] = [];

        snapshot.forEach((item) => {
          if (item.exists()) {
            coupons.push({
              id: item.id,
              ...item.data(),
            } as Coupon);
          }
        });

        callback(coupons);
      },
      (error) => {
        console.error(
          '❌ Coupons subscription error:',
          error
        );
      }
    );
  }

  public async saveCoupon(
    coupon: Coupon
  ): Promise<void> {
    const ref = doc(
      db,
      COLLECTIONS.COUPONS,
      coupon.id
    );

    await setDoc(
      ref,
      coupon,
      { merge: true }
    );
  }

  public async deleteCoupon(
    couponId: string
  ): Promise<void> {
    const ref = doc(
      db,
      COLLECTIONS.COUPONS,
      couponId
    );

    await deleteDoc(ref);
  }

  // ==========================================================
  // SETTINGS
  // ==========================================================

  public async getSettings(): Promise<StoreSettings> {
    try {
      const ref = doc(
        db,
        COLLECTIONS.SETTINGS,
        'main_settings'
      );

      const snapshot = await getDoc(ref);

      if (snapshot.exists()) {
        return snapshot.data() as StoreSettings;
      }

      return INITIAL_SETTINGS;
    } catch (error) {
      console.error(
        '❌ getSettings error:',
        error
      );

      return INITIAL_SETTINGS;
    }
  }

  public subscribeToSettings(
    callback: (settings: StoreSettings) => void
  ): Unsubscribe {
    const ref = doc(
      db,
      COLLECTIONS.SETTINGS,
      'main_settings'
    );

    return onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(
            snapshot.data() as StoreSettings
          );
        }
      },
      (error) => {
        console.error(
          '❌ Settings subscription error:',
          error
        );
      }
    );
  }

  public async saveSettings(
    settings: StoreSettings
  ): Promise<void> {
    const ref = doc(
      db,
      COLLECTIONS.SETTINGS,
      'main_settings'
    );

    await setDoc(
      ref,
      settings,
      { merge: true }
    );
  }

  // ==========================================================
  // RESTORE FULL DATABASE
  // ==========================================================

  public async restoreFullDatabase(
    dump: any
  ): Promise<void> {
    if (
      !dump ||
      typeof dump !== 'object'
    ) {
      throw new Error(
        'Invalid backup file'
      );
    }

    const batch = writeBatch(db);

    // --------------------------------------------------------
    // Products
    // --------------------------------------------------------

    if (
      Array.isArray(dump.products)
    ) {
      for (
        const product of dump.products
      ) {
        if (!product?.id) {
          continue;
        }

        batch.set(
          doc(
            db,
            COLLECTIONS.PRODUCTS,
            product.id
          ),
          product
        );
      }
    }

    // --------------------------------------------------------
    // Categories
    // --------------------------------------------------------

    if (
      Array.isArray(dump.categories)
    ) {
      for (
        const category of dump.categories
      ) {
        if (!category?.id) {
          continue;
        }

        batch.set(
          doc(
            db,
            COLLECTIONS.CATEGORIES,
            category.id
          ),
          category
        );
      }
    }

    // --------------------------------------------------------
    // Orders
    // --------------------------------------------------------

    if (
      Array.isArray(dump.orders)
    ) {
      for (
        const order of dump.orders
      ) {
        if (!order?.id) {
          continue;
        }

        batch.set(
          doc(
            db,
            COLLECTIONS.ORDERS,
            order.id
          ),
          order
        );
      }
    }

    // --------------------------------------------------------
    // Reviews
    // --------------------------------------------------------

    if (
      Array.isArray(dump.reviews)
    ) {
      for (
        const review of dump.reviews
      ) {
        if (!review?.id) {
          continue;
        }

        batch.set(
          doc(
            db,
            COLLECTIONS.REVIEWS,
            review.id
          ),
          review
        );
      }
    }

    // --------------------------------------------------------
    // Coupons
    // --------------------------------------------------------

    if (
      Array.isArray(dump.coupons)
    ) {
      for (
        const coupon of dump.coupons
      ) {
        if (!coupon?.id) {
          continue;
        }

        batch.set(
          doc(
            db,
            COLLECTIONS.COUPONS,
            coupon.id
          ),
          coupon
        );
      }
    }

    // --------------------------------------------------------
    // Settings
    // --------------------------------------------------------

    if (dump.settings) {
      batch.set(
        doc(
          db,
          COLLECTIONS.SETTINGS,
          'main_settings'
        ),
        dump.settings
      );
    }

    // --------------------------------------------------------
    // Commit
    // --------------------------------------------------------

    await batch.commit();

    console.log(
      '✅ Full database restored successfully!'
    );
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

export const firebaseService =
  new FirebaseService();