'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

interface EscrowOrder {
  id: string;
  product_price_da: number;
  buyer_fee_da: number;
  status: string;
  payment_proof_url: string;
}

export default function AdminDashboard() {
  // متغيرات نظام الحماية والتشفير بناءً على طلبك الصارم
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [orders, setOrders] = useState<EscrowOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // دالة التحقق من الهوية السرية للأدمن
  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (username === 'SamirBoulefaa' && password === 'Samirsami9@') {
      setIsAuthenticated(true);
      fetchPendingOrders();
    } else {
      alert('❌ خطأ فادح: اسم المستخدم أو كلمة المرور غير صحيحة! الدخول ممنوع.');
    }
  }

  async function fetchPendingOrders() {
    const { data } = await supabase
      .from('escrow_orders')
      .select('id, product_price_da, buyer_fee_da, status, payment_proof_url')
      .eq('status', 'waiting_admin_deposit_approval');

    if (data) setOrders(data);
    setLoading(false);
  }

  async function handleApprove(orderId: string) {
    const response = await fetch('/api/escrow/approve-deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });

    if (response.ok) {
      alert('تمت المصادقة بنجاح! تم حجز الأموال وإشعار التاجر بالتسليم.');
      fetchPendingOrders();
    } else {
      alert('حدث خطأ أثناء محاولة المصادقة.');
    }
  }

  // 1. إذا لم يكن الأدمن مسجلاً لدخوله بالمعلومات السرية، تظهر له استمارة الحماية المقفلة
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6" dir="rtl">
        <form onSubmit={handleLogin} className="max-w-md w-full bg-gray-900 p-6 rounded-2xl border border-red-900/40 text-right shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-4xl">🛡️</span>
            <h1 className="text-xl font-bold text-red-400 mt-2">نظام الحماية المركزي للمنصة</h1>
            <p className="text-xs text-gray-500 mt-1">هذه اللوحة مشفرة ومخصصة للمدير العام فقط.</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">اسم المستخدم السري (Username):</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-red-500 text-right"
                placeholder="أدخل اسم المستخدم"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">كلمة المرور المشفرة (Password):</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-red-500 text-right"
                placeholder="••••••••••••"
              />
            </div>

            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm mt-2">
              🔓 فك التشفير ودخول اللوحة
            </button>
            
            <Link href="/" className="block text-center text-xs text-gray-500 hover:text-gray-400 underline mt-4">
              ← عودة للمتجر الرئيسي
            </Link>
          </div>
        </form>
      </div>
    );
  }

  // 2. إذا نجح في كتابة "SamirBoulefaa" والرمز السري، يفتح له السيرفر لوحة التحكم الحقيقية
  if (loading) {
    return <div className="p-8 text-center text-gray-500 bg-gray-900 min-h-screen">جاري تحميل طلبات الـ Escrow المعلقة...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto mb-4 text-right">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-gray-400 hover:text-amber-400 transition-colors">
          ← العودة للصفحة الرئيسية للمنصة
        </Link>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8 text-right">
        <h1 className="text-2xl font-bold text-amber-400">لوحة تحكم أمين المنصة (المدير: Samir) 👑</h1>
        <p className="text-sm text-gray-400 mt-1">تأكد من وصول الأموال إلى حساب بريدي موب الخاص بك أولاً، ثم اضغط على زر المصادقة لتفعيل الضمان.</p>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden text-right">
        <div className="p-4 border-b border-gray-700 bg-gray-850">
          <h2 className="font-semibold text-lg text-gray-200">طلبات بانتظار التأكيد المالي ({orders.length})</h2>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">لا توجد طلبات معلقة حالياً. كل المعاملات مستقرة!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-750 text-gray-400 text-sm border-b border-gray-700">
                  <th className="p-4 text-right">رقم الصفقة</th>
                  <th className="p-4 text-right">المبلغ الإجمالي للمشتري</th>
                  <th className="p-4 text-right">إثبات الدفع</th>
                  <th className="p-4 text-right">الإجراء الحاسم</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="p-4 font-mono text-xs text-gray-400">{order.id}</td>
                    <td className="p-4 font-bold text-green-400">{order.product_price_da + order.buyer_fee_da} دج</td>
                    <td className="p-4">
                      {order.payment_proof_url ? (
                        <a href={order.payment_proof_url} target="_blank" className="text-blue-400 underline text-sm hover:text-blue-300">
                          معاينة وصل بريدي موب 📄
                        </a>
                      ) : (
                        <span className="text-amber-500 text-sm">لم يرفع صورة الوصل بعد</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button onClick={() => handleApprove(order.id)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                        ✓ مصادقة وحجز الأموال
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
