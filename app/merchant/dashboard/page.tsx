'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingWithdrawal, setPendingWithdrawal] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');

  async function fetchMerchantData(userId: string) {
    const { data: walletData } = await supabase
      .from('merchant_wallets')
      .select('total_earned_da, pending_withdrawal_da')
      .eq('merchant_id', userId);

    if (walletData && walletData.length > 0) {
      setTotalEarned(walletData[0].total_earned_da || 0);
      setPendingWithdrawal(walletData[0].pending_withdrawal_da || 0);
    }

    const { data: productsData } = await supabase
      .from('products')
      .select('id, title, description, base_price_da, image_url')
      .eq('merchant_id', userId) // جلب منتجات هذا التاجر المسجل فقط لحمايتها
      .eq('status', 'active');

    if (productsData) setProducts(productsData);
    setLoading(false);
  }

  // 🛡️ فحص صلاحيات الأمان لمنع التاجر غير المسجل
  useEffect(() => {
    async function checkUserAndFetch() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('🔒 عذراً، انتهت الجلسة أو لم تقم بتسجيل الدخول بعد! يرجى الدخول لإدارة سلعك وأرباحك.');
        router.push('/merchant/auth');
      } else {
        fetchMerchantData(session.user.id);
      }
    }
    checkUserAndFetch();
  }, [router]);

  async function handleDeleteProduct(id: string) {
    if (confirm('هل أنت متأكد من حذف المنتج؟')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) alert(error.message);
      else {
        alert('✓ تم الحذف!');
        const { data: { session } } = await supabase.auth.getSession();
        if (session) fetchMerchantData(session.user.id);
      }
    }
  }

  function startEdit(product: Product) {
    setEditingProductId(product.id);
    setEditTitle(product.title);
    setEditDescription(product.description);
    setEditPrice(product.base_price_da.toString());
  }

  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase
      .from('products')
      .update({ title: editTitle, description: editDescription, base_price_da: parseInt(editPrice) })
      .eq('id', editingProductId);

    if (error) alert(error.message);
    else {
      alert('✓ تم التحديث!');
      setEditingProductId(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) fetchMerchantData(session.user.id);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-400 min-h-screen bg-slate-950">جاري فحص الهوية وتحميل مستنداتك المعتمدة...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto mb-4 text-right">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-green-600 transition-colors">
          ← العودة للصفحة الرئيسية للمنصة
        </Link>
      </div>

      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 text-right flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">لوحة تحكم وإدارة التاجر المالي 💼</h1>
          <p className="text-sm text-gray-500 mt-1">تابع أرباحك الصافية وتحكم في سلعك الرقمية المعروضة بالتعجيل أو الحذف السريع.</p>
        </div>
        <Link href="/merchant/add-product" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm text-xs">
          🎮 إضافة منتج رقمي جديد
        </Link>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-right mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-md text-white">
          <p className="text-sm opacity-90 font-medium">إجمالي المكتسبات الافتراضية المستحقة</p>
          <p className="text-4xl font-extrabold mt-2">{totalEarned} دج</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">مبالغ قيد المعالجة (بريدي موب)</p>
          <p className="text-4xl font-bold text-gray-700 mt-2">{pendingWithdrawal} دج</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-right">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-r-4 border-green-600 pr-2">منتجاتك المعروضة حالياً وإدارتها ({products.length})</h2>
        <div className="grid grid-cols-1 gap-4">
          {products.map((product) => (
            <div key={product.id} className="border border-gray-100 rounded-xl p-4 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50">
              <div className="flex items-center gap-4">
                <img src={product.image_url} alt={product.title} className="w-14 h-14 object-contain bg-white border rounded-lg p-1" />
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{product.title}</h3>
                  <p className="text-xs font-bold text-green-600 mt-1">السعر الصافي: {product.base_price_da} دج</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(product)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-2 rounded-lg">✏️ تعديل</button>
                <button onClick={() => handleDeleteProduct(product.id)} className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-3 py-2 rounded-lg">🗑️ حذف</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingProductId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" dir="rtl">
          <form onSubmit={handleUpdateProduct} className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 text-right space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">✏️ تعديل بيانات المنتج</h3>
            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm text-black bg-gray-50" />
            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm text-black bg-gray-50" />
            <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm text-black font-bold bg-gray-50" />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-green-600 text-white font-bold py-2 rounded-xl text-xs">💾 حفظ</button>
              <button type="button" onClick={() => setEditingProductId(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs">إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
