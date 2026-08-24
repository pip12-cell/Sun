import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { LiveSearchModal } from './components/LiveSearchModal';
import { ProductModal } from './components/ProductModal';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Toast } from './components/Toast';

// Pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { AboutPage } from './pages/AboutPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  return (
    <Router>
      <StoreProvider>
        <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C241E] font-sans antialiased selection:bg-[#2D5A27]/20 selection:text-[#2D5A27]">
          {/* 1. Global Announcement Bar */}
          <AnnouncementBar />

          {/* 2. Global Header Navigation */}
          <Header />

          {/* 3. Main Route Views */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success/:id" element={<OrderSuccessPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* 4. Global Footer */}
          <Footer />

          {/* 5. Drawers, Modals & Floating Overlays */}
          <CartDrawer />
          <LiveSearchModal />
          <ProductModal />
          <WhatsAppButton />
          <Toast />
        </div>
      </StoreProvider>
    </Router>
  );
}

export default App;
<Route path="/checkout" element={<CheckoutPage />} />