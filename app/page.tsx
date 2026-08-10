'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  title: string;
  description: string;
  base_price_da: number;
  image_url: string;
  status: string;
}

const translations = {
  ar: {
    title: "منصة الضمان الجزائري 🇩🇿",
    desc: "أفضل سوق P2P ونظام وسيط مالي (Escrow) لبيع المنتجات الرقمية عبر بريدي موب بأمان تام.",
    adminBtn: "⚙️ لوحة الأدمن",
    merchantBtn: "💼 لوحة التاجر",
    addProdBtn: "🎮 إضافة منتج",
    marketTitle: "المتجر الرقمي والألعاب المتاحة حالياً 🔥",
    loading: "جاري جلب السلع الرقمية...",
    noProducts: "لا توجد منتجات تطابق خيارات البحث حالياً.",
    secured: "سلعة رقمية مؤمنة",
    noDesc: "لا يوجد وصف متاح.",
    priceLabel: "السعر الإجمالي للشراء:",
    currency: "دج",
    buyBtn: "شراء الآن ←",
    accountLabel: "حساب البائع",
    loginLabel: "تسجيل الدخول / الانضمام",
    brandName: "وساطة للضمان الجزائري",
    langLabel: "اللغة",
    // كلمات الفلاتر الجديدة المستوحاة من صورتك
    filterTitle: "تصفية السلع والتصنيفات",
    filterPrice: "السعر (بالدينار الجزائري)",
    fromPrice: "من دج",
    toPrice: "إلى دج",
    searchPlaceholder: "ابحث عن بطاقات، حسابات، أكواد ألعاب...",
    sortBy: "ترتيب حسب:",
    sortBest: "أفضل المبيعات",
    sortLowHigh: "السعر: من الأقل للأعلى",
    sortHighLow: "السعر: من الأعلى للأقل"
  },
  fr: {
    title: "Plateforme Escrow Algérienne 🇩🇿",
    desc: "Le meilleur marché P2P et système de courtage financier (Escrow) via BaridiMob.",
    adminBtn: "⚙️ Panel Admin",
    merchantBtn: "💼 Panel Vendeur",
    addProdBtn: "🎮 Ajouter un produit",
    marketTitle: "Boutique Numérique & Jeux 🔥",
    loading: "Chargement des produits...",
    noProducts: "Aucun produit ne correspond à votre recherche.",
    secured: "Produit Sécurisé",
    noDesc: "Aucune description.",
    priceLabel: "Prix Total d'achat:",
    currency: "DA",
    buyBtn: "Acheter Maintenant →",
    accountLabel: "Compte Vendeur",
    loginLabel: "Se connecter",
    brandName: "Wasata Escrow",
    langLabel: "Langue",
    filterTitle: "Filtrer les produits",
    filterPrice: "Prix (en DA)",
    fromPrice: "De DA",
    toPrice: "À DA",
    searchPlaceholder: "Rechercher des cartes, comptes, jeux...",
    sortBy: "Trier par:",
    sortBest: "Meilleures ventes",
    sortLowHigh: "Prix: du - au +",
    sortHighLow: "Prix: du + au -"
  },
  en: {
    title: "Algerian Escrow Platform 🇩🇿",
    desc: "The best P2P marketplace and secure financial escrow system via BaridiMob.",
    adminBtn: "⚙️ Admin Dashboard",
    merchantBtn: "💼 Merchant Dashboard",
    addProdBtn: "🎮 Add New Product",
    marketTitle: "Digital Marketplace 🔥",
    loading: "Fetching products...",
    noProducts: "No products match your criteria.",
    secured: "Secured Digital Item",
    noDesc: "No description available.",
    priceLabel: "Total Purchase Price:",
    currency: "DA",
    buyBtn: "Buy Now →",
    accountLabel: "Seller Account",
    loginLabel: "Sign In",
    brandName: "Wasata Escrow",
    langLabel: "Language",
    filterTitle: "Filter Products",
    filterPrice: "Price (in DA)",
    fromPrice: "Min DA",
    toPrice: "Max DA",
    searchPlaceholder: "Search cards, accounts, keys...",
    sortBy: "Sort by:",
    sortBest: "Best Sellers",
    sortLowHigh: "Price: Low to High",
    sortHighLow: "Price: High to Low"
  }
};

