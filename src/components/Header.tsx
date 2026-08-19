import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Globe,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { CurrencyCode, Language } from '../types';

export const Logo: React.FC<{ className?: string }> = ({ className = 'h-10' }) => {
  const { settings, language } = useStore();
  const isAr = language === 'ar';
  const storeNameText = settings?.storeName?.[language] || 'Sun Beauty';

  if (settings?.logoUrl && settings.logoUrl.trim() !== '') {
    return (
      <div className={`flex items-center gap-2.5 select-none ${className}`}>
        <img
          src={settings.logoUrl}
          alt={storeNameText}
          referrerPolicy="no-referrer"
          className="h-10 max-h-12 w-auto max-w-[180px] object-contain rounded-lg shadow-2xs"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Botanical Two-Tulip & Stem Emblem */}
      <div className="w-10 h-10 rounded-full bg-[#2D5A27]/10 flex items-center justify-center p-1.5 shrink-0 border border-[#2D5A27]/20">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main botanical stem */}
          <path
            d="M50 88C50 65 48 45 50 30"
            stroke="#2D5A27"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Left leaf */}
          <path
            d="M49 60C38 58 28 66 26 76C36 78 46 72 49 60Z"
            fill="#3E7B35"
            opacity="0.85"
          />
          {/* Right leaf */}
          <path
            d="M51 52C62 50 72 58 74 68C64 70 54 64 51 52Z"
            fill="#527958"
            opacity="0.85"
          />
          {/* Primary Main Tulip (Gold/Green) */}
          <g transform="translate(36, 12) scale(0.32)">
            {/* Center petal */}
            <path
              d="M45 10C35 40 40 70 45 80C50 70 55 40 45 10Z"
              fill="#D4AF37"
            />
            {/* Left petal */}
            <path
              d="M45 80C20 75 10 50 15 25C25 45 35 65 45 80Z"
              fill="#2D5A27"
            />
            {/* Right petal */}
            <path
              d="M45 80C70 75 80 50 75 25C65 45 55 65 45 80Z"
              fill="#3E7B35"
            />
          </g>
          {/* Second delicate baby tulip bloom */}
          <g transform="translate(18, 28) scale(0.22) rotate(-22)">
            <path
              d="M45 10C35 40 40 70 45 80C50 70 55 40 45 10Z"
              fill="#D4AF37"
            />
            <path
              d="M45 80C20 75 10 50 15 25C25 45 35 65 45 80Z"
              fill="#2D5A27"
            />
            <path
              d="M45 80C70 75 80 50 75 25C65 45 55 65 45 80Z"
              fill="#527958"
            />
          </g>
          {/* Stem connection to baby tulip */}
          <path
            d="M49 46C38 42 30 38 27 34"
            stroke="#2D5A27"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <span className="font-serif-luxury text-xl md:text-2xl font-bold tracking-tight text-[#2D5A27] leading-none">
          {storeNameText}
        </span>
        <span className="text-[9px] uppercase tracking-[0.25em] text-[#527958] font-semibold mt-0.5">
          {isAr ? 'عناية نباتية فاخرة' : 'Botanical Luxury'}
        </span>
      </div>
    </div>
  );
};

export const Header: React.FC = () => {
  const {
    t,
    cartCount,
    wishlist,
    setIsCartOpen,
    setIsSearchOpen,
    language,
    setLanguage,
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: t.nav.home, path: '/' },
    { label: t.nav.products, path: '/products' },
    { label: t.nav.reviews, path: '/reviews' },
  ];

  return (
    <header
      id="main-app-header"
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#2D5A27]/10 py-3'
          : 'bg-[#FAFAF8] border-b border-[#2D5A27]/5 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <button
          id="mobile-menu-toggle-btn"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-[#2D5A27] hover:bg-[#2D5A27]/10 transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo */}
        <Link to="/" id="header-brand-logo-link">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav id="desktop-nav" className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive =
              link.path === '/'
                ? location.pathname === '/' && !location.hash
                : link.path.startsWith('/#')
                ? location.hash === link.path.substring(1)
                : location.pathname.startsWith(link.path);

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-[#2D5A27] relative py-1 ${
                  isActive ? 'text-[#2D5A27] font-semibold' : 'text-[#4A554D]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D5A27] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Live Search Trigger */}
          <button
            id="header-search-btn"
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-[#2D5A27] hover:bg-[#2D5A27]/10 transition-colors flex items-center gap-2 text-sm font-medium"
            title={t.nav.search}
          >
            <Search className="w-5 h-5" />
            <span className="hidden md:inline text-xs text-stone-500 font-normal">
              {t.nav.search}
            </span>
          </button>

          {/* Language Switcher */}
          <button
            id="header-language-toggle-btn"
            type="button"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-stone-200 hover:border-[#2D5A27]/40 text-xs font-semibold text-[#2D5A27] flex items-center gap-1 transition-colors"
            title={language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Wishlist Link */}
          <Link
            id="header-wishlist-btn"
            to="/wishlist"
            className="p-2 rounded-xl text-[#2D5A27] hover:bg-[#2D5A27]/10 transition-colors relative"
            title={t.nav.wishlist}
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#D4AF37] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Trigger */}
          <button
            id="header-cart-btn"
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#2D5A27] text-white hover:bg-[#23471f] transition-all flex items-center gap-2 relative shadow-sm hover:shadow-md"
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag className="w-5 h-5 text-[#FAFAF8]" />
            <span className="text-xs font-bold hidden sm:inline">{cartCount}</span>
            {cartCount > 0 && (
              <span className="sm:hidden absolute -top-1 -right-1 bg-[#D4AF37] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin link */}
          <Link
            id="header-admin-link"
            to="/admin"
            className="p-2 rounded-xl text-stone-400 hover:text-[#2D5A27] hover:bg-[#2D5A27]/5 transition-colors text-xs hidden lg:flex items-center gap-1"
            title={t.nav.admin}
          >
            <ShieldCheck className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer-menu"
          className="lg:hidden fixed inset-x-0 top-[60px] bg-white border-b border-stone-200 shadow-xl py-6 px-6 z-50 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-200"
        >
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-[#1C241E] hover:text-[#2D5A27] py-2 border-b border-stone-100 flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="text-stone-300">→</span>
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-stone-500 hover:text-[#2D5A27] py-2 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t.nav.admin}</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
