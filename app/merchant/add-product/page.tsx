'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';


export default function AddProductPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const merchantId = "99999999-9999-9999-9999-999999999999"; 

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !price) {
      alert('الرجاء إدخال اسم المنتج والسعر أولاً!');
      return;
    }
    setLoading(true);

    const { error } = await supabase
      .from('products')
      .insert([
        {
          merchant_id: merchantId,
          title: title,
          description: description,
          base_price_da: parseInt(price),
          status: 'active'
        }
      ]);

    setLoading(false);

    if (error) {
      alert('حدث خطأ أثناء إضافة المنتج: ' + error.message);
    } else {
      alert('✓ تم نشر منتجك الرقمي بنجاح في قاعدة البيانات الحية!');
      setTitle('');
      setDescription('');
      setPrice('');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center" dir="rtl">
      
      {/* زر العودة للرئيسية */}
      <div className="w-full max-w-md mb-4 text-right">
        <a href="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-green-600 transition-colors">
          ← العودة للصفحة الرئيسية للمنصة
        </a>
      </div>

      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-md border border-gray-100 text-right">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-xl font-bold text-gray-800">إضافة منتج رقمي جديد 🎮</h1>
          <p className="text-xs text-gray-500 mt-1">أدخل تفاصيل سلعتك (بطاقات شحن، حسابات، أكواد ألعاب) لبيعها في المنصة.</p>
        </div>

        <form onSubmit={handleAddProduct} className="space-y-4">
          {/* اسم المنتج مع تفعيل الكتابة الفورية */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">اسم المنتج الرقمي:</label>
            <input
              type="text"
              placeholder="مثال: بطاقة فري فاير 210 جوهرة"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-green-500 bg-gray-50 text-right"
            />
          </div>

          {/* وصف المنتج مع تفعيل الكتابة الفورية */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">الوصف والشروط (اختياري):</label>
            <textarea
              placeholder="اكتب شروط تسليم الكود أو تفاصيل الحساب..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-green-500 bg-gray-50 h-24 resize-none text-right"
            />
          </div>

          {/* سعر التاجر مع تفعيل الكتابة الفورية وحذف الجملة التوضيحية السفلية تماماً */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">السعر الصافي الخاص بك (بالدج):</label>
            <div className="relative">
              <input
                type="number"
                placeholder="00.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-3 pl-12 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-green-500 bg-gray-50 font-bold text-right"
              />
              <span className="absolute left-4 top-3 text-sm font-bold text-gray-400">دج</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm mt-2"
          >
            {loading ? 'جاري نشر السلعة...' : '🚀 نشر المنتج في المتجر فوراً'}
          </button>
        </form>
      </div>
    </div>
  );
}
