'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
        
        {/* شعار المنصة */}
        <h1 className="text-3xl font-extrabold text-blue-600 mb-2">منصة الضمان الجزائري 🇩🇿</h1>
        <p className="text-sm text-gray-500 mb-8">أفضل نظام وسيط مالي (Escrow) لبيع المنتجات الرقمية عبر بريدي موب وعملات رقمية بأمان تام.</p>

        {/* أزرار الدخول السريعة للوحات التحكم بناءً على شروطك */}
        <div className="space-y-4">
          
          {/* زر الأدمن الخاص بك */}
          <Link href="/admin/dashboard" className="block w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm text-center">
            ⚙️ الدخول بصفتي أمين المنصة (الأدمن)
          </Link>

          {/* زر التاجر */}
          <Link href="/merchant/dashboard" className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm text-center">
            💼 الدخول بصفتي تاجر (معاينة الأرباح الصافية)
          </Link>

          {/* زر المشتري */}
          <Link href="/buyer/order" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm text-center">
            🛒 الدخول بصفتي مشتري (رفع الوصل والنزاعات)
          </Link>

        </div>

        {/* أسفل الكارت */}
        <div className="border-t border-gray-100 pt-4 mt-6 text-xs text-gray-400">
          النظام محمي ومربوط بقاعدة البيانات الحية بنجاح 🛡️
        </div>
      </div>
    </div>
  );
}
