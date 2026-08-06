'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

// 1. المكون الداخلي الذي يقرأ السعر والروابط ديناميكياً
function OrderContent() {
  const searchParams = useSearchParams();
  
  const orderId = searchParams.get('id') || "68c946cc-c7f8-45be-9bc0-d6ccfb3d0fb1"; 
  const queryPrice = searchParams.get('price');
  
  const productPrice = queryPrice ? parseInt(queryPrice) : 2000;

  const [proofUrl, setProofUrl] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [sending, setSending] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  const buyerFee = 500; 
  const totalAmount = productPrice + buyerFee;

  const buyerId = "11111111-1111-1111-1111-111111111111"; 

  async function handleSubmitOrder() {
    if (!proofUrl) {
      alert('الرجاء إدخال رابط صورة الوصل أولاً');
      return;
    }
    setSending(true);
    alert('✓ تم إرسال وصل بريدي موب بنجاح! بانتظار مصادقة الأدمن لتفعيل الـ Escrow.');
    setSending(false);
  }

  async function handleRaiseDispute() {
    if (!disputeReason) {
      alert('الرجاء كتابة سبب المشكلة أولاً');
      return;
    }
    setSending(true);

    const { error } = await supabase
      .from('disputes')
      .insert([{ order_id: orderId, raised_by_id: buyerId, reason: disputeReason }]);

    if (error) {
      alert('حدث خطأ: ' + error.message);
    } else {
      alert('✓ تم فتح النزاع بنجاح وإرساله للأدمن للفصل في الأموال!');
      setShowDisputeForm(false);
      setDisputeReason('');
    }
    setSending(false);
  }

  return (
    <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-md border border-gray-100 text-right">
      <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">فاتورة الشراء وتأكيد الدفع 🛒</h1>
      
      <div className="space-y-2 border-b border-gray-100 pb-4 mb-4 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>سعر المنتج الرقمي الأصلي:</span>
          <span className="font-bold text-gray-800">{productPrice} دج</span>
        </div>
        <div className="flex justify-between text-blue-600 font-medium">
          <span>رسوم عمليات المنصة والخصوصية:</span>
          <span>+{buyerFee} دج</span>
        </div>
        <div className="flex justify-between font-bold text-base text-gray-800 pt-2 border-t border-dashed">
          <span>المبلغ الإجمالي المطلوب تحويله:</span>
          <span className="text-green-600 text-lg">{totalAmount} دج</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">رابط صورة وصل تحويل بريدي موب:</label>
        <input
          type="text"
          placeholder="انسخ رابط الصورة هنا بعد رفعها"
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 text-right text-black"
        />
      </div>

      <button
        onClick={handleSubmitOrder}
        disabled={sending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm mb-4"
      >
        {sending ? 'جاري الإرسال...' : '✓ تأكيد الدفع وإرسال للأدمن'}
      </button>

      <div className="border-t border-gray-100 pt-4">
        {!showDisputeForm ? (
          <button
            onClick={() => setShowDisputeForm(true)}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 rounded-xl transition-colors text-xs"
          >
            ⚠ واجهت مشكلة؟ فتح نزاع وتقديم شكوى للأدمن
          </button>
        ) : (
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <label className="block text-xs font-bold text-red-700 mb-2">اكتب تفاصيل مشكلتك للأدمن بالتفصيل:</label>
            <textarea
              placeholder="مثال: الكود الرقمي لا يعمل أو التاجر لم يسلمني الحساب..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full p-3 border border-red-300 rounded-xl text-xs bg-white h-20 resize-none focus:outline-none text-right text-black"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleRaiseDispute}
                disabled={sending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-xs transition-colors"
              >
                إرسال الشكوى للمحكمة
              </button>
              <button
                onClick={() => setShowDisputeForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium px-3 py-2 rounded-lg text-xs transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 2. المكون الأساسي للتصدير والذي يقوم بالتغليف الآمن لمنع تعارض السيرفر
export default function BuyerOrderPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center" dir="rtl">
      <div className="w-full max-w-md mb-4 text-right">
        <a href="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors">
          ← العودة للصفحة الرئيسية للمنصة
        </a>
      </div>

      <Suspense fallback={<div className="text-center py-6 text-gray-500">جاري تحميل الفاتورة الديناميكية...</div>}>
        <OrderContent />
      </Suspense>
    </div>
  );
}
