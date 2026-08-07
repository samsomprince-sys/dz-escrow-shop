'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function MerchantAuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false); // التبديل بين الدخول وإنشاء حساب
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      alert('الرجاء ملء جميع الخانات أولاً!');
      return;
    }
    setLoading(true);

    if (isSignUp) {
      // 1. عملية إنشاء حساب تاجر جديد في السيرفر
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        alert('حدث خطأ أثناء التسجيل: ' + error.message);
      } else if (data?.user) {
        // إنشاء محفظة مالية افتراضية فارغة تلقائياً للتاجر الجديد
        await supabase.from('merchant_wallets').insert([
          { merchant_id: data.user.id, total_earned_da: 0, pending_withdrawal_da: 0 }
        ]);
        alert('✓ تم إنشاء حساب التاجر الخاص بك بنجاح! يمكنك الدخول الآن.');
        setIsSignUp(false);
      }
    } else {
      // 2. عملية تسجيل الدخول للتاجر الحالي
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        alert('خطأ في تسجيل الدخول: ' + error.message);
      } else if (data?.user) {
        alert('✓ مرحباً بك مجدداً! تم فك قفل لوحة التحكم الخاصة بك.');
        router.push('/merchant/dashboard'); // الانتقال الفوري للوحة التحكم
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6" dir="rtl">
      {/* زر العودة للرئيسية */}
      <div className="w-full max-w-md mb-4 text-right">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-green-500 transition-colors">
          ← العودة للمتجر الرئيسي
        </Link>
      </div>

      <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl border border-slate-800 text-right shadow-2xl">
        <div className="text-center mb-6">
          <span className="text-4xl">💼</span>
          <h1 className="text-2xl font-bold text-white mt-2">
            {isSignUp ? 'بوابة انضمام التجار الجدد' : 'تسجيل دخول التجار'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isSignUp ? 'أنشئ حسابك وابدأ في عرض سلعك الرقمية بأمان' : 'أدخل بياناتك السرية لإدارة مبيعاتك وأرباحك الصافية'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {/* خانة البريد الإلكتروني */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">البريد الإلكتروني للتاجر:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-green-500 text-left font-mono"
              placeholder="merchant@example.com"
              required
            />
          </div>

          {/* خانة كلمة المرور */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">كلمة المرور السرية:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-green-500 text-left"
              placeholder="••••••••••••"
              required
            />
          </div>

          {/* زر الإرسال الديناميكي */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm mt-2"
          >
            {loading ? 'جاري معالجة الطلب في السيرفر...' : isSignUp ? '🚀 تسجيل حساب تاجر جديد' : '🔓 دخول لوحة التحكم'}
          </button>
        </form>

        {/* زر التبديل الذكي بين الدخول والتسجيل */}
        <div className="mt-6 text-center border-t border-slate-850 pt-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-slate-400 hover:text-white underline transition-colors"
          >
            {isSignUp ? 'امتلك حساباً بالفعل؟ سجل دخولك من هنا' : 'لا تملك حساب تاجر؟ اضغط هنا للانضمام للمنصة مجاناً'}
          </button>
        </div>
      </div>
    </div>
  );
}
