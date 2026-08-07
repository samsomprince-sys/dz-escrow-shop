'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// 1. المكون الداخلي الذي يدير البيانات والأزرار التفاعلية
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

  // دالة تأكيد الدفع لرفع الوصل للأدمن
  async function handleSubmitOrder() {
    if (!proofUrl) {
      alert('الرجاء إدخال رابط صورة الوصل أولاً');
      return;
    }
    setSending(true);
    
    const { error } = await supabase
      .from('escrow_orders')
      .update({ 
        status: 'waiting_admin_deposit_approval',
        payment_proof_url: proofUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    setSending(false);

    if (error) {
      alert('حدث خطأ أثناء إرسال الوصل: ' + error.message);
    } else {
      alert('✓ تم تأكيد الدفع وإرسال وصل بريدي موب بنجاح! بانتظار مصادقة الأدمن لتفعيل الـ Escrow وتجميد الأموال.');
    }
  }

  // دالة فتح النزاع وإرسال الشكوى الحية للمحكمة
  async function handleRaiseDispute() {
    if (!disputeReason) {
      alert('الرجاء كتابة سبب المشكلة بالتفصيل أولاً');
      return;
    }
    setSending(true);

    const { error } = await supabase
      .from('disputes')
      .insert([{ 
        order_id: orderId, 
        raised_by_id: buyerId, 
        reason: disputeReason 
      }]);

    setSending(false);

    if (error) {
      alert('حدث خطأ أثناء إرسال الشكوى: ' + error.message);
    } else {
      alert('✓ تم فتح النزاع بنجاح وإرساله لمحكمة المنصة! الأدمن سيفصل في الأموال ويراجع القضية الآن.');
      setShowDisputeForm(false);
      setDisputeReason('');
    }
  }

  return (
    <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-800 text-right">
      <h1 className="text-xl font-bold text-white mb-4 text-center">فاتورة الشراء وتأكيد الدفع 🛒</h1>
      
      {/* تفاصيل السعر */}
      <div className="space-y-2 border-b border-slate-800 pb-4 mb-4 text-sm text-slate-400">
        <div className="flex justify-between">
          <span>سعر المنتج الرقمي الأصلي:</span>
          <span className="font-bold text-white">{productPrice} دج</span>
        </div>
        <div className="flex justify-between text-blue-400 font-medium">
          <span>رسوم عمليات المنصة والخصوصية:</span>
          <span>+{buyerFee} دج</span>
        </div>
        <div className="flex justify-between font-bold text-base text-white pt-2 border-t border-slate-800 border-dashed">
          <span>المبلغ الإجمالي المطلوب تحويله:</span>
          <span className="text-green-400 text-lg">{totalAmount} دج</span>
        </div>
      </div>

      {/* معلومات تحويل بريدي موب */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 mb-4 text-center">
        <p className="text-xs text-amber-400 font-bold mb-2">📋 معلومات تحويل بريدي موب:</p>
        <p className="text-sm text-slate-300">الحساب التابع للمنصة RIP:</p>
        <p className="text-base font-mono font-bold text-white bg-slate-900 p-2 rounded-lg mt-1 select-all">00799999002478845197</p>
      </div>

      {/* خانة إدخال رابط الوصل */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-300 mb-2">رابط صورة وصل تحويل بريدي موب:</label>
        <input
          type="text"
          placeholder="ضع رابط الصورة هنا بعد رفعها"
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-right text-white"
        />
      </div>

      {/* زر تأكيد الدفع المربوط بالدالة الحية */}
      <button
        onClick={handleSubmitOrder}
        disabled={sending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm mb-4"
      >
        {sending ? 'جاري معالجة وإرسال البيانات...' : '✓ تأكيد الدفع وإرسال للأدمن'}
      </button>

      {/* نظام النزاعات والشكاوى */}
      <div className="border-t border-slate-800 pt-4">
        {!showDisputeForm ? (
          <button
            onClick={() => setShowDisputeForm(true)}
            className="w-full bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-900/30 font-semibold py-2 rounded-xl transition-colors text-xs"
          >
            ⚠ واجهت مشكلة؟ فتح نزاع وتقديم شكوى للأدمن
          </button>
        ) : (
          <div className="bg-red-950/20 p-4 rounded-xl border border-red-900/30 mt-2">
            <label className="block text-xs font-bold text-red-400 mb-2">اكتب تفاصيل مشكلتك للأدمن بالتفصيل:</label>
            <textarea
              placeholder="مثال: الكود الرقمي لا يعمل أو التاجر لم يسلمني الحساب..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white h-20 shortcut resize-none focus:outline-none text-right"
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
                type="button"
                onClick={() => setShowDisputeForm(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-3 py-2 rounded-lg text-xs transition-colors"
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

// 2. المكون الأساسي للتصدير والتغليف الأمن
export default function BuyerOrderPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center" dir="rtl">
      <div className="w-full max-w-md mb-4 text-right">
        <a href="/" className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-blue-500 transition-colors">
          ← العودة للصفحة الرئيسية للمنصة
        </a>
      </div>

      <Suspense fallback={<div className="text-center py-6 text-slate-400">جاري تحميل الفاتورة المؤمنة...</div>}>
        <OrderContent />
      </Suspense>
    </div>
  );
}
