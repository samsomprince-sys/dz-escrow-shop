'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

interface Product {
  id: string;
  title: string;
  description: string;
  base_price_da: number;
  image_url: string;
}

export default function MerchantDashboard() {
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingWithdrawal, setPendingWithdrawal] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // متغيرات حالة التعديل السريع
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // دالة جلب الأرصدة والمنتجات معاً من السيرفر
  async function fetchMerchantData() {
    setLoading(true);
    
    // 1. جلب بيانات المحفظة
    const { data: walletData } = await supabase
      .from('merchant_wallets')
      .select('total_earned_da, pending_withdrawal_da');

    if (walletData && walletData.length > 0) {
      setTotalEarned(walletData[0].total_earned_da || 0);
      setPendingWithdrawal(walletData[0].pending_withdrawal_da || 0);
    }

    // 2. جلب المنتجات النشطة المعروضة في المتجر
    const { data: productsData } = await supabase
      .from('products')
      .select('id, title, description, base_price_da, image_url')
      .eq('status', 'active');

    if (productsData) {
      setProducts(productsData);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchMerchantData();
  }, []);

  // 🗑️ دالة حذف المنتج فوراً من قاعدة البيانات الحية
  async function handleDeleteProduct(id: string) {
    if (confirm('هل أنت متأكد تماماً من رغبتك في حذف هذا المنتج نهائياً من المتجر؟')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        alert('حدث خطأ أثناء الحذف: ' + error.message);
      } else {
        alert('✓ تم حذف المنتج بنجاح واختفائه من المتجر الرئيسي!');
        fetchMerchantData(); // تحديث القائمة
      }
    }
  }

  // ✏️ دالة بدء التعديل وتعبئة الخانات بالبيانات القديمة
  function startEdit(product: Product) {
    setEditingProductId(product.id);
    setEditTitle(product.title);
    setEditDescription(product.description);
    setEditPrice(product.base_price_da.toString());
  }

  // 💾 دالة حفظ التعديلات الجديدة في السيرفر
  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editTitle || !editPrice) return;

    const { error } = await supabase
      .from('products')
      .update({
        title: editTitle,
        description: editDescription,
        base_price_da: parseInt(editPrice)
      })
      .eq('id', editingProductId);

    if (error) {
      alert('حدث خطأ أثناء التحديث: ' + error.message);
    } else {
      alert('✓ تم تحديث بيانات السلعة بنجاح في السيرفر الحقيقي!');
      setEditingProductId(null);
      fetchMerchantData(); // إعادة جلب البيانات المحدثة
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500 min-h-screen bg-gray-50">جاري تحميل لوحة التحكم الذكية...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      {/* زر العودة للرئيسية */}
      <div className="max-w-7xl mx-auto mb-4 text-right">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-green-600 transition-colors">
          ← العودة للصفحة الرئيسية للمنصة
        </Link>
      </div>

      {/* رأس الصفحة والمفاتيح */}
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 text-right flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">لوحة تحكم وإدارة التاجر المالي 💼</h1>
          <p className="text-sm text-gray-500 mt-1">تابع أرباحك الصافية وتحكم في سلعك الرقمية المعروضة بالتعجيل أو الحذف السريع.</p>
        </div>
        <Link href="/merchant/add-product" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm text-xs">
          🎮 إضافة منتج رقمي جديد
        </Link>
      </div>

      {/* بطاقات عرض الرصيد المالي */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-right mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-md text-white">
          <p className="text-sm opacity-90 font-medium">إجمالي المكتسبات الافتراضية المستحقة</p>
          <p className="text-4xl font-extrabold mt-2">{totalEarned} دج</p>
          <p className="text-xs opacity-75 mt-4">* هذه القيمة صافية تماماً وسترسل لك عبر بريدي موب عند التسوية.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">مبالغ قيد المعالجة (بريدي موب)</p>
          <p className="text-4xl font-bold text-gray-700 mt-2">{pendingWithdrawal} دج</p>
          <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mt-4 inline-block">بانتظار قيام الإدارة بتحويل المبلغ إلى حسابك الـ CCP.</p>
        </div>
      </div>

      {/* 🛠️ الركن الذكي الجديد: إدارة وتعديل وحذف المنتجات حياً */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-right">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-r-4 border-green-600 pr-2">منتجاتك المعروضة حالياً وإدارتها ({products.length})</h2>

        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-400">لم تقم بنشر أي سلع حتى الآن. اضغط على زر الإضافة بالأعلى.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border border-gray-100 rounded-xl p-4 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                
                {/* تفاصيل السلعة */}
                <div className="flex items-center gap-4">
                  <img src={product.image_url} alt={product.title} className="w-14 h-14 object-contain bg-white border rounded-lg p-1" />
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{product.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-md">{product.description || 'لا يوجد وصف.'}</p>
                    <p className="text-xs font-bold text-green-600 mt-1">السعر الصافي: {product.base_price_da} دج</p>
                  </div>
                </div>

                {/* أزرار التحكم السريع */}
                <div className="flex gap-2">
                  <button onClick={() => startEdit(product)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                    ✏️ تعديل السعر والبيانات
                  </button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                    🗑️ حذف السلعة نهائياً
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📋 نافذة منبثقة منسقة تظهر فقط عند الضغط على زر التعديل */}
      {editingProductId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" dir="rtl">
          <form onSubmit={handleUpdateProduct} className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 text-right space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">✏️ تعديل بيانات المنتج الرقمي</h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">اسم المنتج:</label>
              <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm focus:outline-none text-black bg-gray-50" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">الوصف الحشوي للشروط:</label>
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm h-20 resize-none focus:outline-none text-black bg-gray-50" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">السعر الصافي الجديد (دج):</label>
              <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm focus:outline-none text-black font-bold bg-gray-50" />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-sm">
                💾 حفظ وتحديث البيانات
              </button>
              <button type="button" onClick={() => setEditingProductId(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-xl text-xs transition-colors">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
