'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

// تعريف شكل بيانات المنتج القادم من السيرفر
interface Product {
  id: string;
  title: string;
  description: string;
  base_price_da: number;
  status: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // عمولة المنصة الثابتة المضافة على المشتري حسب شرطك
  const buyerFee = 500;

  useEffect(() => {
    async function fetchProducts() {
      // جلب المنتجات النشطة فقط من قاعدة البيانات الحية
      const { data, error } = await supabase
        .from('products')
        .select('id, title, description, base_price_da, status')
        .eq('status', 'active');

      if (data) {
        setProducts(data);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center" dir="rtl">
      
      {/* هيدر الموقع وشعار المنصة */}
      <div className="max-w-6xl w-full bg-white p-8 rounded-2xl shadow-md border border-gray-100 text-center mb-8">
      {/* الشعار والأيقونة الرسمية للمنصة */}
     <div className="flex flex-col items-center mb-4">
       <img src="/logo.png" alt="شعار منصة الضمان" className="w-32 h-32 object-cover mb-3 rounded-full border-2 border-blue-100 shadow-md" />
       <h1 className="text-3xl font-extrabold text-blue-600">منصة الضمان الجزائري 🇩🇿</h1>
     </div>

        <p className="text-sm text-gray-500 mb-6">أفضل سوق P2P ونظام وسيط مالي (Escrow) لبيع المنتجات الرقمية عبر بريدي موب وعملات رقمية بأمان تام.</p>

        {/* أزرار الدخول السريعة للوحات التحكم */}
        <div className="flex flex-wrap gap-4 justify-center border-t border-gray-100 pt-6">
          <Link href="/admin/dashboard" className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm text-xs">
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

      {/* قسم عرض المنتجات الرقمية (Marketplace مثل Eneba) */}
      <div className="max-w-6xl w-full text-right">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-r-4 border-blue-600 pr-3">المتجر الرقمي والألعاب المتاحة حالياً 🔥</h2>

        {loading ? (
          <div className="text-center py-12 text-gray-500">جاري جلب السلع الرقمية الحية من السيرفر...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-400">
            لا توجد منتجات معروضة حالياً. اضغط على زر "إضافة منتج رقمي" في الأعلى لتكون أول من ينشر سلعته!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => {
              // تطبيق شرطك المالي: السعر المعروض للمشتري = سعر التاجر الأصلي + 500 دج عمولة المنصة
              const finalBuyerPrice = product.base_price_da + buyerFee;

              return (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    {/* شارة منتج رقمي */}
                    <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-1 rounded-md">سلعة رقمية مؤمنة</span>
                    <h3 className="text-lg font-bold text-gray-800 mt-2 line-clamp-1">{product.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 h-12 line-clamp-3 bg-gray-50 p-2 rounded-lg">{product.description || 'لا يوجد وصف متاح لهذا المنتج.'}</p>
                  </div>

                  {/* السعر وزر الشراء */}
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400">السعر الإجمالي للشراء:</p>
                      <p className="text-xl font-extrabold text-green-600">{finalBuyerPrice} <span className="text-xs">دج</span></p>
                    </div>
                    <Link 
                      href={`/buyer/order?id=${product.id}&price=${product.base_price_da}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                    >
                      🛒 شراء الآن
                    </Link>
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
