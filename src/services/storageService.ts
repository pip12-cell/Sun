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

// localStorage Cache Keys
const LS_KEYS = {
  META: 'sun_beauty_meta_cache',
  PRODUCTS: 'sun_beauty_products_cache',
  CATEGORIES: 'sun_beauty_categories_cache',
  ORDERS: 'sun_beauty_orders_cache',
  REVIEWS: 'sun_beauty_reviews_cache',
  COUPONS: 'sun_beauty_coupons_cache',
  SETTINGS: 'sun_beauty_settings_cache',
  WISHLIST: 'sun_beauty_wishlist_cache',
};

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isIndexedDBAvailable = true;

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.initDB();
    } else {
      this.isIndexedDBAvailable = false;
    }
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          if (!db.objectStoreNames.contains(STORES.META)) {
            db.createObjectStore(STORES.META, { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
            db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
            db.createObjectStore(STORES.CATEGORIES, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.ORDERS)) {
            db.createObjectStore(STORES.ORDERS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.REVIEWS)) {
            db.createObjectStore(STORES.REVIEWS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.COUPONS)) {
            db.createObjectStore(STORES.COUPONS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
            db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains(STORES.WISHLIST)) {
            db.createObjectStore(STORES.WISHLIST, { keyPath: 'id' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          this.isIndexedDBAvailable = false;
          reject(request.error);
        };
      } catch (err) {
        this.isIndexedDBAvailable = false;
        reject(err);
      }
    });

    return this.dbPromise;
  }

  // Safe localStorage helper
  private getFromLocalStorage<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? (JSON.parse(data) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private saveToLocalStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`Failed to save to localStorage key: ${key}`, e);
    }
  }

  // Generic IndexedDB operations
  private async getAllFromStore<T>(storeName: string): Promise<T[]> {
    if (!this.isIndexedDBAvailable) return [];
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  private async putInStore(storeName: string, item: any): Promise<void> {
    if (!this.isIndexedDBAvailable) return;
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn(`Error writing to store ${storeName}`, e);
    }
  }

  private async deleteFromStore(storeName: string, key: string): Promise<void> {
    if (!this.isIndexedDBAvailable) return;
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn(`Error deleting from store ${storeName}`, e);
    }
  }

  private async clearStore(storeName: string): Promise<void> {
    if (!this.isIndexedDBAvailable) return;
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn(`Error clearing store ${storeName}`, e);
    }
  }

  // --- INITIALIZATION & EMPTY DATABASE PROTECTION ---
  public async getDatabaseMeta(): Promise<DatabaseMeta | null> {
    try {
      if (this.isIndexedDBAvailable) {
        const db = await this.initDB();
        const metaObj = await new Promise<{ key: string; value: DatabaseMeta } | undefined>((resolve) => {
          const tx = db.transaction(STORES.META, 'readonly');
          const store = tx.objectStore(STORES.META);
          const req = store.get('db_meta');
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(undefined);
        });

        if (metaObj?.value) return metaObj.value;
      }
    } catch {
      // ignore
    }

    return this.getFromLocalStorage<DatabaseMeta | null>(LS_KEYS.META, null);
  }

  public async saveDatabaseMeta(meta: DatabaseMeta): Promise<void> {
    this.saveToLocalStorage(LS_KEYS.META, meta);
    await this.putInStore(STORES.META, { key: 'db_meta', value: meta });
  }

  public async initializeDatabaseIfNeeded(): Promise<boolean> {
    // 1. Initialize cloud Firestore
    await firebaseService.initializeFirestoreIfNeeded();

    // 2. Initialize local cache if needed
    const existingMeta = await this.getDatabaseMeta();
    if (existingMeta && existingMeta.initialized) {
      return false;
    }

    // Save Initial dataset to IndexedDB and LocalStorage cache
    for (const prod of INITIAL_PRODUCTS) {
      await this.putInStore(STORES.PRODUCTS, prod);
    }
    this.saveToLocalStorage(LS_KEYS.PRODUCTS, INITIAL_PRODUCTS);

    for (const cat of INITIAL_CATEGORIES) {
      await this.putInStore(STORES.CATEGORIES, cat);
    }
    this.saveToLocalStorage(LS_KEYS.CATEGORIES, INITIAL_CATEGORIES);

    for (const rev of INITIAL_REVIEWS) {
      await this.putInStore(STORES.REVIEWS, rev);
    }
    this.saveToLocalStorage(LS_KEYS.REVIEWS, INITIAL_REVIEWS);

    for (const cp of INITIAL_COUPONS) {
      await this.putInStore(STORES.COUPONS, cp);
    }
    this.saveToLocalStorage(LS_KEYS.COUPONS, INITIAL_COUPONS);

    await this.putInStore(STORES.SETTINGS, { key: 'main_settings', value: INITIAL_SETTINGS });
    this.saveToLocalStorage(LS_KEYS.SETTINGS, INITIAL_SETTINGS);

    const meta: DatabaseMeta = {
      version: DATA_VERSION,
      initialized: true,
      updatedAt: new Date().toISOString(),
    };
    await this.saveDatabaseMeta(meta);

    return true;
  }

  // --- PRODUCTS ---
  public async getProducts(): Promise<Product[]> {
    try {
      const cloudProducts = await firebaseService.getProducts();
      if (cloudProducts) {
        this.saveToLocalStorage(LS_KEYS.PRODUCTS, cloudProducts);
        return cloudProducts;
      }
    } catch {
      // fallback to local
    }

    const idbProducts = await this.getAllFromStore<Product>(STORES.PRODUCTS);
    if (idbProducts && idbProducts.length > 0) {
      this.saveToLocalStorage(LS_KEYS.PRODUCTS, idbProducts);
      return idbProducts;
    }

    const lsCache = this.getFromLocalStorage<Product[]>(LS_KEYS.PRODUCTS, []);
    return lsCache;
  }

  public async saveProduct(product: Product): Promise<void> {
    // 1. Cloud Firestore
    await firebaseService.saveProduct(product).catch((e) => console.warn('Cloud save product:', e));
    // 2. Local IndexedDB & Cache
    await this.putInStore(STORES.PRODUCTS, product);
    const current = this.getFromLocalStorage<Product[]>(LS_KEYS.PRODUCTS, []);
    const idx = current.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      current[idx] = product;
    } else {
      current.unshift(product);
    }
    this.saveToLocalStorage(LS_KEYS.PRODUCTS, current);
    await this.updateMetaTimestamp();
  }

  public async deleteProduct(productId: string): Promise<void> {
    // 1. Cloud Firestore
    await firebaseService.deleteProduct(productId).catch((e) => console.warn('Cloud delete product:', e));
    // 2. Local
    await this.deleteFromStore(STORES.PRODUCTS, productId);
    const current = this.getFromLocalStorage<Product[]>(LS_KEYS.PRODUCTS, []);
    const filtered = current.filter((p) => p.id !== productId);
    this.saveToLocalStorage(LS_KEYS.PRODUCTS, filtered);
    await this.updateMetaTimestamp();
  }

  public async clearAllProducts(): Promise<void> {
    // 1. Cloud Firestore
    await firebaseService.clearAllProducts().catch((e) => console.warn('Cloud clear products:', e));
    // 2. Local IndexedDB & LocalStorage
    await this.clearStore(STORES.PRODUCTS);
    this.saveToLocalStorage(LS_KEYS.PRODUCTS, []);
    await this.updateMetaTimestamp();
  }

  // --- CATEGORIES ---
  public async getCategories(): Promise<Category[]> {
    try {
      const cloudCats = await firebaseService.getCategories();
      if (cloudCats && cloudCats.length > 0) {
        this.saveToLocalStorage(LS_KEYS.CATEGORIES, cloudCats);
        for (const c of cloudCats) {
          this.putInStore(STORES.CATEGORIES, c).catch(() => {});
        }
        return cloudCats;
      }
    } catch {
      // fallback
    }

    const idbCategories = await this.getAllFromStore<Category>(STORES.CATEGORIES);
    if (idbCategories && idbCategories.length > 0) {
      this.saveToLocalStorage(LS_KEYS.CATEGORIES, idbCategories);
      return idbCategories;
    }

    return this.getFromLocalStorage<Category[]>(LS_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  public async saveCategory(category: Category): Promise<void> {
    await firebaseService.saveCategory(category).catch((e) => console.warn('Cloud save category:', e));
    await this.putInStore(STORES.CATEGORIES, category);
    const current = this.getFromLocalStorage<Category[]>(LS_KEYS.CATEGORIES, []);
    const idx = current.findIndex((c) => c.id === category.id);
    if (idx >= 0) {
      current[idx] = category;
    } else {
      current.push(category);
    }
    this.saveToLocalStorage(LS_KEYS.CATEGORIES, current);
    await this.updateMetaTimestamp();
  }

  public async deleteCategory(categoryId: string): Promise<void> {
    await firebaseService.deleteCategory(categoryId).catch((e) => console.warn('Cloud delete category:', e));
    await this.deleteFromStore(STORES.CATEGORIES, categoryId);
    const current = this.getFromLocalStorage<Category[]>(LS_KEYS.CATEGORIES, []);
    const filtered = current.filter((c) => c.id !== categoryId);
    this.saveToLocalStorage(LS_KEYS.CATEGORIES, filtered);
    await this.updateMetaTimestamp();
  }

  // --- ORDERS ---
  public async getOrders(): Promise<Order[]> {
    try {
      const cloudOrders = await firebaseService.getOrders();
      if (cloudOrders) {
        this.saveToLocalStorage(LS_KEYS.ORDERS, cloudOrders);
        for (const o of cloudOrders) {
          this.putInStore(STORES.ORDERS, o).catch(() => {});
        }
        return cloudOrders;
      }
    } catch {
      // fallback
    }

    const idbOrders = await this.getAllFromStore<Order>(STORES.ORDERS);
    if (idbOrders && idbOrders.length > 0) {
      this.saveToLocalStorage(LS_KEYS.ORDERS, idbOrders);
      return idbOrders;
    }
    return this.getFromLocalStorage<Order[]>(LS_KEYS.ORDERS, []);
  }

  public async saveOrder(order: Order): Promise<void> {
    await firebaseService.saveOrder(order).catch((e) => console.warn('Cloud save order:', e));
    await this.putInStore(STORES.ORDERS, order);
    const current = this.getFromLocalStorage<Order[]>(LS_KEYS.ORDERS, []);
    const idx = current.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      current[idx] = order;
    } else {
      current.unshift(order);
    }
    this.saveToLocalStorage(LS_KEYS.ORDERS, current);
    await this.updateMetaTimestamp();
  }

  public async deleteOrder(orderId: string): Promise<void> {
    await firebaseService.deleteOrder(orderId).catch((e) => console.warn('Cloud delete order:', e));
    await this.deleteFromStore(STORES.ORDERS, orderId);
    const current = this.getFromLocalStorage<Order[]>(LS_KEYS.ORDERS, []);
    const filtered = current.filter((o) => o.id !== orderId);
    this.saveToLocalStorage(LS_KEYS.ORDERS, filtered);
    await this.updateMetaTimestamp();
  }

  // --- REVIEWS ---
  public async getReviews(): Promise<Review[]> {
    try {
      const cloudReviews = await firebaseService.getReviews();
      if (cloudReviews && cloudReviews.length > 0) {
        this.saveToLocalStorage(LS_KEYS.REVIEWS, cloudReviews);
        for (const r of cloudReviews) {
          this.putInStore(STORES.REVIEWS, r).catch(() => {});
        }
        return cloudReviews;
      }
    } catch {
      // fallback
    }

    const idbReviews = await this.getAllFromStore<Review>(STORES.REVIEWS);
    if (idbReviews && idbReviews.length > 0) {
      this.saveToLocalStorage(LS_KEYS.REVIEWS, idbReviews);
      return idbReviews;
    }
    return this.getFromLocalStorage<Review[]>(LS_KEYS.REVIEWS, INITIAL_REVIEWS);
  }

  public async saveReview(review: Review): Promise<void> {
    await firebaseService.saveReview(review).catch((e) => console.warn('Cloud save review:', e));
    await this.putInStore(STORES.REVIEWS, review);
    const current = this.getFromLocalStorage<Review[]>(LS_KEYS.REVIEWS, []);
    const idx = current.findIndex((r) => r.id === review.id);
    if (idx >= 0) {
      current[idx] = review;
    } else {
      current.unshift(review);
    }
    this.saveToLocalStorage(LS_KEYS.REVIEWS, current);
    await this.updateMetaTimestamp();
  }

  public async deleteReview(reviewId: string): Promise<void> {
    await firebaseService.deleteReview(reviewId).catch((e) => console.warn('Cloud delete review:', e));
    await this.deleteFromStore(STORES.REVIEWS, reviewId);
    const current = this.getFromLocalStorage<Review[]>(LS_KEYS.REVIEWS, []);
    const filtered = current.filter((r) => r.id !== reviewId);
    this.saveToLocalStorage(LS_KEYS.REVIEWS, filtered);
    await this.updateMetaTimestamp();
  }

  public async clearAllReviews(): Promise<void> {
    await firebaseService.clearAllReviews().catch((e) => console.warn('Cloud clear reviews:', e));
    await this.clearStore(STORES.REVIEWS);
    this.saveToLocalStorage(LS_KEYS.REVIEWS, []);
    await this.updateMetaTimestamp();
  }

  // --- COUPONS ---
  public async getCoupons(): Promise<Coupon[]> {
    try {
      const cloudCoupons = await firebaseService.getCoupons();
      if (cloudCoupons && cloudCoupons.length > 0) {
        this.saveToLocalStorage(LS_KEYS.COUPONS, cloudCoupons);
        for (const c of cloudCoupons) {
          this.putInStore(STORES.COUPONS, c).catch(() => {});
        }
        return cloudCoupons;
      }
    } catch {
      // fallback
    }

    const idbCoupons = await this.getAllFromStore<Coupon>(STORES.COUPONS);
    if (idbCoupons && idbCoupons.length > 0) {
      this.saveToLocalStorage(LS_KEYS.COUPONS, idbCoupons);
      return idbCoupons;
    }
    return this.getFromLocalStorage<Coupon[]>(LS_KEYS.COUPONS, INITIAL_COUPONS);
  }

  public async saveCoupon(coupon: Coupon): Promise<void> {
    await firebaseService.saveCoupon(coupon).catch((e) => console.warn('Cloud save coupon:', e));
    await this.putInStore(STORES.COUPONS, coupon);
    const current = this.getFromLocalStorage<Coupon[]>(LS_KEYS.COUPONS, []);
    const idx = current.findIndex((c) => c.id === coupon.id);
    if (idx >= 0) {
      current[idx] = coupon;
    } else {
      current.push(coupon);
    }
    this.saveToLocalStorage(LS_KEYS.COUPONS, current);
    await this.updateMetaTimestamp();
  }

  public async deleteCoupon(couponId: string): Promise<void> {
    await firebaseService.deleteCoupon(couponId).catch((e) => console.warn('Cloud delete coupon:', e));
    await this.deleteFromStore(STORES.COUPONS, couponId);
    const current = this.getFromLocalStorage<Coupon[]>(LS_KEYS.COUPONS, []);
    const filtered = current.filter((c) => c.id !== couponId);
    this.saveToLocalStorage(LS_KEYS.COUPONS, filtered);
    await this.updateMetaTimestamp();
  }

  // --- SETTINGS ---
  public async getSettings(): Promise<StoreSettings> {
    try {
      const cloudSettings = await firebaseService.getSettings();
      if (cloudSettings) {
        this.saveToLocalStorage(LS_KEYS.SETTINGS, cloudSettings);
        this.putInStore(STORES.SETTINGS, { key: 'main_settings', value: cloudSettings }).catch(() => {});
        return cloudSettings;
      }
    } catch {
      // fallback
    }

    try {
      if (this.isIndexedDBAvailable) {
        const db = await this.initDB();
        const settingsObj = await new Promise<{ key: string; value: StoreSettings } | undefined>((resolve) => {
          const tx = db.transaction(STORES.SETTINGS, 'readonly');
          const store = tx.objectStore(STORES.SETTINGS);
          const req = store.get('main_settings');
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(undefined);
        });

        if (settingsObj?.value) {
          this.saveToLocalStorage(LS_KEYS.SETTINGS, settingsObj.value);
          return settingsObj.value;
        }
      }
    } catch {
      // ignore
    }

    return this.getFromLocalStorage<StoreSettings>(LS_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  public async saveSettings(settings: StoreSettings): Promise<void> {
    await firebaseService.saveSettings(settings).catch((e) => console.warn('Cloud save settings:', e));
    this.saveToLocalStorage(LS_KEYS.SETTINGS, settings);
    await this.putInStore(STORES.SETTINGS, { key: 'main_settings', value: settings });
    await this.updateMetaTimestamp();
  }

  // --- WISHLIST ---
  public async getWishlist(): Promise<string[]> {
    return this.getFromLocalStorage<string[]>(LS_KEYS.WISHLIST, []);
  }

  public async saveWishlist(productIds: string[]): Promise<void> {
    this.saveToLocalStorage(LS_KEYS.WISHLIST, productIds);
  }

  // --- RESTORE & RAW DUMP ---
  public async getAllDataDump() {
    const meta = (await this.getDatabaseMeta()) || INITIAL_DATABASE_META;
    const products = await this.getProducts();
    const categories = await this.getCategories();
    const orders = await this.getOrders();
    const reviews = await this.getReviews();
    const coupons = await this.getCoupons();
    const settings = await this.getSettings();
    const wishlist = await this.getWishlist();

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

  public async restoreFullDatabase(dump: any): Promise<void> {
    if (!dump || typeof dump !== 'object') {
      throw new Error('Invalid backup file format.');
    }

    // Restore into Cloud Firestore
    await firebaseService.restoreFullDatabase(dump).catch((e) => console.warn('Cloud restore:', e));

    // Clear all local stores
    await this.clearStore(STORES.PRODUCTS);
    await this.clearStore(STORES.CATEGORIES);
    await this.clearStore(STORES.ORDERS);
    await this.clearStore(STORES.REVIEWS);
    await this.clearStore(STORES.COUPONS);
    await this.clearStore(STORES.SETTINGS);
    await this.clearStore(STORES.META);

    if (Array.isArray(dump.products)) {
      for (const p of dump.products) await this.putInStore(STORES.PRODUCTS, p);
      this.saveToLocalStorage(LS_KEYS.PRODUCTS, dump.products);
    }
    if (Array.isArray(dump.categories)) {
      for (const c of dump.categories) await this.putInStore(STORES.CATEGORIES, c);
      this.saveToLocalStorage(LS_KEYS.CATEGORIES, dump.categories);
    }
    if (Array.isArray(dump.orders)) {
      for (const o of dump.orders) await this.putInStore(STORES.ORDERS, o);
      this.saveToLocalStorage(LS_KEYS.ORDERS, dump.orders);
    }
    if (Array.isArray(dump.reviews)) {
      for (const r of dump.reviews) await this.putInStore(STORES.REVIEWS, r);
      this.saveToLocalStorage(LS_KEYS.REVIEWS, dump.reviews);
    }
    if (Array.isArray(dump.coupons)) {
      for (const cp of dump.coupons) await this.putInStore(STORES.COUPONS, cp);
      this.saveToLocalStorage(LS_KEYS.COUPONS, dump.coupons);
    }
    if (dump.settings) {
      await this.putInStore(STORES.SETTINGS, { key: 'main_settings', value: dump.settings });
      this.saveToLocalStorage(LS_KEYS.SETTINGS, dump.settings);
    }
    if (Array.isArray(dump.wishlist)) {
      this.saveToLocalStorage(LS_KEYS.WISHLIST, dump.wishlist);
    }

    const newMeta: DatabaseMeta = {
      version: DATA_VERSION,
      initialized: true,
      updatedAt: new Date().toISOString(),
    };
    await this.saveDatabaseMeta(newMeta);
  }

  private async updateMetaTimestamp(): Promise<void> {
    const meta = (await this.getDatabaseMeta()) || {
      version: DATA_VERSION,
      initialized: true,
      updatedAt: new Date().toISOString(),
    };
    meta.updatedAt = new Date().toISOString();
    await this.saveDatabaseMeta(meta);
  }
}

export const storageService = new StorageService();