type LangKey = 'ar' | 'fr' | 'en';

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<LangKey>('ar');

  // متغيرات الفلاتر النصية والعددية المضافة حديثاً
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('best');

  const buyerFee = 500;
  const t = translations[lang];

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('id, title, description, base_price_da, image_url, status')
        .eq('status', 'active');

      if (data) {
        setAllProducts(data);
        setFilteredProducts(data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // دالة الفلترة والترتيب الفورية التلقائية
  useEffect(() => {
    let result = [...allProducts];

    // 1. الفلترة حسب شريط البحث
    if (searchQuery) {
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 2. الفلترة حسب السعر المالي المدخل (شامل العمولة لراحة المشتري)
    if (minPrice) {
      result = result.filter(p => (p.base_price_da + buyerFee) >= parseInt(minPrice));
    }
    if (maxPrice) {
      result = result.filter(p => (p.base_price_da + buyerFee) <= parseInt(maxPrice));
    }

    // 3. ترتيب الأسعار (Sort) المماثل لصورتك
    if (sortBy === 'low-high') {
      result.sort((a, b) => a.base_price_da - b.base_price_da);
    } else if (sortBy === 'high-low') {
      result.sort((a, b) => b.base_price_da - a.base_price_da);
    }

    setFilteredProducts(result);
  }, [searchQuery, minPrice, maxPrice, sortBy, allProducts]);

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* هيدر شريط تسجيل الدخول واللغات */}
      <div className="max-w-7xl w-full flex flex-wrap justify-between items-center mb-6 px-2 gap-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Wasata" className="w-10 h-10 object-cover rounded-full border border-slate-800" />
          <span className="text-white font-bold text-sm hidden sm:inline">{t.brandName}</span>
        </div>

        {/* شريط البحث المباشر في الأعلى كـ G2A */}
        <div className="flex-1 max-w-md mx-4">
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 text-white border border-slate-800 rounded-xl py-2 px-4 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 gap-1.5">
            <span className="text-slate-400 text-xs font-semibold">{t.langLabel}:</span>
            <select value={lang} onChange={(e) => setLang(e.target.value as LangKey)} className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer">
              <option value="ar" className="bg-slate-900 text-white">العربية (AR)</option>
              <option value="fr" className="bg-slate-900 text-white">Français (FR)</option>
              <option value="en" className="bg-slate-900 text-white">English (EN)</option>
            </select>
          </div>

          <Link href="/merchant/auth" className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-850 text-white font-medium py-2 px-4 rounded-xl border border-slate-800 transition-all text-xs group">
            <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 group-hover:bg-slate-700 transition-colors">
              <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div className={`leading-tight ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <p className="text-[10px] text-slate-400">{t.accountLabel}</p>
              <p className="font-bold text-slate-200">{t.loginLabel}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* المستطيل الفخم الترحيبي للزوار */}
      <div className="max-w-7xl w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 text-center mb-8">
        <div className="flex flex-col items-center mb-4">
          <img src="/logo.png" alt="شعار منصة الضمان" className="w-32 h-32 object-cover mb-3 rounded-full border-2 border-blue-100 shadow-md" />
          <h1 className="text-3xl font-extrabold text-white mb-2">{t.title}</h1>
        </div>
        <p className="text-sm text-slate-300 mb-6 font-medium">{t.desc}</p>
        <div className="flex flex-wrap gap-4 justify-center border-t border-slate-800 pt-6">
          <Link href="/admin/dashboard" className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm text-xs border border-slate-700">{t.adminBtn}</Link>
          <Link href="/merchant/dashboard" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm text-xs">{t.merchantBtn}</Link>
          <Link href="/merchant/add-product" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm text-xs">{t.addProdBtn}</Link>
        </div>
      </div>

      {/* 🛠️ الهيكلة المتقدمة للمتجر: شريط جانبي + ركن المنتجات مثل G2A تماماً */}
      <div className="max-w-7xl w-full flex flex-col md:flex-row gap-6">
        {/* 1️⃣ الركن الأيمن: شريط التصفية الجانبي (Filters) المصلح بالكامل */}
        <div className="w-full md:w-64 bg-slate-900 rounded-2xl border border-slate-800 p-5 h-fit text-right">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
            <span>🔍</span> {t.filterTitle}
          </h3>
          
          {/* فلتر تصفية الأسعار بالدينار الجزائري الحية */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-400">{t.filterPrice}</label>
            <div className="flex gap-2" dir="ltr">
              <input 
                type="number" 
                placeholder={t.toPrice}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 bg-slate-950 text-white border border-slate-800 rounded-xl py-2 px-3 text-xs text-center focus:outline-none focus:border-blue-500 text-black"
              />
              <input 
                type="number" 
                placeholder={t.fromPrice}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 bg-slate-950 text-white border border-slate-800 rounded-xl py-2 px-3 text-xs text-center focus:outline-none focus:border-blue-500 text-black"
              />
            </div>
          </div>
        </div>      </div>
    </div>
  );
}