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
        {/* 2️⃣ الركن الأيسر: شريط الترتيب العلوي وبطاقات عرض المنتجات */}
<div className="flex-1 flex flex-col">
  
  {/* شريط الترتيب العلوي المماثل لموقع G2A تماماً */}
  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 mb-6 flex flex-wrap justify-between items-center gap-4">
    <h2 className="text-base font-bold text-white pr-2">{t.marketTitle}</h2>
    
    {/* أداة الترتيب الذكية المأخوذة من لقطة الشاشة */}
    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
      <span className="text-slate-400 text-xs font-semibold">{t.sortBy}</span>
      <select 
        value={sortBy} 
        onChange={(e) => setSortBy(e.target.value)}
        className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
      >
        <option value="best" className="bg-slate-900 text-white">{t.sortBest}</option>
        <option value="low-high" className="bg-slate-900 text-white">{t.sortLowHigh}</option>
        <option value="high-low" className="bg-slate-900 text-white">{t.sortHighLow}</option>
      </select>
    </div>
  </div>

  {/* شبكة عرض كروت المنتجات الرقمية (Grid Layout) */}
  {loading ? (
    <div className="text-center py-12 text-slate-400">{t.loading}</div>
  ) : filteredProducts.length === 0 ? (
    <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">{t.noProducts}</div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {filteredProducts.map((product) => {
        // تطبيق شرط المنصة الصارم: السعر الإجمالي = سعر البائع + 500 دج عمولة وثبات المنصة
        const finalBuyerPrice = product.base_price_da + buyerFee;

        return (
          <div key={product.id} className="bg-slate-900 rounded-2xl shadow-md border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all hover:scale-[1.01]">
            
            {/* 📸 جزء احتواء الصورة وحمايتها من الاقتصاص */}
            <div className="relative w-full h-48 bg-slate-950">
              <img 
                src={product.image_url} 
                alt={product.title} 
                className="w-full h-full object-contain p-4 bg-slate-950/40"
                onError={(e) => {
                  // صورة حماية افتراضية في حال تلف الرابط
                  (e.target as HTMLImageElement).src = 'https://unsplash.com';
                }}
              />
              {/* شارة الضمان المالي */}
              <span className={`absolute top-3 text-[10px] bg-blue-600/90 text-white font-bold px-2 py-1 rounded-md backdrop-blur-sm ${lang === 'ar' ? 'right-3' : 'left-3'}`}>
                {t.secured}
              </span>
            </div>

            {/* تفاصيل السلعة وأزرار الشراء */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white line-clamp-1 mb-1 text-right">{product.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 bg-slate-950 p-2.5 rounded-xl border border-slate-850 h-12 text-right">
                  {product.description || t.noDesc}
                </p>
              </div>

              {/* السعر النهائي الإجمالي وزر الشراء المباشر لصفحة الفاتورة */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 text-right">{t.priceLabel}</p>
                  <p className="text-base font-black text-green-400">
                    {finalBuyerPrice} <span className="text-xs font-normal text-slate-400">{t.currency}</span>
                  </p>
                </div>
                <Link 
                  href={`/buyer?id=${product.id}&price=${product.base_price_da}&lang=${lang}`} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm"
                >
                  {t.buyBtn}
                </Link>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  )}
</div>

        
        {/* 1️⃣ الركن الأيمن: شريط التصفية الجانبي (Filters) */}
        <div className="w-full md:w-64 bg-slate-900 rounded-2xl border border-slate-800 p-5 h-fit text-right">
        </div>
      </div>
    </div>
  );
}

