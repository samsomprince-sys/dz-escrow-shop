'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function AddProductPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 🛡️ تأمين الصفحة: منع أي شخص غير مسجل من إضافة منتجات
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('🔒 عذراً، يجب تسجيل الدخول أولاً كتاجر لتتمكن من رفع المنتجات وتلقي الأرباح!');
        router.push('/merchant/auth');
      } else {
        setCheckingAuth(false);
      }
    }
    checkUser();
  }, [router]);

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !price) {
      alert('الرجاء إدخال اسم المنتج والسعر أولاً!');
      return;
    }
    setLoading(true);

    let finalImageUrl = 'https://unsplash.com';

    try {
      // 1. جلب بيانات التاجر الحالي المسجل في الجلسة
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('انتهت الجلسة الأمنية، يرجى إعادة تسجيل الدخول.');
      const currentMerchantId = session.user.id;

      // 2. رفع الصورة إلى المخزن السحابي إذا تم إرفاقها
      if (imageFile) {
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `prod-${Date.now()}.${fileExtension}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile);

        if (uploadError) throw new Error('فشل رفع صورة السلعة: ' + uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrlData.publicUrl;
      }

      // 3. 💡 الحل الذكي: حفظ السلعة وربطها برقم التاجر الفعلي (currentMerchantId) لمنع الاختلاط
      const { error: insertError } = await supabase
        .from('products')
        .insert([
          {
            title: title,
            description: description,
            base_price_da: parseInt(price),
            image_url: finalImageUrl,
            merchant_id: currentMerchantId, // هنا يكمن الربط الذكي والآمن لحسابات التجار
            status: 'active'
          }
        ]);

      if (insertError) throw new Error(insertError.message);

      alert('✓ تم رفع الصورة ونشر منتجك الرقمي في المتجر وربطه بحسابك بنجاح حاسم!');
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

  if (checkingAuth) {
    return <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center text-slate-400">جاري فحص صلاحيات الأمان والولوج...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center" dir="rtl">
      <div className="w-full max-w-md mb-4 text-right">
        <Link href="/merchant/dashboard" className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-green-500 transition-colors">
          ← العودة للوحة تحكم التاجر
        </Link>
      </div>

      <div className="max-w-md w-full bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-800 text-right">
        <div className="mb-6 border-b border-slate-800 pb-4">
          <h1 className="text-xl font-bold text-white">إضافة منتج رقمي جديد 🎮</h1>
          <p className="text-xs text-slate-450 mt-1">ارفع صورتها واعرضها للبيع، وستظهر في حسابك الشخصي المنفصل فقط.</p>
        </div>

        <form onSubmit={handleAddProduct} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">اسم المنتج الرقمي:</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-green-500 text-right" placeholder="مثال: حساب نيتفليكس 4K شهر" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">الوصف والشروط (اختياري):</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white h-20 resize-none text-right" placeholder="شروط التسليم..." />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">صورة كرت السلعة (ارفع من جهازك):</label>
            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]); }} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 text-right file:ml-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-blue-200" />
            {imageFile && <p className="text-[11px] text-green-400 mt-1 font-medium">✓ جاهز للرفع: {imageFile.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">السعر الصافي الخاص بك (بالدج):</label>
            <div className="relative">
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-3 pl-12 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white text-right" placeholder="00.00" />
              <span className="absolute left-4 top-3 text-sm font-bold text-slate-500">دج</span>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm mt-2">
            {loading ? 'جاري معالجة ورفع السلعة سحابياً...' : '🚀 نشر المنتج في المتجر فوراً'}
          </button>
        </form>
      </div>
    </div>
  );
}
