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
    desc: "أفضل سوق P2P ونظام وسيط مالي (Escrow) لبيع المنتجات الرقمية عبر بريدي موب وعملات رقمية بأمان تام.",
    adminBtn: "⚙️ لوحة الأدمن (أمين الصندوق)",
    merchantBtn: "💼 لوحة التاجر (المكتسبات)",
    addProdBtn: "🎮 إضافة منتج رقمي جديد",
    marketTitle: "المتجر الرقمي والألعاب المتاحة حالياً 🔥",
    loading: "جاري جلب السلع الرقمية الحية من السيرفر...",
    noProducts: "لا توجد منتجات معروضة حالياً.",
    secured: "سلعة رقمية مؤمنة",
    noDesc: "لا يوجد وصف متاح لهذا المنتج.",
    priceLabel: "السعر الإجمالي للشراء:",
    currency: "دج",
    buyBtn: "شراء الآن ←",
    accountLabel: "حساب البائع",
    loginLabel: "تسجيل الدخول / الانضمام",
    brandName: "وساطة للضمان الجزائري",
    langLabel: "اللغة"
  },
  fr: {
    title: "Plateforme Escrow Algérienne 🇩🇿",
    desc: "Le meilleur marché P2P et système de courtage financier (Escrow) de vente de produits numériques sécurisé.",
    adminBtn: "⚙️ Panel Admin",
    merchantBtn: "💼 Panel Vendeur",
    addProdBtn: "🎮 Ajouter un produit",
    marketTitle: "Boutique Numérique & Jeux Disponibles 🔥",
    loading: "Chargement des produits depuis le serveur...",
    noProducts: "Aucun produit disponible pour le moment.",
    secured: "Produit Sécurisé",
    noDesc: "Aucune description disponible.",
    priceLabel: "Prix Total d'achat:",
    currency: "DA",
    buyBtn: "Acheter Maintenant →",
    accountLabel: "Compte Vendeur",
    loginLabel: "Se connecter",
    brandName: "Wasata Escrow",
    langLabel: "Langue"
  },
  en: {
    title: "Algerian Escrow Platform 🇩🇿",
    desc: "The best P2P marketplace and secure financial escrow system for selling digital products safely.",
    adminBtn: "⚙️ Admin Dashboard",
    merchantBtn: "💼 Merchant Dashboard",
    addProdBtn: "🎮 Add New Product",
    marketTitle: "Digital Marketplace & Available Games 🔥",
    loading: "Fetching digital products from server...",
    noProducts: "No products displayed at the moment.",
    secured: "Secured Digital Item",
    noDesc: "No description available.",
    priceLabel: "Total Purchase Price:",
    currency: "DA",
    buyBtn: "Buy Now →",
    accountLabel: "Seller Account",
    loginLabel: "Sign In / Register",
    brandName: "Wasata Escrow",
    langLabel: "Language"
  }
};

type LangKey = 'ar' | 'fr' | 'en';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<LangKey>('ar');

  const buyerFee = 500;
  const t = translations[lang];

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('id, title, description, base_price_da, image_url, status')
        .eq('status', 'active');

      if (data) setProducts(data);
      loading && setLoading(false);
    }
    fetchProducts();
  }, [loading]);

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* هيدر شريط تسجيل الدخول واللغات الاحترافي الممتاز */}
      <div className="max-w-6xl w-full flex justify-between items-center mb-6 px-2 gap-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Wasata" className="w-10 h-10 object-cover rounded-full border border-slate-800" />
          <span className="text-white font-bold text-sm hidden sm:inline">{t.brandName}</span>
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
      <div className="max-w-6xl w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 text-center mb-8">
        <div className="flex flex-col items-center mb-4">
          <img src="/logo.png" alt="شعار منصة الضمان" className="w-32 h-32 object-cover mb-3 rounded-full border-2 border-blue-100 shadow-md" />
          <h1 className="text-3xl font-extrabold text-white mb-2">{t.title}</h1>
        </div>
        <p className="text-sm text-slate-300 mb-6 font-medium">{t.desc}</p>

        <div className="flex flex-wrap gap-4 justify-center border-t border-slate-800 pt-6">
          <Link href="/admin/dashboard" className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm text-xs border border-slate-700">
            {t.adminBtn}
          </Link>
          <Link href="/merchant/dashboard" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm text-xs">
            {t.merchantBtn}
          </Link>
          <Link href="/merchant/add-product" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm text-xs">
            {t.addProdBtn}
          </Link>
        </div>
      </div>

      {/* ركن كروت عرض المنتجات الأنيقة والمستقرة مئة بالمئة */}
      <div className="max-w-6xl w-full text-right">
        <h2 className="text-xl font-bold text-white mb-6 border-r-4 border-blue-600 pr-3">{t.marketTitle}</h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400">{t.loading}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">{t.noProducts}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => {
              const finalBuyerPrice = product.base_price_da + buyerFee;

              return (
                <div key={product.id} className="bg-slate-900 rounded-2xl shadow-md border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all hover:scale-[1.01]">
                  
                  {/* عرض صورة الكرت ممتلئة ومحتواة بأناقة شديدة */}
                  <div className="relative w-full h-48 bg-slate-950">
                    <img 
                      src={product.image_url} 
                      alt={product.title} 
                      className="w-full h-full object-contain p-4 bg-slate-950/40"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://unsplash.com';
                      }}
                    />
                    <span className="absolute top-3 right-3 text-[10px] bg-blue-600/90 text-white font-bold px-2 py-1 rounded-md backdrop-blur-sm">{t.secured}</span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white line-clamp-1 mb-1">{product.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 bg-slate-950 p-2.5 rounded-xl border border-slate-850 h-12">{product.description || t.noDesc}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-500">{t.priceLabel}</p>
                        <p className="text-lg font-black text-green-400">{finalBuyerPrice} <span className="text-xs font-normal text-slate-400">{t.currency}</span></p>
                      </div>
                      <Link href={`/buyer?id=${product.id}&price=${product.base_price_da}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm">
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
    </div>
  );
}


