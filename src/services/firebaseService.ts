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

// Firestore collection names
const COLLECTIONS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  COUPONS: 'coupons',
  SETTINGS: 'settings',
  META: 'meta',
} as const;

class FirebaseService {
  private isInitialized = false;

  // Initialize Firestore with default seed data if collections are empty
  public async initializeFirestoreIfNeeded(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const metaDocRef = doc(db, COLLECTIONS.META, 'db_meta');
      const metaSnap = await getDoc(metaDocRef);

      if (!metaSnap.exists()) {
        console.log('⚡ Initializing cloud Firestore database with default Sun Beauty botanical dataset...');
        const batch = writeBatch(db);

        // Seed products
        for (const prod of INITIAL_PRODUCTS) {
          const ref = doc(db, COLLECTIONS.PRODUCTS, prod.id);
          batch.set(ref, prod);
        }

        // Seed categories
        for (const cat of INITIAL_CATEGORIES) {
          const ref = doc(db, COLLECTIONS.CATEGORIES, cat.id);
          batch.set(ref, cat);
        }

        // Seed reviews
        for (const rev of INITIAL_REVIEWS) {
          const ref = doc(db, COLLECTIONS.REVIEWS, rev.id);
          batch.set(ref, rev);
        }

        // Seed coupons
        for (const cp of INITIAL_COUPONS) {
          const ref = doc(db, COLLECTIONS.COUPONS, cp.id);
          batch.set(ref, cp);
        }

        // Seed settings
        const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'main_settings');
        batch.set(settingsRef, INITIAL_SETTINGS);

        // Mark as initialized
        batch.set(metaDocRef, {
          initialized: true,
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
        });

        await batch.commit();
        console.log('✅ Firestore cloud database seeded successfully!');
      }
      this.isInitialized = true;
    } catch (error) {
      console.warn('Firestore initialization notice:', error);
    }
  }

  // --- Real-time Subscriptions ---
  public subscribeToProducts(callback: (products: Product[]) => void): Unsubscribe {
    const colRef = collection(db, COLLECTIONS.PRODUCTS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const prods: Product[] = [];
          snapshot.forEach((d) => {
            prods.push(d.data() as Product);
          });
          callback(prods);
        } else {
          callback([]);
        }
      },
      (error) => {
        console.warn('Error subscribing to products:', error);
      }
    );
  }

  public subscribeToCategories(callback: (categories: Category[]) => void): Unsubscribe {
    const colRef = collection(db, COLLECTIONS.CATEGORIES);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const cats: Category[] = [];
          snapshot.forEach((d) => {
            cats.push(d.data() as Category);
          });
          cats.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          callback(cats);
        } else {
          callback([]);
        }
      },
      (error) => {
        console.warn('Error subscribing to categories:', error);
      }
    );
  }

  public subscribeToOrders(callback: (orders: Order[]) => void): Unsubscribe {
    const colRef = collection(db, COLLECTIONS.ORDERS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const ords: Order[] = [];
        snapshot.forEach((d) => {
          ords.push(d.data() as Order);
        });
        ords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(ords);
      },
      (error) => {
        console.warn('Error subscribing to orders:', error);
      }
    );
  }

  public subscribeToReviews(callback: (reviews: Review[]) => void): Unsubscribe {
    const colRef = collection(db, COLLECTIONS.REVIEWS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const revs: Review[] = [];
        snapshot.forEach((d) => {
          revs.push(d.data() as Review);
        });
        revs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        callback(revs);
      },
      (error) => {
        console.warn('Error subscribing to reviews:', error);
      }
    );
  }

  public subscribeToCoupons(callback: (coupons: Coupon[]) => void): Unsubscribe {
    const colRef = collection(db, COLLECTIONS.COUPONS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const cps: Coupon[] = [];
        snapshot.forEach((d) => {
          cps.push(d.data() as Coupon);
        });
        callback(cps);
      },
      (error) => {
        console.warn('Error subscribing to coupons:', error);
      }
    );
  }

  public subscribeToSettings(callback: (settings: StoreSettings) => void): Unsubscribe {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'main_settings');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as StoreSettings);
        }
      },
      (error) => {
        console.warn('Error subscribing to settings:', error);
      }
    );
  }

  // --- CRUD Operations ---

  // Products
  public async getProducts(): Promise<Product[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      const list: Product[] = [];
      snap.forEach((d) => list.push(d.data() as Product));
      return list;
    } catch (e) {
      console.warn('Firestore getProducts error:', e);
      return [];
    }
  }

  public async saveProduct(product: Product): Promise<void> {
    const ref = doc(db, COLLECTIONS.PRODUCTS, product.id);
    await setDoc(ref, product, { merge: true });
  }

  public async deleteProduct(productId: string): Promise<void> {
    const ref = doc(db, COLLECTIONS.PRODUCTS, productId);
    await deleteDoc(ref);
  }

  public async clearAllProducts(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.forEach((d) => {
          batch.delete(d.ref);
        });
        await batch.commit();
      }
    } catch (e) {
      console.warn('Firestore clearAllProducts error:', e);
    }
  }

  // Categories
  public async getCategories(): Promise<Category[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
      if (!snap.empty) {
        const list: Category[] = [];
        snap.forEach((d) => list.push(d.data() as Category));
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        return list;
      }
    } catch (e) {
      console.warn('Firestore getCategories error:', e);
    }
    return INITIAL_CATEGORIES;
  }

  public async saveCategory(category: Category): Promise<void> {
    const ref = doc(db, COLLECTIONS.CATEGORIES, category.id);
    await setDoc(ref, category, { merge: true });
  }

  public async deleteCategory(categoryId: string): Promise<void> {
    const ref = doc(db, COLLECTIONS.CATEGORIES, categoryId);
    await deleteDoc(ref);
  }

  // Orders
  public async getOrders(): Promise<Order[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.ORDERS));
      const list: Order[] = [];
      snap.forEach((d) => list.push(d.data() as Order));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    } catch (e) {
      console.warn('Firestore getOrders error:', e);
      return [];
    }
  }

  public async saveOrder(order: Order): Promise<void> {
    const ref = doc(db, COLLECTIONS.ORDERS, order.id);
    await setDoc(ref, order);
  }

  public async deleteOrder(orderId: string): Promise<void> {
    const ref = doc(db, COLLECTIONS.ORDERS, orderId);
    await deleteDoc(ref);
  }

  // Reviews
  public async getReviews(): Promise<Review[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.REVIEWS));
      if (!snap.empty) {
        const list: Review[] = [];
        snap.forEach((d) => list.push(d.data() as Review));
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return list;
      }
    } catch (e) {
      console.warn('Firestore getReviews error:', e);
    }
    return INITIAL_REVIEWS;
  }

  public async saveReview(review: Review): Promise<void> {
    const ref = doc(db, COLLECTIONS.REVIEWS, review.id);
    await setDoc(ref, review);
  }

  public async deleteReview(reviewId: string): Promise<void> {
    const ref = doc(db, COLLECTIONS.REVIEWS, reviewId);
    await deleteDoc(ref);
  }

  public async clearAllReviews(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.REVIEWS));
      const batch = writeBatch(db);
      snap.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
    } catch (e) {
      console.warn('Firestore clearAllReviews error:', e);
    }
  }

  // Coupons
  public async getCoupons(): Promise<Coupon[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.COUPONS));
      if (!snap.empty) {
        const list: Coupon[] = [];
        snap.forEach((d) => list.push(d.data() as Coupon));
        return list;
      }
    } catch (e) {
      console.warn('Firestore getCoupons error:', e);
    }
    return INITIAL_COUPONS;
  }

  public async saveCoupon(coupon: Coupon): Promise<void> {
    const ref = doc(db, COLLECTIONS.COUPONS, coupon.id);
    await setDoc(ref, coupon, { merge: true });
  }

  public async deleteCoupon(couponId: string): Promise<void> {
    const ref = doc(db, COLLECTIONS.COUPONS, couponId);
    await deleteDoc(ref);
  }

  // Settings
  public async getSettings(): Promise<StoreSettings> {
    try {
      const ref = doc(db, COLLECTIONS.SETTINGS, 'main_settings');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as StoreSettings;
      }
    } catch (e) {
      console.warn('Firestore getSettings error:', e);
    }
    return INITIAL_SETTINGS;
  }

  public async saveSettings(settings: StoreSettings): Promise<void> {
    const ref = doc(db, COLLECTIONS.SETTINGS, 'main_settings');
    await setDoc(ref, settings, { merge: true });
  }

  // Restore full database backup into Firestore
  public async restoreFullDatabase(dump: any): Promise<void> {
    if (!dump || typeof dump !== 'object') {
      throw new Error('Invalid backup file');
    }

    const batch = writeBatch(db);

    if (Array.isArray(dump.products)) {
      for (const p of dump.products) {
        batch.set(doc(db, COLLECTIONS.PRODUCTS, p.id), p);
      }
    }
    if (Array.isArray(dump.categories)) {
      for (const c of dump.categories) {
        batch.set(doc(db, COLLECTIONS.CATEGORIES, c.id), c);
      }
    }
    if (Array.isArray(dump.orders)) {
      for (const o of dump.orders) {
        batch.set(doc(db, COLLECTIONS.ORDERS, o.id), o);
      }
    }
    if (Array.isArray(dump.reviews)) {
      for (const r of dump.reviews) {
        batch.set(doc(db, COLLECTIONS.REVIEWS, r.id), r);
      }
    }
    if (Array.isArray(dump.coupons)) {
      for (const cp of dump.coupons) {
        batch.set(doc(db, COLLECTIONS.COUPONS, cp.id), cp);
      }
    }
    if (dump.settings) {
      batch.set(doc(db, COLLECTIONS.SETTINGS, 'main_settings'), dump.settings);
    }

    await batch.commit();
  }
}

export const firebaseService = new FirebaseService();
