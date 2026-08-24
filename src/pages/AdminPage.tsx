import React, { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import {
  Product,
  Category,
  Order,
  Coupon,
  OrderStatus,
  Review,
  ProductReview,
  SkinType,
  SkinGoal,
  RoutineStep,
  PaymentMethod,
} from '../types';
import {
  ShieldCheck,
  Lock,
  LogOut,
  Package,
  ShoppingBag,
  Layers,
  Tag,
  Star,
  Settings as SettingsIcon,
  Database,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Download,
  Upload,
  Copy,
  Check,
  Search,
  MessageCircle,
  Sparkles,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { formatPrice, getWhatsAppLink } from '../utils/helpers';
import { sanitizeImageUrl } from '../utils/sanitizeImageUrl';
import { exportDatabaseAsJson, generateInitialDataFileContent, exportInitialDataTS } from '../services/exportService';

const ADMIN_PIN = '1234';

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const AdminPage: React.FC = () => {
  const {
    products,
    categories,
    orders,
    coupons,
    reviews,
    settings,
    language,
    currency,
    t,
    addProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    updateCategory,
    deleteCategory,
    updateOrderStatus,
    deleteOrder,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    addReview,
    saveReview,
    deleteReview,
    clearAllReviews,
    updateSettings,
    restoreDatabase,
    resetDatabaseToDefaults,
    showToast,
  } = useStore();

  const isAr = language === 'ar';

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('sun_admin_auth') === 'true';
  });
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'orders' | 'categories' | 'coupons' | 'reviews' | 'settings' | 'backup'
  >('overview');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState<{
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    ingredientsAr: string;
    ingredientsEn: string;
    howToUseAr: string;
    howToUseEn: string;
    benefitsAr: string;
    benefitsEn: string;
    price: number;
    compareAtPrice: number;
    discount: number;
    categoryId: string;
    images: string;
    stock: number;
    featured: boolean;
    bestSeller: boolean;
    newProduct: boolean;
    routineStep: RoutineStep;
    skinTypes: SkinType[];
    skinGoals: SkinGoal[];
  }>({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    ingredientsAr: '',
    ingredientsEn: '',
    howToUseAr: '',
    howToUseEn: '',
    benefitsAr: '',
    benefitsEn: '',
    price: 350,
    compareAtPrice: 400,
    discount: 0,
    categoryId: categories[0]?.id || '',
    images: '',
    stock: 50,
    featured: false,
    bestSeller: false,
    newProduct: false,
    routineStep: 'treat',
    skinTypes: ['all'],
    skinGoals: ['glow'],
  });

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catNameAr, setCatNameAr] = useState('');
  const [catNameEn, setCatNameEn] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catDescAr, setCatDescAr] = useState('');
  const [catDescEn, setCatDescEn] = useState('');

  // Coupon Modal State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValue, setCouponValue] = useState(15);
  const [couponMinOrder, setCouponMinOrder] = useState(300);
  const [couponActive, setCouponActive] = useState(true);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewForm, setReviewForm] = useState<{
    customerName: string;
    productId: string;
    rating: number;
    comment: string;
    date: string;
    verifiedPurchase: boolean;
    status: 'approved' | 'pending';
  }>({
    customerName: '',
    productId: '',
    rating: 5,
    comment: '',
    date: new Date().toISOString().split('T')[0],
    verifiedPurchase: true,
    status: 'approved',
  });
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number>(0);

  // Settings State Form
  const [settingsForm, setSettingsForm] = useState(settings);

  React.useEffect(() => {
    if (settings) {
      setSettingsForm(settings);
    }
  }, [settings]);

  // Search & Filters in Admin
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');

  // Backup file input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(false);

  // Custom in-app Delete Confirmation Target
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'category' | 'order' | 'coupon' | 'review' | 'clear_reviews' | 'reset';
    id: string;
    title: string;
  } | null>(null);

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPin = settings?.adminPin || ADMIN_PIN;
    if (enteredPin === currentPin) {
      sessionStorage.setItem('sun_admin_auth', 'true');
      setIsAuthenticated(true);
      setPinError(false);
      showToast(
        isAr ? 'تم تسجيل الدخول' : 'Logged In',
        isAr ? 'أهلاً بكِ في لوحة الإدارة' : 'Welcome to Sun Beauty Control Center',
        'success'
      );
    } else {
      setPinError(true);
      showToast(
        isAr ? 'رمز PIN غير صحيح' : 'Invalid PIN',
        isAr ? 'يرجى التأكد من الرمز وإعادة المحاولة' : 'Please check your PIN and try again',
        'error'
      );
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('sun_admin_auth');
    setIsAuthenticated(false);
  };

  // Image Upload Handlers
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await readFileAsDataUrl(files[i]);
      newUrls.push(url);
    }
    const existing = prodForm.images
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    setProdForm({ ...prodForm, images: [...existing, ...newUrls].join('\n') });
    e.target.value = '';
    showToast(
      isAr ? 'تم رفع الصور' : 'Images Uploaded',
      isAr ? `تمت إضافة ${newUrls.length} صورة للمنتج` : `Added ${newUrls.length} images`,
      'success'
    );
  };

  const handleRemoveProductImage = (indexToRemove: number) => {
    const existing = prodForm.images
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const updated = existing.filter((_, idx) => idx !== indexToRemove);
    setProdForm({ ...prodForm, images: updated.join('\n') });
  };

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await readFileAsDataUrl(file);
    setCatImage(url);
    e.target.value = '';
    showToast(
      isAr ? 'تم رفع صورة التصنيف' : 'Category Image Uploaded',
      isAr ? 'تم تحديث الصورة بنجاح' : 'Image updated successfully',
      'success'
    );
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await readFileAsDataUrl(file);
    setSettingsForm((prev) => (prev ? { ...prev, logoUrl: url } : prev));
    e.target.value = '';
    showToast(
      isAr ? 'تم رفع لوجو الموقع' : 'Logo Uploaded',
      isAr ? 'تم تحميل اللوجو، يرجى النقر على حفظ التغييرات لتثبيته' : 'Logo loaded, please click Save Changes to persist',
      'success'
    );
  };

  // Analytics Metrics Calculation
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((acc, o) => acc + o.total, 0);
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'new' || o.status === 'processing').length;
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock < 10).length;
  }, [products]);

  const averageOrderValue = useMemo(() => {
    const valid = orders.filter((o) => o.status !== 'cancelled');
    if (valid.length === 0) return 0;
    return Math.round(totalRevenue / valid.length);
  }, [orders, totalRevenue]);

  // Safely formats an order's createdAt value, whether it's an ISO string
  // (localStorage) or a Firestore Timestamp-like object ({ seconds }).
  const formatOrderDate = (createdAt: any): string => {
    try {
      if (!createdAt) return '—';
      if (typeof createdAt === 'string') {
        return new Date(createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US');
      }
      if (typeof createdAt === 'object' && 'seconds' in createdAt) {
        return new Date(createdAt.seconds * 1000).toLocaleDateString(isAr ? 'ar-EG' : 'en-US');
      }
      return new Date(createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US');
    } catch (e) {
      return '—';
    }
  };

  // Open Product Modal for Add/Edit
  const openProductModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setProdForm({
        nameAr: prod.name.ar,
        nameEn: prod.name.en,
        descriptionAr: prod.description.ar,
        descriptionEn: prod.description.en,
        ingredientsAr: prod.ingredients.ar,
        ingredientsEn: prod.ingredients.en,
        howToUseAr: prod.howToUse.ar,
        howToUseEn: prod.howToUse.en,
        benefitsAr: prod.benefits ? prod.benefits.ar : '',
        benefitsEn: prod.benefits ? prod.benefits.en : '',
        price: prod.price,
        compareAtPrice: prod.compareAtPrice || 0,
        discount: prod.discount || 0,
        categoryId: prod.categoryId,
        images: prod.images.join('\n'),
        stock: prod.stock,
        featured: !!prod.featured,
        bestSeller: !!prod.bestSeller,
        newProduct: !!prod.newProduct,
        routineStep: prod.routineStep || 'treat',
        skinTypes: prod.skinType || ['all'],
        skinGoals: prod.skinGoal || ['glow'],
      });
    } else {
      setEditingProduct(null);
      setProdForm({
        nameAr: '',
        nameEn: '',
        descriptionAr: '',
        descriptionEn: '',
        ingredientsAr: '',
        ingredientsEn: '',
        howToUseAr: '',
        howToUseEn: '',
        benefitsAr: '',
        benefitsEn: '',
        price: 350,
        compareAtPrice: 400,
        discount: 0,
        categoryId: categories[0]?.id || '',
        images: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
        stock: 50,
        featured: false,
        bestSeller: false,
        newProduct: true,
        routineStep: 'treat',
        skinTypes: ['all'],
        skinGoals: ['glow'],
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const imgs = prodForm.images
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const productPayload = {
      name: { ar: prodForm.nameAr, en: prodForm.nameEn },
      description: { ar: prodForm.descriptionAr, en: prodForm.descriptionEn },
      ingredients: { ar: prodForm.ingredientsAr, en: prodForm.ingredientsEn },
      howToUse: { ar: prodForm.howToUseAr, en: prodForm.howToUseEn },
      benefits:
        prodForm.benefitsAr || prodForm.benefitsEn
          ? { ar: prodForm.benefitsAr, en: prodForm.benefitsEn }
          : undefined,
      price: Number(prodForm.price),
      compareAtPrice: prodForm.compareAtPrice ? Number(prodForm.compareAtPrice) : undefined,
      discount: prodForm.discount ? Number(prodForm.discount) : undefined,
      categoryId: prodForm.categoryId,
      images: imgs.length > 0 ? imgs : ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'],
      stock: Number(prodForm.stock),
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewCount: editingProduct ? editingProduct.reviewCount : 0,
      featured: prodForm.featured,
      bestSeller: prodForm.bestSeller,
      newProduct: prodForm.newProduct,
      routineStep: prodForm.routineStep,
      skinType: prodForm.skinTypes,
      skinGoal: prodForm.skinGoals,
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, productPayload);
      showToast(
        isAr ? 'تم تعديل المنتج' : 'Product Updated',
        isAr ? `تم حفظ التعديلات على "${productPayload.name.ar}" وتحديث المتجر فوراً` : 'Product updated successfully',
        'success'
      );
    } else {
      await addProduct(productPayload);
      showToast(
        isAr ? 'تمت إضافة المنتج' : 'Product Added',
        isAr ? `تمت إضافة المنتج "${productPayload.name.ar}" وتحديث المتجر فوراً` : 'Product added successfully',
        'success'
      );
    }

    setIsProductModalOpen(false);
  };

  // Category Save
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameAr || !catNameEn) return;

    if (editingCat) {
      await updateCategory(editingCat.id, {
        name: { ar: catNameAr, en: catNameEn },
        image: catImage || editingCat.image,
        description: { ar: catDescAr, en: catDescEn },
      });
      showToast(
        isAr ? 'تم تعديل التصنيف' : 'Category Updated',
        isAr ? `تم تحديث التصنيف "${catNameAr}" وتحديث الأقسام فوراً` : 'Category updated successfully',
        'success'
      );
    } else {
      await createCategory({
        name: { ar: catNameAr, en: catNameEn },
        image: catImage || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
        description: { ar: catDescAr, en: catDescEn },
      });
      showToast(
        isAr ? 'تمت إضافة التصنيف' : 'Category Added',
        isAr ? `تمت إضافة التصنيف "${catNameAr}" وتحديث الأقسام فوراً` : 'Category added successfully',
        'success'
      );
    }
    setIsCatModalOpen(false);
  };

  // Coupon Save
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    await createCoupon({
      code: couponCode.toUpperCase().trim(),
      type: couponType,
      value: Number(couponValue),
      minOrderAmount: Number(couponMinOrder),
      isActive: couponActive,
      usageCount: 0,
    });
    showToast(
      isAr ? 'تم إنشاء الكوبون' : 'Coupon Created',
      isAr ? `تم إنشاء كود الخصم "${couponCode.toUpperCase().trim()}"` : 'Coupon created',
      'success'
    );
    setIsCouponModalOpen(false);
    setCouponCode('');
  };

  // Review Handlers
  const handleOpenAddReview = () => {
    setEditingReview(null);
    setReviewForm({
      customerName: '',
      productId: products[0]?.id || '',
      rating: 5,
      comment: '',
      date: new Date().toISOString().split('T')[0],
      verifiedPurchase: true,
      status: 'approved',
    });
    setIsReviewModalOpen(true);
  };

  const handleOpenEditReview = (rev: Review) => {
    setEditingReview(rev);
    setReviewForm({
      customerName: rev.customerName,
      productId: rev.productId || '',
      rating: rev.rating,
      comment: rev.comment,
      date: rev.date || new Date().toISOString().split('T')[0],
      verifiedPurchase: rev.verifiedPurchase !== undefined ? rev.verifiedPurchase : true,
      status: rev.status || 'approved',
    });
    setIsReviewModalOpen(true);
  };

  const handleSaveReviewForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.customerName.trim() || !reviewForm.comment.trim()) {
      showToast(
        isAr ? 'بيانات ناقصة' : 'Missing Info',
        isAr ? 'يرجى إدخال اسم العميل والتعليق' : 'Please enter customer name and review comment',
        'error'
      );
      return;
    }

    if (editingReview) {
      const updatedRev: Review = {
        ...editingReview,
        customerName: reviewForm.customerName.trim(),
        productId: reviewForm.productId,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        date: reviewForm.date,
        verifiedPurchase: reviewForm.verifiedPurchase,
        status: reviewForm.status,
      };
      await saveReview(updatedRev);
    } else {
      await addReview({
        productId: reviewForm.productId,
        customerName: reviewForm.customerName.trim(),
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        date: reviewForm.date,
        verifiedPurchase: reviewForm.verifiedPurchase,
        status: reviewForm.status,
      });
    }

    setIsReviewModalOpen(false);
  };

  // Custom Delete Confirmation Execution
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, id, title } = deleteTarget;
    try {
      if (type === 'product') {
        await deleteProduct(id);
        showToast(
          isAr ? 'تم حذف المنتج' : 'Product Deleted',
          isAr ? `تم حذف "${title}" وتحديث المتجر فوراً` : `Deleted "${title}" successfully`,
          'success'
        );
      } else if (type === 'category') {
        await deleteCategory(id);
        showToast(
          isAr ? 'تم حذف التصنيف' : 'Category Deleted',
          isAr ? `تم حذف التصنيف "${title}" وتحديث الأقسام فوراً` : `Deleted "${title}" successfully`,
          'success'
        );
      } else if (type === 'order') {
        await deleteOrder(id);
        showToast(
          isAr ? 'تم حذف الطلب' : 'Order Deleted',
          isAr ? `تم حذف الطلب #${id} بنجاح` : `Deleted Order #${id}`,
          'success'
        );
      } else if (type === 'coupon') {
        await deleteCoupon(id);
        showToast(
          isAr ? 'تم حذف الكوبون' : 'Coupon Deleted',
          isAr ? `تم حذف كود الخصم "${title}"` : `Deleted Coupon "${title}"`,
          'success'
        );
      } else if (type === 'review') {
        await deleteReview(id);
        showToast(
          isAr ? 'تم حذف التقييم' : 'Review Deleted',
          isAr ? 'تم حذف التقييم بنجاح' : 'Review deleted',
          'success'
        );
      } else if (type === 'clear_reviews') {
        await clearAllReviews();
        showToast(
          isAr ? 'تم تنظيف التقييمات' : 'Reviews Cleared',
          isAr ? 'تم حذف كافة التقييمات السابقة بنجاح' : 'All reviews cleared',
          'success'
        );
      } else if (type === 'reset') {
        await resetDatabaseToDefaults();
        showToast(
          isAr ? 'إعادة ضبط المصنع' : 'Factory Reset',
          isAr ? 'تمت استعادة البيانات الافتراضية بنجاح' : 'Reset complete',
          'success'
        );
      }
    } catch (err) {
      showToast(isAr ? 'خطأ في الحذف' : 'Deletion Error', isAr ? 'تعذر إتمام عملية الحذف' : 'Failed to delete', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Backup & Export Handlers
  const handleDownloadBackup = () => {
    exportDatabaseAsJson({
      products,
      categories,
      orders,
      coupons,
      reviews,
      settings,
    });
    showToast(isAr ? 'تم تصدير النسخة الاحتياطية' : 'Backup Exported', isAr ? 'تم حفظ ملف JSON بنجاح' : 'JSON file saved', 'success');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.products && parsed.categories) {
          await restoreDatabase(parsed);
          showToast(isAr ? 'تمت استعادة البيانات' : 'Data Restored', isAr ? 'تم تحديث قاعدة البيانات بنجاح' : 'Database updated successfully', 'success');
        } else {
          showToast(isAr ? 'ملف غير صالح' : 'Invalid File', isAr ? 'الملف لا يحتوي على بنية بيانات Sun Beauty' : 'Not a valid backup file', 'error');
        }
      } catch (err) {
        showToast(isAr ? 'فشل استعادة الملف' : 'Restore Failed', isAr ? 'تأكد من صحة ملف JSON' : 'Invalid JSON content', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleCopyInitialDataCode = () => {
    const code = generateInitialDataFileContent({
      products,
      categories,
      orders,
      coupons,
      reviews,
      settings,
    });
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
    showToast(isAr ? 'تم نسخ كود البيانات' : 'Code Copied', isAr ? 'يمكنك الآن لصقه داخل ملف src/data/initialData.ts' : 'Ready to paste into initialData.ts', 'success');
  };

  const handleDownloadInitialDataTS = async () => {
    await exportInitialDataTS();
    showToast(
      isAr ? 'تم تحميل ملف الكود المحدث' : 'Source File Downloaded',
      isAr ? 'تم تحميل initialData.ts يحتوي على كافة المنتجات والتصنيفات الحالية' : 'initialData.ts file downloaded',
      'success'
    );
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(settingsForm);
    showToast(
      isAr ? 'تم حفظ الإعدادات' : 'Settings Saved',
      isAr ? 'تم حفظ وتطبيق جميع إعدادات المتجر بنجاح' : 'Store settings updated',
      'success'
    );
  };

  // 1. If not authenticated, show Luxury Login PIN Gate
  if (!isAuthenticated) {
    return (
      <div id="admin-login-gate" className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full border border-[#2D5A27]/20 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center mx-auto ring-8 ring-[#2D5A27]/5">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C241E]">
              {t.admin.title}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {isAr ? 'يرجى إدخال رمز PIN للوصول إلى لوحة التحكم' : 'Enter Admin Security PIN to access control center'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError(false);
                }}
                placeholder={t.admin.pinPlaceholder}
                className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 px-4 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2D5A27] bg-[#FAFAF8]"
              />
              {pinError && (
                <p className="text-xs text-rose-600 font-semibold mt-2">
                  {isAr ? 'رمز PIN غير صحيح، يرجى المحاولة مرة أخرى' : 'Incorrect PIN, please try again'}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#2D5A27] text-white hover:bg-[#23471f] font-bold text-xs transition-all shadow-md shadow-[#2D5A27]/20"
            >
              {t.admin.login}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Full Admin Dashboard Screen
  return (
    <div id="admin-dashboard-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Topbar */}
      <div className="bg-[#FAFAF8] rounded-3xl p-6 border border-[#2D5A27]/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#2D5A27] text-white flex items-center justify-center font-serif-luxury font-bold text-xl shadow-sm">
            SB
          </div>
          <div>
            <h1 className="font-serif-luxury text-2xl font-bold text-[#1C241E]">
              {t.admin.title}
            </h1>
            <p className="text-xs text-stone-500">
              {isAr ? 'إدارة المنتجات، الطلبات، الكوبونات وقاعدة البيانات' : 'Complete CRUD, Orders, Inventory & Database management'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{isAr ? 'مزامنة سحابية مباشرة (Firebase)' : 'Cloud Synced (Firebase Live)'}</span>
          </div>

          <button
            type="button"
            onClick={handleDownloadBackup}
            className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Download JSON Backup"
          >
            <Download className="w-3.5 h-3.5 text-[#2D5A27]" />
            <span>{isAr ? 'نسخة احتياطية' : 'Backup JSON'}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.admin.logout}</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200">
        {[
          { id: 'overview', label: t.admin.tabs.overview, icon: TrendingUp },
          { id: 'products', label: `${t.admin.tabs.products} (${products.length})`, icon: Package },
          { id: 'orders', label: `${t.admin.tabs.orders} (${orders.length})`, icon: ShoppingBag },
          { id: 'categories', label: `${t.admin.tabs.categories} (${categories.length})`, icon: Layers },
          { id: 'coupons', label: `${t.admin.tabs.coupons} (${coupons.length})`, icon: Tag },
          { id: 'reviews', label: `${t.admin.tabs.reviews} (${reviews.length})`, icon: Star },
          { id: 'settings', label: t.admin.tabs.settings, icon: SettingsIcon },
          { id: 'backup', label: t.admin.tabs.backup, icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                isActive
                  ? 'bg-[#2D5A27] text-white shadow-sm'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#2D5A27]/10 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-semibold">{t.admin.stats.totalSales}</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C241E]">
                {formatPrice(totalRevenue, currency, settings.currencies, language)}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                {orders.length} {isAr ? 'إجمالي الطلبات' : 'total orders'}
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#2D5A27]/10 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-semibold">{t.admin.stats.pendingOrders}</span>
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C241E]">
                {pendingOrdersCount}
              </div>
              <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
                {isAr ? 'بحاجة للشحن والتأكيد' : 'Awaiting fulfillment'}
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#2D5A27]/10 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-semibold">{t.admin.stats.activeProducts}</span>
                <Package className="w-5 h-5 text-[#2D5A27]" />
              </div>
              <div className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C241E]">
                {products.length}
              </div>
              <span className="text-[11px] text-[#2D5A27] font-semibold mt-1 block">
                {categories.length} {isAr ? 'تصنيفات رئيسية' : 'active categories'}
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#2D5A27]/10 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-semibold">{t.admin.stats.lowStock}</span>
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C241E]">
                {lowStockCount}
              </div>
              <span className="text-[11px] text-rose-700 font-semibold mt-1 block">
                {isAr ? 'أقل من 10 قطع بالمخزن' : 'Items under 10 stock'}
              </span>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white rounded-3xl border border-[#2D5A27]/10 p-6 shadow-sm">
            <h3 className="font-serif-luxury text-xl font-bold text-[#1C241E] mb-4">
              {isAr ? 'أحدث الطلبات المستلمة' : 'Recent Customer Orders'}
            </h3>
            {orders && orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 font-semibold">
                      <th className="pb-3">#ID</th>
                      <th className="pb-3">{isAr ? 'العميل' : 'Customer'}</th>
                      <th className="pb-3">{isAr ? 'المنتجات' : 'Items'}</th>
                      <th className="pb-3">{isAr ? 'الإجمالي' : 'Total'}</th>
                      <th className="pb-3">{isAr ? 'طريقة الدفع' : 'Payment'}</th>
                      <th className="pb-3">{isAr ? 'الحالة' : 'Status'}</th>
                      <th className="pb-3">{isAr ? 'تاريخ الطلب' : 'Date'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.slice(0, 5).map((ord) => {
                      if (!ord) return null;
                      return (
                        <tr key={ord.id || Math.random()} className="hover:bg-[#FAFAF8]">
                          <td className="py-3 font-mono font-bold text-[#2D5A27]">
                            {ord.id || 'N/A'}
                          </td>
                          <td className="py-3 font-semibold text-stone-900">
                            {ord.customerName || ord.shippingAddress?.fullName || (isAr ? 'زائر' : 'Guest')}
                          </td>
                          <td className="py-3 text-stone-600">
                            {Array.isArray(ord.items) ? ord.items.length : 0} {isAr ? 'منتجات' : 'items'}
                          </td>
                          <td className="py-3 font-bold text-[#2D5A27]">
                            {formatPrice(ord.total || 0, currency, settings?.currencies, language)}
                          </td>
                          <td className="py-3 uppercase text-[10px] font-bold text-stone-500">
                            {ord.paymentMethod || 'N/A'}
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2D5A27]/10 text-[#2D5A27]">
                              {ord.status || 'new'}
                            </span>
                          </td>
                          <td className="py-3 text-stone-400 text-[11px]">
                            {formatOrderDate(ord.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-stone-400 py-6 text-center">
                {isAr ? 'لا توجد طلبات مسجلة حتى الآن.' : 'No orders in database yet.'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS CRUD */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder={isAr ? 'بحث في المنتجات...' : 'Search products...'}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-[#2D5A27]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => openProductModal()}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white hover:bg-[#23471f] text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة منتج جديد' : 'Add New Product'}</span>
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-3xl border border-[#2D5A27]/10 overflow-hidden shadow-sm">
            {products.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center mx-auto">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-900">
                    {isAr ? 'لا توجد أي منتجات حالياً' : 'No products in store yet'}
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
                    {isAr
                      ? 'تم مسح جميع المنتجات السابقة بناءً على طلبك. يمكنك الآن البدء بإضافة منتجاتك الخاصة بسهولة بالصور والأسعار والمخزون.'
                      : 'All sample products have been cleared. You can now start adding your own custom products with photos, prices, and stock.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openProductModal()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#23471f] shadow-md shadow-[#2D5A27]/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'إضافة أول منتج الآن' : 'Add First Product Now'}</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right text-xs">
                  <thead className="bg-[#FAFAF8] text-stone-500 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="p-4">{isAr ? 'المنتج' : 'Product'}</th>
                      <th className="p-4">{isAr ? 'التصنيف' : 'Category'}</th>
                      <th className="p-4">{isAr ? 'السعر' : 'Price'}</th>
                      <th className="p-4">{isAr ? 'المخزون' : 'Stock'}</th>
                      <th className="p-4">{isAr ? 'شارات' : 'Badges'}</th>
                      <th className="p-4 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products
                      .filter((p) =>
                        productSearch
                          ? p.name.ar.toLowerCase().includes(productSearch.toLowerCase()) ||
                            p.name.en.toLowerCase().includes(productSearch.toLowerCase())
                          : true
                      )
                      .map((prod) => {
                        const cat = categories.find((c) => c.id === prod.categoryId);
                        return (
                          <tr key={prod.id} className="hover:bg-[#FAFAF8]">
                            <td className="p-4 flex items-center gap-3">
                              <img
                                src={sanitizeImageUrl(prod.images[0])}
                                alt=""
                                className="w-10 h-10 rounded-xl object-cover bg-stone-100 shrink-0"
                              />
                              <div>
                                <p className="font-bold text-stone-900">{prod.name[language]}</p>
                                <p className="text-[10px] text-stone-400 font-mono">{prod.id}</p>
                              </div>
                            </td>
                            <td className="p-4 text-stone-600 font-medium">{cat?.name[language]}</td>
                            <td className="p-4 font-bold text-[#2D5A27]">
                              {formatPrice(prod.price, currency, settings.currencies, language)}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  prod.stock < 10
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {prod.stock} {isAr ? 'قطع' : 'in stock'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-1 flex-wrap">
                                {prod.featured && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                                    Featured
                                  </span>
                                )}
                                {prod.bestSeller && (
                                  <span className="px-1.5 py-0.5 rounded bg-[#2D5A27]/15 text-[#2D5A27] text-[9px] font-bold">
                                    Bestseller
                                  </span>
                                )}
                                {prod.newProduct && (
                                  <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[9px] font-bold">
                                    New
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openProductModal(prod)}
                                  className="p-1.5 text-stone-500 hover:text-[#2D5A27] hover:bg-stone-100 rounded-lg"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget({ type: 'product', id: prod.id, title: prod.name[language] || prod.name.ar })}
                                  className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title={isAr ? 'حذف المنتج' : 'Delete Product'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-[#1C241E]">
              {isAr ? 'إدارة الطلبات' : 'Orders Management'}
            </h2>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'new', 'processing', 'shipped', 'completed', 'cancelled'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOrderStatusFilter(st as OrderStatus | 'all')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-xl capitalize transition-colors ${
                    orderStatusFilter === st
                      ? 'bg-[#2D5A27] text-white'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {st === 'all' ? (isAr ? 'الكل' : 'All') : st}
                </button>
              ))}
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#2D5A27]/10 p-6 shadow-sm">
              <p className="text-xs text-stone-400 py-6 text-center">
                {isAr ? 'لا توجد طلبات مسجلة حتى الآن.' : 'No orders in database yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders
                .filter((o) => (orderStatusFilter === 'all' ? true : o.status === orderStatusFilter))
                .map((ord) => {
                  const customerWaUrl = getWhatsAppLink(
                    ord.customerPhone,
                    isAr
                      ? `مرحباً ${ord.customerName}! نتواصل معكِ من Sun Beauty بخصوص طلبكِ رقم ${ord.id} 🌿`
                      : `Hello ${ord.customerName}! Reaching out from Sun Beauty regarding order ${ord.id} 🌿`
                  );

                  return (
                    <div
                      key={ord.id}
                      className="p-6 rounded-3xl bg-white border border-[#2D5A27]/10 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#2D5A27]">
                              #{ord.id}
                            </span>
                            <span className="text-xs text-stone-400">
                              {formatOrderDate(ord.createdAt)}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-stone-900 mt-1">
                            {ord.customerName} ({ord.customerPhone})
                          </h4>
                          <p className="text-xs text-stone-500">
                            📍 {ord.governorate}, {ord.city} - {ord.address}
                          </p>
                        </div>

                        {/* Status Selector & WhatsApp Contact */}
                        <div className="flex items-center gap-3">
                          <select
                            value={ord.status}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                            className="bg-[#FAFAF8] border border-stone-200 text-xs font-bold rounded-xl px-3 py-2 text-[#2D5A27] focus:outline-none"
                          >
                            <option value="new">🆕 New</option>
                            <option value="processing">⚙️ Processing</option>
                            <option value="shipped">🚚 Shipped</option>
                            <option value="completed">✅ Completed</option>
                            <option value="cancelled">❌ Cancelled</option>
                          </select>

                          <a
                            href={customerWaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 font-bold text-xs flex items-center gap-1.5"
                            title="Chat with customer on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">واتساب</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ type: 'order', id: ord.id, title: `${ord.customerName} (#${ord.id})` })}
                            className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title={isAr ? 'حذف الطلب' : 'Delete Order'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Order items */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {ord.items.map((item, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-[#FAFAF8] border border-stone-100 flex items-center justify-between text-xs"
                          >
                            <span className="font-semibold text-stone-800 truncate">
                              {item.productName[language]} × {item.quantity}
                            </span>
                            <span className="font-bold text-[#2D5A27]">
                              {formatPrice(item.price * item.quantity, currency, settings.currencies, language)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 text-stone-600 border-t border-stone-100">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>طريقة الدفع: <b className="uppercase">{ord.paymentMethod}</b></span>
                          {ord.senderTransferNumber && (
                            <span className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[11px] flex items-center gap-1">
                              <span>📱 المحوّل منه:</span>
                              <span className="font-mono" dir="ltr">{ord.senderTransferNumber}</span>
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-bold text-[#2D5A27]">
                          الإجمالي: {formatPrice(ord.total, currency, settings.currencies, language)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setEditingCat(null);
                setCatNameAr('');
                setCatNameEn('');
                setCatImage('');
                setCatDescAr('');
                setCatDescEn('');
                setIsCatModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white hover:bg-[#23471f] text-xs font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة تصنيف جديد' : 'Add Category'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-3xl bg-white border border-[#2D5A27]/10 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <img
                    src={sanitizeImageUrl(cat.image)}
                    alt=""
                    className="w-full h-36 rounded-2xl object-cover bg-stone-100"
                  />
                  <div>
                    <h4 className="font-serif-luxury text-lg font-bold text-[#1C241E]">
                      {cat.name.ar} / {cat.name.en}
                    </h4>
                    <p className="text-xs text-stone-500 mt-1">{cat.description?.ar}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCat(cat);
                      setCatNameAr(cat.name.ar);
                      setCatNameEn(cat.name.en);
                      setCatImage(cat.image);
                      setCatDescAr(cat.description?.ar || '');
                      setCatDescEn(cat.description?.en || '');
                      setIsCatModalOpen(true);
                    }}
                    className="p-2 text-stone-600 hover:text-[#2D5A27] hover:bg-stone-100 rounded-xl"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ type: 'category', id: cat.id, title: cat.name.ar || cat.name.en })}
                    className="p-2 text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title={isAr ? 'حذف التصنيف' : 'Delete Category'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COUPONS MANAGEMENT */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsCouponModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white hover:bg-[#23471f] text-xs font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إنشاء كود خصم جديد' : 'Create Coupon'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((cpn) => (
              <div
                key={cpn.id}
                className="p-5 rounded-3xl bg-white border border-[#2D5A27]/10 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-base px-3 py-1 rounded-xl bg-[#2D5A27]/10 text-[#2D5A27]">
                      {cpn.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cpn.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {cpn.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-stone-800">
                    خصم: {cpn.value}
                    {cpn.type === 'percentage' ? '%' : ' ج.م'}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    الحد الأدنى للطلب: {cpn.minOrderAmount} ج.م
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    مرات الاستخدام: {cpn.usageCount}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100 mt-4">
                  <button
                    type="button"
                    onClick={() => updateCoupon(cpn.id, { isActive: !cpn.isActive })}
                    className="text-xs font-bold text-[#2D5A27] hover:underline"
                  >
                    {cpn.isActive ? 'تعطيل' : 'تفعيل'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ type: 'coupon', id: cpn.id, title: cpn.code })}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                    title={isAr ? 'حذف الكوبون' : 'Delete Coupon'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: REVIEWS MANAGEMENT */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#2D5A27]/10 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury text-xl font-bold text-[#1C241E]">
                  {isAr ? 'إدارة تقييمات وآراء العملاء' : 'Customer Reviews Management'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-xs font-bold">
                  {reviews.length} {isAr ? 'تقييم' : 'Reviews'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {isAr
                  ? 'تحكمي الكامل بالتقييمات المعروضة على المتجر؛ يمكنكِ إضافة تجارب العميلات وتعديلها أو حذفها يدوياً.'
                  : 'Full control over displayed reviews: manually add, edit, or delete customer testimonials.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {reviews.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({
                      type: 'clear_reviews',
                      id: 'all',
                      title: isAr ? 'كافة التقييمات الحالية' : 'All Reviews',
                    })
                  }
                  className="px-3.5 py-2.5 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isAr ? 'حذف كافة التقييمات' : 'Clear All'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenAddReview}
                className="px-5 py-2.5 rounded-2xl bg-[#2D5A27] text-white hover:bg-[#23471f] text-xs font-bold transition-all flex items-center gap-2 shadow-sm shadow-[#2D5A27]/20"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة تقييم جديد' : 'Add New Review'}</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          {reviews.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
                <input
                  type="text"
                  placeholder={isAr ? 'بحث باسم العميلة أو نص التقييم...' : 'Search reviews...'}
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="w-full pl-3 pr-9 rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#2D5A27]"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setReviewRatingFilter(0)}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-colors ${
                    reviewRatingFilter === 0
                      ? 'bg-[#2D5A27] text-white'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {isAr ? 'الكل' : 'All'}
                </button>
                {[5, 4, 3, 2, 1].map((rNum) => (
                  <button
                    key={rNum}
                    type="button"
                    onClick={() => setReviewRatingFilter(rNum)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 ${
                      reviewRatingFilter === rNum
                        ? 'bg-[#2D5A27] text-white'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>{rNum}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Grid */}
          {reviews.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-stone-300 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 fill-amber-400" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="font-serif-luxury text-lg font-bold text-stone-900">
                  {isAr ? 'لا توجد أي تقييمات حالياً' : 'No Reviews Yet'}
                </h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {isAr
                    ? 'تم إفراغ التقييمات بنجاح. يمكنكِ الآن الضغط على زر "إضافة تقييم جديد" في الأعلى لإضافة التقييمات والآراء التي ترغبين في إبرازها لعميلاتكِ.'
                    : 'Reviews list is currently empty. Click "+ Add New Review" to add verified testimonials to your storefront.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddReview}
                className="px-6 py-2.5 rounded-xl bg-[#2D5A27] text-white hover:bg-[#23471f] text-xs font-bold transition-all inline-flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة أول تقييم للمتجر' : 'Add First Review'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews
                .filter((r) => {
                  const matchSearch =
                    !reviewSearch ||
                    r.customerName.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                    r.comment.toLowerCase().includes(reviewSearch.toLowerCase());
                  const matchRating = reviewRatingFilter === 0 || r.rating === reviewRatingFilter;
                  return matchSearch && matchRating;
                })
                .map((rev) => {
                  const prod = products.find((p) => p.id === rev.productId);
                  return (
                    <div
                      key={rev.id}
                      className="p-5 rounded-3xl bg-white border border-[#2D5A27]/10 shadow-xs flex flex-col justify-between transition-all hover:border-[#2D5A27]/30"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-stone-900">{rev.customerName}</span>
                            {rev.verifiedPurchase !== false && (
                              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                                {isAr ? 'موثق ✓' : 'Verified'}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-stone-400">{rev.date}</span>
                        </div>

                        <div className="flex items-center text-[#D4AF37] mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-[#D4AF37]' : 'text-stone-200'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="mb-2">
                          {prod ? (
                            <span className="inline-block text-[11px] font-semibold text-[#2D5A27] bg-[#2D5A27]/10 px-2.5 py-0.5 rounded-lg">
                              {isAr ? 'منتج:' : 'Product:'} {prod.name[language]}
                            </span>
                          ) : (
                            <span className="inline-block text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg">
                              {isAr ? '✨ تقييم عام للمتجر' : '✨ General Store Review'}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-stone-700 italic leading-relaxed bg-[#FAFAF8] p-3 rounded-2xl border border-stone-100">
                          "{rev.comment}"
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 mt-4">
                        <button
                          type="button"
                          onClick={() => handleOpenEditReview(rev)}
                          className="p-2 text-stone-500 hover:text-[#2D5A27] hover:bg-stone-100 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                          title={isAr ? 'تعديل التقييم' : 'Edit Review'}
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>{isAr ? 'تعديل' : 'Edit'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              type: 'review',
                              id: rev.id,
                              title: `${rev.customerName} (${rev.rating} نجوم)`,
                            })
                          }
                          className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                          title={isAr ? 'حذف التقييم' : 'Delete Review'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isAr ? 'حذف' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2D5A27]/10 space-y-6 max-w-3xl">
          <h3 className="font-serif-luxury text-xl font-bold text-[#1C241E] border-b border-stone-100 pb-3">
            {t.admin.tabs.settings}
          </h3>

          {/* Store Logo Upload Section */}
          <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-[#2D5A27]/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1C241E]">
                  {isAr ? 'شعار الموقع (Logo)' : 'Website Logo'}
                </h4>
                <p className="text-[11px] text-stone-500">
                  {isAr
                    ? 'يمكنكِ رفع صورة الشعار من جهازك مباشرة ليظهر في أعلى وأسفل الموقع'
                    : 'Upload a custom store logo from your device to display in header and footer'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
              <div className="w-20 h-20 rounded-2xl bg-white border border-stone-200 flex items-center justify-center p-2 shrink-0 shadow-xs relative overflow-hidden">
                {settingsForm?.logoUrl ? (
                  <img
                    src={sanitizeImageUrl(settingsForm.logoUrl)}
                    alt="Store Logo"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-stone-400 text-[10px]">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50 text-[#2D5A27]" />
                    <span>{isAr ? 'الشعار الافتراضي' : 'Default'}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-4 py-2 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#23471f] flex items-center gap-2 cursor-pointer transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isAr ? 'رفع لوجو من جهازك' : 'Upload Logo from Device'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>

                  {settingsForm?.logoUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsForm((prev) => (prev ? { ...prev, logoUrl: '' } : prev))
                      }
                      className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'استعادة الشعار الافتراضي' : 'Reset to Default'}</span>
                    </button>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder={isAr ? 'أو أدخلي رابط الشعار (URL)' : 'Or enter logo image URL'}
                    value={settingsForm?.logoUrl || ''}
                    onChange={(e) =>
                      setSettingsForm((prev) =>
                        prev ? { ...prev, logoUrl: e.target.value } : prev
                      )
                    }
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-xl bg-white font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                اسم المتجر (العربية)
              </label>
              <input
                type="text"
                value={settingsForm?.storeName?.ar || ''}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    storeName: { ...settingsForm.storeName, ar: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                اسم المتجر (English)
              </label>
              <input
                type="text"
                value={settingsForm?.storeName?.en || ''}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    storeName: { ...settingsForm.storeName, en: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                رقم الواتساب (لإرسال الطلبات مباشرة)
              </label>
              <input
                type="text"
                value={settingsForm?.whatsappNumber || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                رقم هاتف المتجر / خدمة العملاء
              </label>
              <input
                type="text"
                value={settingsForm?.phone || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
              />
            </div>
          </div>

          {/* Payment details settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                📱 رقم محفظة فودافون كاش لاستقبال المدفوعات
              </label>
              <input
                type="text"
                placeholder="01012345678"
                value={settingsForm?.vodafoneCashNumber || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, vodafoneCashNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
              />
              <p className="text-[10px] text-stone-500 mt-1">يظهر للعميل عند اختيار الدفع عبر فودافون كاش</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                ⚡ معرف أو رقم إنستاباي (InstaPay)
              </label>
              <input
                type="text"
                placeholder="username@instapay أو 01012345678"
                value={settingsForm?.instapayAddress || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, instapayAddress: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
              />
              <p className="text-[10px] text-stone-500 mt-1">يظهر للعميل عند اختيار الدفع عبر إنستاباي</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={settingsForm?.email || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                رمز PIN للوحة الإدارة
              </label>
              <input
                type="text"
                value={settingsForm?.adminPin || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, adminPin: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                عنوان ومقر المتجر (العربية)
              </label>
              <input
                type="text"
                placeholder="البحيرة، دمنهور"
                value={settingsForm?.address?.ar || ''}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    address: {
                      ...settingsForm?.address,
                      en: settingsForm?.address?.en || 'Damanhour, El Beheira',
                      ar: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                عنوان المتجر (English)
              </label>
              <input
                type="text"
                placeholder="Damanhour, El Beheira"
                value={settingsForm?.address?.en || ''}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    address: {
                      ...settingsForm?.address,
                      ar: settingsForm?.address?.ar || 'البحيرة، دمنهور',
                      en: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                تكلفة الشحن الافتراضية (ج.م)
              </label>
              <input
                type="number"
                value={settingsForm?.shippingFee ?? 50}
                onChange={(e) => setSettingsForm({ ...settingsForm, shippingFee: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                الحد الأدنى للشحن المجاني (ج.م)
              </label>
              <input
                type="number"
                value={settingsForm?.freeShippingThreshold ?? 1000}
                onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
              />
            </div>
          </div>

          {/* Announcement Bar Settings */}
          <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900">
                تفعيل الشريط الإعلاني العلوي
              </label>
              <input
                type="checkbox"
                checked={settingsForm?.announcement?.enabled ?? true}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    announcement: {
                      ...settingsForm?.announcement,
                      ar: settingsForm?.announcement?.ar || '',
                      en: settingsForm?.announcement?.en || '',
                      animated: settingsForm?.announcement?.animated ?? true,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-[#2D5A27] rounded accent-[#2D5A27]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                نص شريط الإعلانات (العربية)
              </label>
              <input
                type="text"
                value={settingsForm?.announcement?.ar || ''}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    announcement: {
                      ...settingsForm?.announcement,
                      en: settingsForm?.announcement?.en || '',
                      enabled: settingsForm?.announcement?.enabled ?? true,
                      animated: settingsForm?.announcement?.animated ?? true,
                      ar: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                نص شريط الإعلانات (English)
              </label>
              <input
                type="text"
                value={settingsForm?.announcement?.en || ''}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    announcement: {
                      ...settingsForm?.announcement,
                      ar: settingsForm?.announcement?.ar || '',
                      enabled: settingsForm?.announcement?.enabled ?? true,
                      animated: settingsForm?.announcement?.animated ?? true,
                      en: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#2D5A27] text-white text-xs font-bold rounded-xl hover:bg-[#23471f] shadow-md transition-all"
            >
              حفظ التغييرات
            </button>
          </div>
        </form>
      )}

      {/* TAB 8: BACKUP, RESTORE & CODE EXPORT */}
      {activeTab === 'backup' && (
        <div className="space-y-8 max-w-3xl">
          {/* JSON Backup & Restore Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#2D5A27]/10 shadow-xs space-y-4">
            <h3 className="font-serif-luxury text-xl font-bold text-[#1C241E]">
              {isAr ? 'النسخ الاحتياطي والاستعادة الدائمة' : 'JSON Backup & Restore'}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {isAr
                ? 'يمكنكِ تصدير كامل قاعدة البيانات (المنتجات، الطلبات، الكوبونات، الإعدادات) كملف JSON، أو استعادتها في أي وقت بنقرة واحدة.'
                : 'Export all IndexedDB collections to a portable JSON file, or restore existing data.'}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#23471f] flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? 'تحميل نسخة JSON' : 'Export JSON Backup'}</span>
              </button>

              <label className="px-5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-[#2D5A27]" />
                <span>{isAr ? 'استعادة من ملف JSON' : 'Restore from JSON'}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Export initialData.ts Generator */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FAFAF8] border border-[#2D5A27]/20 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-serif-luxury text-xl font-bold text-[#1C241E]">
                {isAr ? 'تحديث وتصدير الكود المصدري (initialData.ts)' : 'Export initialData.ts Source Code'}
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {isAr
                ? 'أي منتج أو تصنيف أو كود خصم تضيفينه يتم حفظه فوراً في المتجر. يمكنكِ أيضاً تحميل ملف الكود المصدري المحدث أو نسخه ولصقه في المشروع ليكون هو الأساس الدائم.'
                : 'All added products and categories are immediately updated and saved. You can also download or copy the updated initialData.ts file.'}
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDownloadInitialDataTS}
                className="px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#23471f] transition-all flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? 'تحميل ملف initialData.ts المحدث' : 'Download initialData.ts'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyInitialDataCode}
                className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#1C241E] text-xs font-bold hover:bg-[#c29f2e] transition-all flex items-center gap-2 shadow-sm"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? (isAr ? 'تم النسخ بنجاح!' : 'Copied!') : (isAr ? 'نسخ كود initialData.ts' : 'Copy Code')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCodePreview(!showCodePreview)}
                className="px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4 text-[#2D5A27]" />
                <span>{showCodePreview ? (isAr ? 'إخفاء المعاينة' : 'Hide Code') : (isAr ? 'معاينة الكود المصدري' : 'Preview Code')}</span>
              </button>
            </div>

            {/* Code Preview Accordion */}
            {showCodePreview && (
              <div className="mt-4 p-4 rounded-2xl bg-stone-900 text-stone-200 text-[11px] font-mono overflow-x-auto max-h-80 border border-stone-800">
                <pre>{generateInitialDataFileContent({
                  products,
                  categories,
                  orders,
                  coupons,
                  reviews,
                  settings,
                })}</pre>
              </div>
            )}
          </div>

          {/* Danger Zone: Reset Database */}
          <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 space-y-3">
            <h4 className="text-sm font-bold text-rose-900">
              {isAr ? 'إعادة ضبط المصنع' : 'Reset Database to Factory Defaults'}
            </h4>
            <p className="text-xs text-rose-700">
              {isAr
                ? 'سيتم مسح التعديلات المحلية وإعادة تحميل المنتجات الافتراضية.'
                : 'Resets IndexedDB back to initial catalog state.'}
            </p>
            <button
              type="button"
              onClick={() => setDeleteTarget({ type: 'reset', id: 'all', title: isAr ? 'استعادة ضبط المصنع وحذف التعديلات' : 'Factory Reset' })}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
            >
              {isAr ? 'إعادة تعيين البيانات' : 'Reset to Defaults'}
            </button>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL (ADD / EDIT) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#2D5A27]/20 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif-luxury text-xl font-bold text-[#1C241E] mb-6">
              {editingProduct ? (isAr ? 'تعديل المنتج' : 'Edit Product') : (isAr ? 'إضافة منتج جديد' : 'Add New Product')}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    اسم المنتج (العربية) *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodForm.nameAr}
                    onChange={(e) => setProdForm({ ...prodForm, nameAr: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    اسم المنتج (الإنجليزية) *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodForm.nameEn}
                    onChange={(e) => setProdForm({ ...prodForm, nameEn: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    السعر (ج.م) *
                  </label>
                  <input
                    type="number"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    السعر قبل الخصم
                  </label>
                  <input
                    type="number"
                    value={prodForm.compareAtPrice}
                    onChange={(e) => setProdForm({ ...prodForm, compareAtPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    المخزون المتوفر *
                  </label>
                  <input
                    type="number"
                    required
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  التصنيف الرئيسي *
                </label>
                <select
                  value={prodForm.categoryId}
                  onChange={(e) => setProdForm({ ...prodForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name.ar} / {c.name.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Images: Upload and Preview */}
              <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-900">
                      {isAr ? 'صور المنتج' : 'Product Images'} *
                    </label>
                    <p className="text-[11px] text-stone-500">
                      {isAr ? 'يمكنك رفع صور من جهازك أو إضافة روابط مباشرة' : 'Upload image files from device or enter URLs'}
                    </p>
                  </div>
                  <label className="px-3.5 py-1.5 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#23471f] flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs w-fit">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isAr ? 'رفع صور من الجهاز' : 'Upload Images'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Thumbnails Gallery Preview */}
                {prodForm.images.trim().length > 0 && (
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {prodForm.images
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative w-16 h-16 rounded-xl border border-stone-200 bg-white overflow-hidden group shadow-xs"
                        >
                          <img
                            src={sanitizeImageUrl(imgUrl)}
                            alt={`Product preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveProductImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 hover:bg-rose-700 transition-all shadow-xs"
                            title={isAr ? 'حذف الصورة' : 'Remove Image'}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    {isAr ? 'روابط الصور (رابط في كل سطر)' : 'Image URLs (one per line)'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="https://..."
                    value={prodForm.images}
                    onChange={(e) => setProdForm({ ...prodForm, images: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl font-mono text-[11px] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  الوصف (العربية) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={prodForm.descriptionAr}
                  onChange={(e) => setProdForm({ ...prodForm, descriptionAr: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  الوصف (الإنجليزية) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={prodForm.descriptionEn}
                  onChange={(e) => setProdForm({ ...prodForm, descriptionEn: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    المكونات الرئيسية (العربية)
                  </label>
                  <input
                    type="text"
                    value={prodForm.ingredientsAr}
                    onChange={(e) => setProdForm({ ...prodForm, ingredientsAr: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    المكونات الرئيسية (الإنجليزية)
                  </label>
                  <input
                    type="text"
                    value={prodForm.ingredientsEn}
                    onChange={(e) => setProdForm({ ...prodForm, ingredientsEn: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.featured}
                    onChange={(e) => setProdForm({ ...prodForm, featured: e.target.checked })}
                    className="accent-[#2D5A27]"
                  />
                  <span>منتج مميز (Featured)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.bestSeller}
                    onChange={(e) => setProdForm({ ...prodForm, bestSeller: e.target.checked })}
                    className="accent-[#2D5A27]"
                  />
                  <span>الأكثر مبيعاً (Best Seller)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.newProduct}
                    onChange={(e) => setProdForm({ ...prodForm, newProduct: e.target.checked })}
                    className="accent-[#2D5A27]"
                  />
                  <span>وصل حديثاً (New Arrival)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2D5A27] text-white text-xs font-bold rounded-xl hover:bg-[#23471f]"
                >
                  حفظ المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#2D5A27]/20">
            <h3 className="font-serif-luxury text-xl font-bold text-[#1C241E] mb-4">
              {editingCat ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  اسم التصنيف (العربية) *
                </label>
                <input
                  type="text"
                  required
                  value={catNameAr}
                  onChange={(e) => setCatNameAr(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  اسم التصنيف (الإنجليزية) *
                </label>
                <input
                  type="text"
                  required
                  value={catNameEn}
                  onChange={(e) => setCatNameEn(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                />
              </div>
              {/* Category Image Upload & Preview */}
              <div className="space-y-2 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-900">
                    {isAr ? 'صورة التصنيف' : 'Category Image'}
                  </label>
                  <label className="px-3 py-1 rounded-xl bg-[#2D5A27] text-white text-[11px] font-bold hover:bg-[#23471f] flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs">
                    <Upload className="w-3 h-3" />
                    <span>{isAr ? 'رفع من الجهاز' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {catImage && (
                  <div className="relative w-20 h-20 rounded-xl border border-stone-200 bg-white overflow-hidden shadow-xs mx-auto">
                    <img
                      src={sanitizeImageUrl(catImage)}
                      alt="Category Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCatImage('')}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs"
                      title={isAr ? 'إزالة الصورة' : 'Remove'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    placeholder={isAr ? 'أو أدخل رابط الصورة (URL)' : 'Or enter image URL'}
                    value={catImage}
                    onChange={(e) => setCatImage(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-xl font-mono text-[11px] bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2D5A27] text-white text-xs font-bold rounded-xl"
                >
                  حفظ التصنيف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COUPON MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#2D5A27]/20">
            <h3 className="font-serif-luxury text-xl font-bold text-[#1C241E] mb-4">
              إنشاء كود خصم جديد
            </h3>
            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  كود الخصم (مثال: SUN20) *
                </label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl uppercase font-mono font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    نوع الخصم
                  </label>
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت (ج.م)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    قيمة الخصم *
                  </label>
                  <input
                    type="number"
                    required
                    value={couponValue}
                    onChange={(e) => setCouponValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  الحد الأدنى للطلب (ج.م)
                </label>
                <input
                  type="number"
                  value={couponMinOrder}
                  onChange={(e) => setCouponMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2D5A27] text-white text-xs font-bold rounded-xl"
                >
                  إنشاء الكود
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* REVIEW MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#2D5A27]/20 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <h3 className="font-serif-luxury text-xl font-bold text-[#1C241E]">
                {editingReview
                  ? (isAr ? 'تعديل التقييم' : 'Edit Review')
                  : (isAr ? 'إضافة تقييم عميلة جديد' : 'Add New Customer Review')}
              </h3>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReviewForm} className="space-y-4">
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isAr ? 'اسم العميلة / العميل *' : 'Customer Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: ندى الشريف' : 'e.g. Nada El-Sherif'}
                  value={reviewForm.customerName}
                  onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#2D5A27]"
                />
              </div>

              {/* Target Product / General Store Review */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isAr ? 'المنتج المستهدف بالتقييم' : 'Product Reviewed'}
                </label>
                <select
                  value={reviewForm.productId}
                  onChange={(e) => setReviewForm({ ...reviewForm, productId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#2D5A27] bg-white"
                >
                  <option value="">
                    {isAr ? '🌟 تقييم عام للمتجر والخدمة' : '🌟 General Store & Service Review'}
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name[language]} ({formatPrice(p.price, currency, language)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {isAr ? 'التقييم بالنجوم' : 'Star Rating'} ({reviewForm.rating}{' '}
                  {isAr ? 'من 5' : 'of 5'})
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-amber-50/50 border border-amber-200/50">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewForm.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-800 mr-2 rtl:mr-2 rtl:ml-0 ltr:ml-2 ltr:mr-0">
                    {reviewForm.rating === 5 && (isAr ? 'ممتاز جداً 🌟🌟🌟🌟🌟' : 'Excellent')}
                    {reviewForm.rating === 4 && (isAr ? 'جيد جداً 🌟🌟🌟🌟' : 'Very Good')}
                    {reviewForm.rating === 3 && (isAr ? 'جيد 🌟🌟🌟' : 'Good')}
                    {reviewForm.rating === 2 && (isAr ? 'مقبول 🌟🌟' : 'Fair')}
                    {reviewForm.rating === 1 && (isAr ? 'نجمة واحدة 🌟' : 'Poor')}
                  </span>
                </div>
              </div>

              {/* Review Date */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isAr ? 'تاريخ التقييم' : 'Review Date'}
                </label>
                <input
                  type="date"
                  value={reviewForm.date}
                  onChange={(e) => setReviewForm({ ...reviewForm, date: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#2D5A27]"
                />
              </div>

              {/* Review Text / Comment */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isAr ? 'نص رأي وتجربة العميلة *' : 'Review Comment *'}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={
                    isAr
                      ? 'اكتبي هنا تجربة العميلة الإيجابية مع المنتج أو المتجر...'
                      : 'Write customer feedback and results...'
                  }
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#2D5A27] leading-relaxed"
                />
              </div>

              {/* Verified Purchase Checkbox */}
              <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <input
                  type="checkbox"
                  id="verified-purchase-toggle"
                  checked={reviewForm.verifiedPurchase}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, verifiedPurchase: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#2D5A27] focus:ring-[#2D5A27]"
                />
                <label
                  htmlFor="verified-purchase-toggle"
                  className="text-xs font-semibold text-stone-800 cursor-pointer select-none"
                >
                  {isAr ? 'إظهار شارة "شراء موثق ✓"' : 'Display "Verified Buyer ✓" badge'}
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2D5A27] text-white text-xs font-bold rounded-xl hover:bg-[#23471f] transition-colors shadow-sm"
                >
                  {editingReview
                    ? (isAr ? 'حفظ التعديلات' : 'Save Changes')
                    : (isAr ? 'نشر التقييم' : 'Publish Review')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM IN-APP DELETE CONFIRMATION DIALOG */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-rose-100 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                {deleteTarget.type === 'reset'
                  ? (isAr ? 'تأكيد إعادة ضبط المصنع' : 'Confirm Factory Reset')
                  : (isAr ? 'تأكيد الحذف النهائي' : 'Confirm Deletion')}
              </h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                {deleteTarget.type === 'reset'
                  ? (isAr
                      ? 'سيتم مسح جميع التعديلات والمنتجات المضافة وإرجاع المتجر إلى حالته الافتراضية.'
                      : 'This will reset all modified data back to default.')
                  : (isAr
                      ? `هل أنتِ متأكدة من حذف "${deleteTarget.title}"؟ سيتم تطبيق الحذف وتحديث المتجر فوراً.`
                      : `Are you sure you want to delete "${deleteTarget.title}"? This action will apply immediately.`)}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                {deleteTarget.type === 'reset'
                  ? (isAr ? 'نعم، أعد التعيين' : 'Yes, Reset')
                  : (isAr ? 'نعم، احذف' : 'Yes, Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
