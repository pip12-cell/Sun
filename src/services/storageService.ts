import {
  Category,
  Coupon,
  DatabaseMeta,
  Order,
  Product,
  Review,
  StoreSettings,
} from '../types';

import {
  DATA_VERSION,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_DATABASE_META,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
} from '../data/initialData';

import { firebaseService } from './firebaseService';

const DB_NAME = 'SunBeautyDB';
const DB_VERSION = 1;

const STORES = {
  META: 'meta',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  COUPONS: 'coupons',
  SETTINGS: 'settings',
  WISHLIST: 'wishlist',
} as const;

const LS_KEYS = {
  META: 'sun_beauty_meta_cache',
  PRODUCTS: 'sun_beauty_products_cache',
  CATEGORIES: 'sun_beauty_categories_cache',
  ORDERS: 'sun_beauty_orders_cache',
  REVIEWS: 'sun_beauty_reviews_cache',
  COUPONS: 'sun_beauty_coupons_cache',
  SETTINGS: 'sun_beauty_settings_cache',
  WISHLIST: 'sun_beauty_wishlist_cache',
} as const;

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isIndexedDBAvailable = true;

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.initDB().catch((error) => {
        console.warn('IndexedDB initialization failed:', error);
        this.isIndexedDBAvailable = false;
      });
    } else {
      this.isIndexedDBAvailable = false;
    }
  }

  // =========================================================
  // INDEXED DB
  // =========================================================

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          if (!db.objectStoreNames.contains(STORES.META)) {
            db.createObjectStore(STORES.META, {
              keyPath: 'key',
            });
          }

          if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
            db.createObjectStore(STORES.PRODUCTS, {
              keyPath: 'id',
            });
          }

          if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
            db.createObjectStore(STORES.CATEGORIES, {
              keyPath: 'id',
            });
          }

          if (!db.objectStoreNames.contains(STORES.ORDERS)) {
            db.createObjectStore(STORES.ORDERS, {
              keyPath: 'id',
            });
          }

          if (!db.objectStoreNames.contains(STORES.REVIEWS)) {
            db.createObjectStore(STORES.REVIEWS, {
              keyPath: 'id',
            });
          }

          if (!db.objectStoreNames.contains(STORES.COUPONS)) {
            db.createObjectStore(STORES.COUPONS, {
              keyPath: 'id',
            });
          }

          if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
            db.createObjectStore(STORES.SETTINGS, {
              keyPath: 'key',
            });
          }

          if (!db.objectStoreNames.contains(STORES.WISHLIST)) {
            db.createObjectStore(STORES.WISHLIST, {
              keyPath: 'id',
            });
          }
        };

        request.onsuccess = () => {
          const db = request.result;

          db.onversionchange = () => {
            db.close();
          };

          resolve(db);
        };

        request.onerror = () => {
          this.isIndexedDBAvailable = false;
          reject(request.error);
        };

        request.onblocked = () => {
          console.warn('IndexedDB open request is blocked.');
        };
      } catch (error) {
        this.isIndexedDBAvailable = false;
        reject(error);
      }
    });

    return this.dbPromise;
  }

  // =========================================================
  // LOCAL STORAGE HELPERS
  // =========================================================

  private getFromLocalStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') {
      return fallback;
    }

    try {
      const data = localStorage.getItem(key);

      if (!data) {
        return fallback;
      }

      return JSON.parse(data) as T;
    } catch (error) {
      console.warn(`Failed to read localStorage key: ${key}`, error);
      return fallback;
    }
  }

  private saveToLocalStorage<T>(key: string, data: T): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn(`Failed to save localStorage key: ${key}`, error);
    }
  }

  private removeFromLocalStorage(key: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove localStorage key: ${key}`, error);
    }
  }

  // =========================================================
  // INDEXED DB HELPERS
  // =========================================================

  private async getAllFromStore<T>(storeName: string): Promise<T[]> {
    if (!this.isIndexedDBAvailable) {
      return [];
    }

    try {
      const db = await this.initDB();

      return await new Promise<T[]>((resolve) => {
        try {
          const tx = db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const request = store.getAll();

          request.onsuccess = () => {
            resolve((request.result || []) as T[]);
          };

          request.onerror = () => {
            resolve([]);
          };
        } catch {
          resolve([]);
        }
      });
    } catch {
      return [];
    }
  }

  private async putInStore(
    storeName: string,
    item: any
  ): Promise<void> {
    if (!this.isIndexedDBAvailable) {
      return;
    }

    try {
      const db = await this.initDB();

      await new Promise<void>((resolve, reject) => {
        try {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const request = store.put(item);

          request.onsuccess = () => {
            resolve();
          };

          request.onerror = () => {
            reject(request.error);
          };
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.warn(
        `Error writing to IndexedDB store ${storeName}:`,
        error
      );
    }
  }

  private async deleteFromStore(
    storeName: string,
    key: string
  ): Promise<void> {
    if (!this.isIndexedDBAvailable) {
      return;
    }

    try {
      const db = await this.initDB();

      await new Promise<void>((resolve, reject) => {
        try {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const request = store.delete(key);

          request.onsuccess = () => {
            resolve();
          };

          request.onerror = () => {
            reject(request.error);
          };
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.warn(
        `Error deleting from IndexedDB store ${storeName}:`,
        error
      );
    }
  }

  private async clearStore(storeName: string): Promise<void> {
    if (!this.isIndexedDBAvailable) {
      return;
    }

    try {
      const db = await this.initDB();

      await new Promise<void>((resolve, reject) => {
        try {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const request = store.clear();

          request.onsuccess = () => {
            resolve();
          };

          request.onerror = () => {
            reject(request.error);
          };
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.warn(
        `Error clearing IndexedDB store ${storeName}:`,
        error
      );
    }
  }

  // =========================================================
  // DATABASE META
  // =========================================================

  public async getDatabaseMeta(): Promise<DatabaseMeta | null> {
    try {
      if (this.isIndexedDBAvailable) {
        const db = await this.initDB();

        const result = await new Promise<
          { key: string; value: DatabaseMeta } | undefined
        >((resolve) => {
          try {
            const tx = db.transaction(STORES.META, 'readonly');
            const store = tx.objectStore(STORES.META);
            const request = store.get('db_meta');

            request.onsuccess = () => {
              resolve(request.result);
            };

            request.onerror = () => {
              resolve(undefined);
            };
          } catch {
            resolve(undefined);
          }
        });

        if (result?.value) {
          return result.value;
        }
      }
    } catch {
      // fallback
    }

    return this.getFromLocalStorage<DatabaseMeta | null>(
      LS_KEYS.META,
      null
    );
  }

  public async saveDatabaseMeta(
    meta: DatabaseMeta
  ): Promise<void> {
    this.saveToLocalStorage(LS_KEYS.META, meta);

    await this.putInStore(STORES.META, {
      key: 'db_meta',
      value: meta,
    });
  }

  // =========================================================
  // INITIALIZE DATABASE
  // =========================================================

  public async initializeDatabaseIfNeeded(): Promise<boolean> {
    try {
      await firebaseService.initializeFirestoreIfNeeded();
    } catch (error) {
      console.warn(
        'Firestore initialization warning:',
        error
      );
    }

    const existingMeta = await this.getDatabaseMeta();

    if (existingMeta?.initialized) {
      return false;
    }

    /*
     * مهم:
     * لا نقوم بإنشاء orders من INITIAL_DATA.
     * الطلبات يجب أن تأتي من Firestore فقط.
     */

    for (const product of INITIAL_PRODUCTS) {
      await this.putInStore(
        STORES.PRODUCTS,
        product
      );
    }

    this.saveToLocalStorage(
      LS_KEYS.PRODUCTS,
      INITIAL_PRODUCTS
    );

    for (const category of INITIAL_CATEGORIES) {
      await this.putInStore(
        STORES.CATEGORIES,
        category
      );
    }

    this.saveToLocalStorage(
      LS_KEYS.CATEGORIES,
      INITIAL_CATEGORIES
    );

    for (const review of INITIAL_REVIEWS) {
      await this.putInStore(
        STORES.REVIEWS,
        review
      );
    }

    this.saveToLocalStorage(
      LS_KEYS.REVIEWS,
      INITIAL_REVIEWS
    );

    for (const coupon of INITIAL_COUPONS) {
      await this.putInStore(
        STORES.COUPONS,
        coupon
      );
    }

    this.saveToLocalStorage(
      LS_KEYS.COUPONS,
      INITIAL_COUPONS
    );

    await this.putInStore(
      STORES.SETTINGS,
      {
        key: 'main_settings',
        value: INITIAL_SETTINGS,
      }
    );

    this.saveToLocalStorage(
      LS_KEYS.SETTINGS,
      INITIAL_SETTINGS
    );

    /*
     * لا نمسح الطلبات هنا.
     *
     * لو موجودة في Firestore سيتم تحميلها.
     * لو مش موجودة، تظل القائمة فاضية طبيعيًا.
     */

    const meta: DatabaseMeta = {
      version: DATA_VERSION,
      initialized: true,
      updatedAt: new Date().toISOString(),
    };

    await this.saveDatabaseMeta(meta);

    return true;
  }

  // =========================================================
  // PRODUCTS
  // =========================================================

  public async getProducts(): Promise<Product[]> {
    try {
      const cloudProducts =
        await firebaseService.getProducts();

      /*
       * Firestore هو المصدر الأساسي.
       *
       * حتى لو النتيجة [] فهذا معناه أن Firestore
       * فاضي فعلًا، وليس أننا نستخدم cache قديم.
       */
      if (Array.isArray(cloudProducts)) {
        this.saveToLocalStorage(
          LS_KEYS.PRODUCTS,
          cloudProducts
        );

        for (const product of cloudProducts) {
          await this.putInStore(
            STORES.PRODUCTS,
            product
          );
        }

        return cloudProducts;
      }
    } catch (error) {
      console.warn(
        'Firestore getProducts failed:',
        error
      );
    }

    const idbProducts =
      await this.getAllFromStore<Product>(
        STORES.PRODUCTS
      );

    if (idbProducts.length > 0) {
      return idbProducts;
    }

    return this.getFromLocalStorage<Product[]>(
      LS_KEYS.PRODUCTS,
      []
    );
  }

  public async saveProduct(
    product: Product
  ): Promise<void> {
    await firebaseService.saveProduct(product);

    await this.putInStore(
      STORES.PRODUCTS,
      product
    );

    const current =
      this.getFromLocalStorage<Product[]>(
        LS_KEYS.PRODUCTS,
        []
      );

    const index = current.findIndex(
      (item) => item.id === product.id
    );

    if (index >= 0) {
      current[index] = product;
    } else {
      current.unshift(product);
    }

    this.saveToLocalStorage(
      LS_KEYS.PRODUCTS,
      current
    );

    await this.updateMetaTimestamp();
  }

  public async deleteProduct(
    productId: string
  ): Promise<void> {
    await firebaseService.deleteProduct(
      productId
    );

    await this.deleteFromStore(
      STORES.PRODUCTS,
      productId
    );

    const current =
      this.getFromLocalStorage<Product[]>(
        LS_KEYS.PRODUCTS,
        []
      );

    this.saveToLocalStorage(
      LS_KEYS.PRODUCTS,
      current.filter(
        (product) => product.id !== productId
      )
    );

    await this.updateMetaTimestamp();
  }

  public async clearAllProducts(): Promise<void> {
    await firebaseService.clearAllProducts();

    await this.clearStore(
      STORES.PRODUCTS
    );

    this.saveToLocalStorage(
      LS_KEYS.PRODUCTS,
      []
    );

    await this.updateMetaTimestamp();
  }

  // =========================================================
  // CATEGORIES
  // =========================================================

  public async getCategories(): Promise<Category[]> {
    try {
      const cloudCategories =
        await firebaseService.getCategories();

      if (Array.isArray(cloudCategories)) {
        this.saveToLocalStorage(
          LS_KEYS.CATEGORIES,
          cloudCategories
        );

        for (const category of cloudCategories) {
          await this.putInStore(
            STORES.CATEGORIES,
            category
          );
        }

        return cloudCategories;
      }
    } catch (error) {
      console.warn(
        'Firestore getCategories failed:',
        error
      );
    }

    const local =
      await this.getAllFromStore<Category>(
        STORES.CATEGORIES
      );

    if (local.length > 0) {
      return local;
    }

    return this.getFromLocalStorage<Category[]>(
      LS_KEYS.CATEGORIES,
      INITIAL_CATEGORIES
    );
  }

  public async saveCategory(
    category: Category
  ): Promise<void> {
    await firebaseService.saveCategory(
      category
    );

    await this.putInStore(
      STORES.CATEGORIES,
      category
    );

    const current =
      this.getFromLocalStorage<Category[]>(
        LS_KEYS.CATEGORIES,
        []
      );

    const index = current.findIndex(
      (item) => item.id === category.id
    );

    if (index >= 0) {
      current[index] = category;
    } else {
      current.push(category);
    }

    this.saveToLocalStorage(
      LS_KEYS.CATEGORIES,
      current
    );

    await this.updateMetaTimestamp();
  }

  public async deleteCategory(
    categoryId: string
  ): Promise<void> {
    await firebaseService.deleteCategory(
      categoryId
    );

    await this.deleteFromStore(
      STORES.CATEGORIES,
      categoryId
    );

    const current =
      this.getFromLocalStorage<Category[]>(
        LS_KEYS.CATEGORIES,
        []
      );

    this.saveToLocalStorage(
      LS_KEYS.CATEGORIES,
      current.filter(
        (category) => category.id !== categoryId
      )
    );

    await this.updateMetaTimestamp();
  }

  // =========================================================
  // ORDERS - IMPORTANT
  // =========================================================

  public async getOrders(): Promise<Order[]> {
    try {
      /*
       * مهم جدًا:
       * Firestore هو المصدر الأساسي للطلبات.
       *
       * لا نستخدم:
       * if (cloudOrders.length > 0)
       *
       * لأن [] معناها أن Firestore فاضي بالفعل.
       */

      const cloudOrders =
        await firebaseService.getOrders();

      if (Array.isArray(cloudOrders)) {
        const sortedOrders =
          [...cloudOrders].sort(
            (a, b) =>
              this.getOrderTimestamp(b) -
              this.getOrderTimestamp(a)
          );

        /*
         * تحديث الـ cache من Firestore.
         */
        this.saveToLocalStorage(
          LS_KEYS.ORDERS,
          sortedOrders
        );

        /*
         * تحديث IndexedDB.
         */
        for (const order of sortedOrders) {
          await this.putInStore(
            STORES.ORDERS,
            order
          );
        }

        return sortedOrders;
      }
    } catch (error) {
      console.warn(
        'Firestore getOrders failed:',
        error
      );
    }

    /*
     * Firestore غير متاح فقط:
     * نستخدم IndexedDB كـ fallback.
     */
    const idbOrders =
      await this.getAllFromStore<Order>(
        STORES.ORDERS
      );

    if (idbOrders.length > 0) {
      return idbOrders.sort(
        (a, b) =>
          this.getOrderTimestamp(b) -
          this.getOrderTimestamp(a)
      );
    }

    /*
     * آخر fallback هو localStorage.
     */
    const cachedOrders =
      this.getFromLocalStorage<Order[]>(
        LS_KEYS.ORDERS,
        []
      );

    return cachedOrders.sort(
      (a, b) =>
        this.getOrderTimestamp(b) -
        this.getOrderTimestamp(a)
    );
  }

  public async saveOrder(
    order: Order
  ): Promise<void> {
    /*
     * تأكد من وجود createdAt.
     */
    const safeOrder: Order = {
      ...order,
      createdAt:
        typeof order.createdAt === 'string'
          ? order.createdAt
          : new Date().toISOString(),
    };

    /*
     * أول وأهم خطوة:
     * الحفظ في Firestore.
     */
    await firebaseService.saveOrder(
      safeOrder
    );

    /*
     * تحديث IndexedDB.
     */
    await this.putInStore(
      STORES.ORDERS,
      safeOrder
    );

    /*
     * تحديث localStorage.
     */
    const current =
      this.getFromLocalStorage<Order[]>(
        LS_KEYS.ORDERS,
        []
      );

    const index = current.findIndex(
      (item) => item.id === safeOrder.id
    );

    if (index >= 0) {
      current[index] = safeOrder;
    } else {
      current.unshift(safeOrder);
    }

    current.sort(
      (a, b) =>
        this.getOrderTimestamp(b) -
        this.getOrderTimestamp(a)
    );

    this.saveToLocalStorage(
      LS_KEYS.ORDERS,
      current
    );

    await this.updateMetaTimestamp();
  }

  public async deleteOrder(
    orderId: string
  ): Promise<void> {
    /*
     * الحذف من Firestore أولًا.
     */
    await firebaseService.deleteOrder(
      orderId
    );

    /*
     * حذف من IndexedDB.
     */
    await this.deleteFromStore(
      STORES.ORDERS,
      orderId
    );

    /*
     * حذف من localStorage.
     */
    const current =
      this.getFromLocalStorage<Order[]>(
        LS_KEYS.ORDERS,
        []
      );

    this.saveToLocalStorage(
      LS_KEYS.ORDERS,
      current.filter(
        (order) => order.id !== orderId
      )
    );

    await this.updateMetaTimestamp();
  }

  private getOrderTimestamp(
    order: Order
  ): number {
    if (!order?.createdAt) {
      return 0;
    }

    if (
      typeof order.createdAt === 'string'
    ) {
      const timestamp =
        new Date(
          order.createdAt
        ).getTime();

      return Number.isFinite(timestamp)
        ? timestamp
        : 0;
    }

    const createdAt =
      order.createdAt as any;

    if (
      typeof createdAt?.seconds === 'number'
    ) {
      return (
        createdAt.seconds * 1000 +
        Math.floor(
          (createdAt.nanoseconds || 0) /
            1000000
        )
      );
    }

    if (
      typeof createdAt?.toDate ===
      'function'
    ) {
      const date =
        createdAt.toDate();

      return date instanceof Date
        ? date.getTime()
        : 0;
    }

    return 0;
  }

  // =========================================================
  // REVIEWS
  // =========================================================

  public async getReviews(): Promise<Review[]> {
    try {
      const cloudReviews =
        await firebaseService.getReviews();

      if (Array.isArray(cloudReviews)) {
        this.saveToLocalStorage(
          LS_KEYS.REVIEWS,
          cloudReviews
        );

        for (const review of cloudReviews) {
          await this.putInStore(
            STORES.REVIEWS,
            review
          );
        }

        return cloudReviews;
      }
    } catch (error) {
      console.warn(
        'Firestore getReviews failed:',
        error
      );
    }

    const local =
      await this.getAllFromStore<Review>(
        STORES.REVIEWS
      );

    if (local.length > 0) {
      return local;
    }

    return this.getFromLocalStorage<Review[]>(
      LS_KEYS.REVIEWS,
      INITIAL_REVIEWS
    );
  }

  public async saveReview(
    review: Review
  ): Promise<void> {
    await firebaseService.saveReview(
      review
    );

    await this.putInStore(
      STORES.REVIEWS,
      review
    );

    const current =
      this.getFromLocalStorage<Review[]>(
        LS_KEYS.REVIEWS,
        []
      );

    const index = current.findIndex(
      (item) => item.id === review.id
    );

    if (index >= 0) {
      current[index] = review;
    } else {
      current.unshift(review);
    }

    this.saveToLocalStorage(
      LS_KEYS.REVIEWS,
      current
    );

    await this.updateMetaTimestamp();
  }

  public async deleteReview(
    reviewId: string
  ): Promise<void> {
    await firebaseService.deleteReview(
      reviewId
    );

    await this.deleteFromStore(
      STORES.REVIEWS,
      reviewId
    );

    const current =
      this.getFromLocalStorage<Review[]>(
        LS_KEYS.REVIEWS,
        []
      );

    this.saveToLocalStorage(
      LS_KEYS.REVIEWS,
      current.filter(
        (review) => review.id !== reviewId
      )
    );

    await this.updateMetaTimestamp();
  }

  public async clearAllReviews(): Promise<void> {
    await firebaseService.clearAllReviews();

    await this.clearStore(
      STORES.REVIEWS
    );

    this.saveToLocalStorage(
      LS_KEYS.REVIEWS,
      []
    );

    await this.updateMetaTimestamp();
  }

  // =========================================================
  // COUPONS
  // =========================================================

  public async getCoupons(): Promise<Coupon[]> {
    try {
      const cloudCoupons =
        await firebaseService.getCoupons();

      if (Array.isArray(cloudCoupons)) {
        this.saveToLocalStorage(
          LS_KEYS.COUPONS,
          cloudCoupons
        );

        for (const coupon of cloudCoupons) {
          await this.putInStore(
            STORES.COUPONS,
            coupon
          );
        }

        return cloudCoupons;
      }
    } catch (error) {
      console.warn(
        'Firestore getCoupons failed:',
        error
      );
    }

    const local =
      await this.getAllFromStore<Coupon>(
        STORES.COUPONS
      );

    if (local.length > 0) {
      return local;
    }

    return this.getFromLocalStorage<Coupon[]>(
      LS_KEYS.COUPONS,
      INITIAL_COUPONS
    );
  }

  public async saveCoupon(
    coupon: Coupon
  ): Promise<void> {
    await firebaseService.saveCoupon(
      coupon
    );

    await this.putInStore(
      STORES.COUPONS,
      coupon
    );

    const current =
      this.getFromLocalStorage<Coupon[]>(
        LS_KEYS.COUPONS,
        []
      );

    const index = current.findIndex(
      (item) => item.id === coupon.id
    );

    if (index >= 0) {
      current[index] = coupon;
    } else {
      current.push(coupon);
    }

    this.saveToLocalStorage(
      LS_KEYS.COUPONS,
      current
    );

    await this.updateMetaTimestamp();
  }

  public async deleteCoupon(
    couponId: string
  ): Promise<void> {
    await firebaseService.deleteCoupon(
      couponId
    );

    await this.deleteFromStore(
      STORES.COUPONS,
      couponId
    );

    const current =
      this.getFromLocalStorage<Coupon[]>(
        LS_KEYS.COUPONS,
        []
      );

    this.saveToLocalStorage(
      LS_KEYS.COUPONS,
      current.filter(
        (coupon) => coupon.id !== couponId
      )
    );

    await this.updateMetaTimestamp();
  }

  // =========================================================
  // SETTINGS
  // =========================================================

  public async getSettings(): Promise<StoreSettings> {
    try {
      const cloudSettings =
        await firebaseService.getSettings();

      if (cloudSettings) {
        this.saveToLocalStorage(
          LS_KEYS.SETTINGS,
          cloudSettings
        );

        await this.putInStore(
          STORES.SETTINGS,
          {
            key: 'main_settings',
            value: cloudSettings,
          }
        );

        return cloudSettings;
      }
    } catch (error) {
      console.warn(
        'Firestore getSettings failed:',
        error
      );
    }

    try {
      if (this.isIndexedDBAvailable) {
        const db = await this.initDB();

        const settings =
          await new Promise<
            | {
                key: string;
                value: StoreSettings;
              }
            | undefined
          >((resolve) => {
            try {
              const tx =
                db.transaction(
                  STORES.SETTINGS,
                  'readonly'
                );

              const store =
                tx.objectStore(
                  STORES.SETTINGS
                );

              const request =
                store.get(
                  'main_settings'
                );

              request.onsuccess = () => {
                resolve(request.result);
              };

              request.onerror = () => {
                resolve(undefined);
              };
            } catch {
              resolve(undefined);
            }
          });

        if (settings?.value) {
          this.saveToLocalStorage(
            LS_KEYS.SETTINGS,
            settings.value
          );

          return settings.value;
        }
      }
    } catch {
      // fallback
    }

    return this.getFromLocalStorage<StoreSettings>(
      LS_KEYS.SETTINGS,
      INITIAL_SETTINGS
    );
  }

  public async saveSettings(
    settings: StoreSettings
  ): Promise<void> {
    await firebaseService.saveSettings(
      settings
    );

    this.saveToLocalStorage(
      LS_KEYS.SETTINGS,
      settings
    );

    await this.putInStore(
      STORES.SETTINGS,
      {
        key: 'main_settings',
        value: settings,
      }
    );

    await this.updateMetaTimestamp();
  }

  // =========================================================
  // WISHLIST
  // =========================================================

  public async getWishlist(): Promise<string[]> {
    return this.getFromLocalStorage<string[]>(
      LS_KEYS.WISHLIST,
      []
    );
  }

  public async saveWishlist(
    productIds: string[]
  ): Promise<void> {
    this.saveToLocalStorage(
      LS_KEYS.WISHLIST,
      productIds
    );
  }

  // =========================================================
  // FULL DATABASE DUMP
  // =========================================================

  public async getAllDataDump() {
    const meta =
      (await this.getDatabaseMeta()) ||
      INITIAL_DATABASE_META;

    const products =
      await this.getProducts();

    const categories =
      await this.getCategories();

    const orders =
      await this.getOrders();

    const reviews =
      await this.getReviews();

    const coupons =
      await this.getCoupons();

    const settings =
      await this.getSettings();

    const wishlist =
      await this.getWishlist();

    return {
      meta,
      products,
      categories,
      orders,
      reviews,
      coupons,
      settings,
      wishlist,
    };
  }

  // =========================================================
  // RESTORE DATABASE
  // =========================================================

  public async restoreFullDatabase(
    dump: any
  ): Promise<void> {
    if (
      !dump ||
      typeof dump !== 'object'
    ) {
      throw new Error(
        'Invalid backup file format.'
      );
    }

    /*
     * أولًا Firestore.
     */
    await firebaseService.restoreFullDatabase(
      dump
    );

    /*
     * بعد نجاح Firestore فقط نمسح الـ local cache.
     */
    await this.clearStore(
      STORES.PRODUCTS
    );

    await this.clearStore(
      STORES.CATEGORIES
    );

    await this.clearStore(
      STORES.ORDERS
    );

    await this.clearStore(
      STORES.REVIEWS
    );

    await this.clearStore(
      STORES.COUPONS
    );

    await this.clearStore(
      STORES.SETTINGS
    );

    await this.clearStore(
      STORES.META
    );

    // PRODUCTS
    if (Array.isArray(dump.products)) {
      for (const product of dump.products) {
        await this.putInStore(
          STORES.PRODUCTS,
          product
        );
      }

      this.saveToLocalStorage(
        LS_KEYS.PRODUCTS,
        dump.products
      );
    }

    // CATEGORIES
    if (Array.isArray(dump.categories)) {
      for (const category of dump.categories) {
        await this.putInStore(
          STORES.CATEGORIES,
          category
        );
      }

      this.saveToLocalStorage(
        LS_KEYS.CATEGORIES,
        dump.categories
      );
    }

    // ORDERS
    if (Array.isArray(dump.orders)) {
      for (const order of dump.orders) {
        await this.putInStore(
          STORES.ORDERS,
          order
        );
      }

      this.saveToLocalStorage(
        LS_KEYS.ORDERS,
        dump.orders
      );
    }

    // REVIEWS
    if (Array.isArray(dump.reviews)) {
      for (const review of dump.reviews) {
        await this.putInStore(
          STORES.REVIEWS,
          review
        );
      }

      this.saveToLocalStorage(
        LS_KEYS.REVIEWS,
        dump.reviews
      );
    }

    // COUPONS
    if (Array.isArray(dump.coupons)) {
      for (const coupon of dump.coupons) {
        await this.putInStore(
          STORES.COUPONS,
          coupon
        );
      }

      this.saveToLocalStorage(
        LS_KEYS.COUPONS,
        dump.coupons
      );
    }

    // SETTINGS
    if (dump.settings) {
      await this.putInStore(
        STORES.SETTINGS,
        {
          key: 'main_settings',
          value: dump.settings,
        }
      );

      this.saveToLocalStorage(
        LS_KEYS.SETTINGS,
        dump.settings
      );
    }

    // WISHLIST
    if (Array.isArray(dump.wishlist)) {
      this.saveToLocalStorage(
        LS_KEYS.WISHLIST,
        dump.wishlist
      );
    }

    const newMeta: DatabaseMeta = {
      version: DATA_VERSION,
      initialized: true,
      updatedAt:
        new Date().toISOString(),
    };

    await this.saveDatabaseMeta(
      newMeta
    );
  }

  // =========================================================
  // META TIMESTAMP
  // =========================================================

  private async updateMetaTimestamp(): Promise<void> {
    const currentMeta =
      await this.getDatabaseMeta();

    const meta: DatabaseMeta = {
      version:
        currentMeta?.version ||
        DATA_VERSION,

      initialized: true,

      updatedAt:
        new Date().toISOString(),
    };

    await this.saveDatabaseMeta(
      meta
    );
  }
}

export const storageService =
  new StorageService();