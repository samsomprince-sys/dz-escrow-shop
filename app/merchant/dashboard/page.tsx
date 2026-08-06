'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// تعريف شكل البيانات القادمة من قاعدة البيانات
interface WalletData {
  total_earned_da: number;
  pending_withdrawal_da: number;
}

export default function MerchantDashboard() {
  // رصيد افتراضي مؤقت حتى يتم جلب البيانات الحقيقية من السيرفر
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  // معرف التاجر التجريبي (سنربطه بنظام تسجيل الدخول لاحقاً)
  const merchantId = "ضع_هنا_رقم_التاجر_لاحقا"; 

  useEffect(() => {
        async function fetchWalletData() {
      // جلب البيانات بدون اشتراط وجود سطر مسبق لمنع الأخطاء الحمراء
      const { data, error } = await supabase
        .from('merchant_wallets')
        .select('total_earned_da, pending_withdrawal_da');

      // إذا وجدنا بيانات التاجر نقوم بوضعها، وإذا كان الجدول فارغاً نتركها صفر
      if (data && data.length > 0) {
        setWallet(data[0]);
      } else {
        setWallet({ total_earned_da: 0, pending_withdrawal_da: 0 });
      }
      setLoading(false);
    }


    fetchWalletData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">جاري تحميل حساباتك الصافية...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dir-rtl" dir="rtl">
      {/* رأس الصفحة */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">لوحة تحكم التاجر المالي</h1>
        <p className="text-sm text-gray-500 mt-1">مرحباً بك! هنا تظهر مستحقاتك الصافية بعد خصم عمولة المنصة التلقائية (500 دج).</p>
      </div>

      {/* بطاقات عرض الرصيد الافتراضي بناءً على شرطك */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* الرصيد المكتسب الصافي */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-md text-white">
          <p className="text-sm opacity-90 font-medium">إجمالي المكتسبات الافتراضية المستحقة</p>
          <p className="text-4xl font-extrabold mt-2">{wallet?.total_earned_da || 0} دج</p>
          <p className="text-xs opacity-75 mt-4">* هذه القيمة صافية تماماً وسترسل لك عبر بريدي موب عند التسوية.</p>
        </div>

        {/* المبالغ قيد التحويل اليدوي */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">مبالغ قيد المعالجة (بريدي موب)</p>
          <p className="text-4xl font-bold text-gray-700 mt-2">{wallet?.pending_withdrawal_da || 0} دج</p>
          <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mt-4 inline-block">
            بانتظار قيام الإدارة بتحويل المبلغ إلى حسابك الـ CCP.
          </p>
        </div>
      </div>
    </div>
  );
}
