'use client';

import { useState, type FormEvent } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AddProductPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // متغير حفظ رابط الصورة
  const [loading, setLoading] = useState(false);

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
          title: title,
          description: description,
          base_price_da: parseInt(price),
          image_url: imageUrl || 'https://unsplash.com', // رابط افتراضي لو نسي التاجر وضع صورة
          status: 'active'
        }
      ]);

    setLoading(false);

    if (error) {
      alert('حدث خطأ أثناء إضافة المنتج: ' + error.message);
    } else {
      alert('✓ تم نشر منتجك الرقمي مع صورته بنجاح في قاعدة البيانات الحية!');
      setTitle('');
      setDescription('');
      setPrice('');
      setImageUrl('');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center" dir="rtl">
      <div className="w-full max-w-md mb-4 text-right">
        <a href="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-green-600 transition-colors">
          ← العودة للصفحة الرئيسية للمنصة
        </a>
      </div>

      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-md border border-gray-100 text-right">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-xl font-bold text-gray-800">إضافة منتج رقمي جديد 🎮</h1>
          <p className="text-xs text-gray-500 mt-1">أدخل تفاصيل سلعتك وصورتها لبيعها في المنصة.</p>
        </div>

        <form onSubmit={handleAddProduct} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">اسم المنتج الرقمي:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-green-500 bg-gray-50 text-right text-black"
              placeholder="مثال: بطاقة فري فاير 210 جوهرة"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">الوصف والشروط (اختياري):</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-green-500 bg-gray-50 h-20 resize-none text-right text-black"
              placeholder="شروط تسليم الكود..."
            />
          </div>

          {/* 📸 الخانة الذكية الجديدة لإضافة رابط الصورة */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">رابط صورة كرت السلعة:</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-green-500 bg-gray-50 text-right text-black"
              placeholder="ضع رابط صورة الكرت المرفوعة هنا"
            />
            <p className="text-[10px] text-gray-400 mt-1">* ارفع صورة كرت المنتج على أي موقع رفع صور وانسخ رابطها هنا.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">السعر الصافي الخاص بك (بالدج):</label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-3 pl-12 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-green-500 bg-gray-50 font-bold text-right text-black"
                placeholder="00.00"
              />
              <span className="absolute left-4 top-3 text-sm font-bold text-gray-400">دج</span>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm mt-2">
            {loading ? 'جاري نشر السلعة...' : '🚀 نشر المنتج في المتجر فوراً'}
          </button>
        </form>
      </div>
    </div>
  );
}
