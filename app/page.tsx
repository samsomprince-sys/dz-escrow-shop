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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const buyerFee = 500;

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('id, title, description, base_price_da, image_url, status')
        .eq('status', 'active');

      if (data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center" dir="rtl">
      
      {/* 🌐 شريط هيدر علوي مخصص لزر تسجيل الدخول مثل موقع G2A */}
      <div className="max-w-6xl w-full flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-3">
          {/* شعار صغير جانبي */}
          <img src="/logo.png" alt="Wasata" className="w-10 h-10 object-cover rounded-full border border-slate-800" />
          <span className="text-white font-bold text-sm hidden sm:inline">وساطة للضمان الجزائري</span>
        </div>

        {/* 👤 زر تسجيل الدخول المصمم باحترافية مطابقة لـ G2A */}
        <Link 
          href="/merchant/auth" 
          className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-850 text-white font-medium py-2 px-4 rounded-xl border border-slate-800 transition-all text-xs group"
        >
          <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 group-hover:bg-slate-700 transition-colors">
            <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <div className="text-right leading-tight">
            <p className="text-[10px] text-slate-400">حساب البائع</p>
            <p className="font-bold text-slate-200">تسجيل الدخول / الانضمام</p>
          </div>
        </Link>
      </div>

      {/* المستطيل الفخم الترحيبي للزوار */}
      <div className="max-w-6xl w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 text-center mb-8">
        <div className="flex flex-col items-center mb-4">
          <img src="/logo.png" alt="شعار منصة الضمان" className="w-32 h-32 object-cover mb-3 rounded-full border-2 border-blue-100 shadow-md" />
          <h1 className="text-3xl font-extrabold text-white mb-2">منصة الضمان الجزائري 🇩🇿</h1>
        </div>
        <p className="text-sm text-slate-300 mb-6 font-medium">أفضل سوق P2P ونظام وسيط مالي (Escrow) لبيع المنتجات الرقمية عبر بريدي موب وعملات رقمية بأمان تام.</p>

        <div className="flex flex-wrap gap-4 justify-center border-t border-slate-800 pt-6">
          <Link href="/admin/dashboard" className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm text-xs border border-slate-700">
            ⚙️ لوحة الأدمن (أمين الصندوق)
          </Link>
          <Link href="/merchant/dashboard" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm text-xs">
            💼 لوحة التاجر (المكتسبات)
          </Link>
          <Link href="/merchant/add-product" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm text-xs">
            🎮 إضافة منتج رقمي جديد
          </Link>
        </div>
      </div>

      {/* قسم المتجر وعرض الكروت */}
      <div className="max-w-6xl w-full text-right">
        <h2 className="text-xl font-bold text-white mb-6 border-r-4 border-blue-600 pr-3">المتجر الرقمي والألعاب المتاحة حالياً 🔥</h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400">جاري جلب السلع الرقمية الحية من السيرفر...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">لا توجد منتجات معروضة حالياً.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => {
              const finalBuyerPrice = product.base_price_da + buyerFee;

              return (
                <div key={product.id} className="bg-slate-900 rounded-2xl shadow-md border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all hover:scale-[1.01]">
                  
                  {/* عرض صورة الكرت ممتدة بالكامل */}
                  <div className="relative w-full h-48 bg-slate-950">
                    <img 
                      src={product.image_url} 
                      alt={product.title} 
                      className="w-full h-full object-contain p-4 bg-slate-950/40"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://unsplash.com';
                      }}
                    />
                    <span className="absolute top-3 right-3 text-[10px] bg-blue-600/90 text-white font-bold px-2 py-1 rounded-md backdrop-blur-sm">سلعة رقمية مؤمنة</span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white line-clamp-1 mb-1">{product.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 bg-slate-950 p-2.5 rounded-xl border border-slate-850 h-12">{product.description || 'لا يوجد وصف متاح.'}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-500">السعر الإجمالي للشراء:</p>
                        <p className="text-lg font-black text-green-400">{finalBuyerPrice} <span className="text-xs font-normal text-slate-400">دج</span></p>
                      </div>
                      <Link href={`/buyer?id=${product.id}&price=${product.base_price_da}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm">
                        شراء الآن ←
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
