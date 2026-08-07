'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AddProductPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null); // حفظ ملف الصورة من جهاز الكمبيوتر
  const [loading, setLoading] = useState(false);

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !price) {
      alert('الرجاء إدخال اسم المنتج والسعر أولاً!');
      return;
    }
    setLoading(true);

    let finalImageUrl = 'https://unsplash.com'; // رابط افتراضي

    try {
      // 1. إذا قام التاجر باختيار ملف صورة من حاسوبه، نقوم برفعها فوراً إلى مخزن سوبابيز
      if (imageFile) {
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        
        // رفع الملف الحقيقي للمخزن السحابي
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          throw new Error('فشل رفع الصورة إلى المخزن: ' + uploadError.message);
        }

        // جلب الرابط العام المباشر للصورة المرفوعة
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrlData.publicUrl;
      }

      // 2. حفظ المنتج في جدول المنتجات وربطه برابط الصورة الذي تولد تلقائياً
      const { error: insertError } = await supabase
        .from('products')
        .insert([
          {
            title: title,
            description: description,
            base_price_da: parseInt(price),
            image_url: finalImageUrl,
            status: 'active'
          }
        ]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      alert('✓ تم رفع الصورة ونشر منتجك الرقمي بنجاح في المتجر الحي!');
      setTitle('');
      setDescription('');
      setPrice('');
      setImageFile(null);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
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
          <p className="text-xs text-gray-500 mt-1">قم بتعبئة تفاصيل سلعتك وارفع صورتها مباشرة من جهازك لبيعها في المنصة.</p>
        </div>

        <form onSubmit={handleAddProduct} className="space-y-4">
          {/* اسم المنتج */}
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

          {/* وصف المنتج */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">الوصف والشروط (اختياري):</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-green-500 bg-gray-50 h-20 resize-none text-right text-black"
              placeholder="شروط تسليم الكود للزبون..."
            />
          </div>

          {/* 📸 زر رفع الصورة الحقيقي والذكي من جهاز الكمبيوتر */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">صورة كرت السلعة (ارفع من جهازك):</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-xs bg-gray-50 text-right text-black file:ml-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {imageFile && (
              <p className="text-[11px] text-green-600 mt-1 font-medium">✓ جاهز لرفع الملف: {imageFile.name}</p>
            )}
          </div>

          {/* السعر الصافي */}
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
            {loading ? 'جاري معالجة ورفع الصورة للإنترنت...' : '🚀 نشر المنتج في المتجر فوراً'}
          </button>
        </form>
      </div>
    </div>
  );
}
