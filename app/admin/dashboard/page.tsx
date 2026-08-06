'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// تعريف شكل بيانات الصفقة القادمة من قاعدة البيانات
interface EscrowOrder {
  id: string;
  product_price_da: number;
  buyer_fee_da: number;
  status: string;
  payment_proof_url: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<EscrowOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // دالة لجلب الطلبات التي تنتظر موافقة الأدمن على دفع بريدي موب
  async function fetchPendingOrders() {
    const { data, error } = await supabase
      .from('escrow_orders')
      .select('id, product_price_da, buyer_fee_da, status, payment_proof_url')
      .eq('status', 'waiting_admin_deposit_approval');

    if (data) setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  // دالة المصادقة وتفعيل الـ Escrow بعد التأكد من وصول المال لحسابك البريدي
  async function handleApprove(orderId: string) {
    const response = await fetch('/api/escrow/approve-deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });

    if (response.ok) {
      alert('تمت المصادقة بنجاح! تم حجز الأموال وإشعار التاجر بالتسليم.');
      fetchPendingOrders(); // تحديث القائمة وحذف الطلب الذي تمت الموافقة عليه
    } else {
      alert('حدث خطأ أثناء محاولة المصادقة.');
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">جاري تحميل طلبات الـ Escrow المعلقة...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6" dir="rtl">
      {/* رأس لوحة التحكم */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
        <h1 className="text-2xl font-bold text-amber-400">لوحة تحكم أمين المنصة (الأدمن)</h1>
        <p className="text-sm text-gray-400 mt-1">تأكد من وصول الأموال إلى حساب بريدي موب الخاص بك أولاً، ثم اضغط على زر المصادقة لتفعيل الضمان.</p>
      </div>

      {/* جدول الطلبات المعلقة بانتظارك */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
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
                  <th className="p-4">رقم الصفقة</th>
                  <th className="p-4">المبلغ الإجمالي للمشتري</th>
                  <th className="p-4">إثبات الدفع</th>
                  <th className="p-4">الإجراء الحاسم</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="p-4 font-mono text-xs text-gray-400">{order.id}</td>
                    {/* حساب السعر الإجمالي شامل عمولة المنصة من المشتري (500 دج) */}
                    <td className="p-4 font-bold text-green-400">
                      {order.product_price_da + order.buyer_fee_da} دج
                    </td>
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
                      <button
                        onClick={() => handleApprove(order.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
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
