'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

function OrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get('id') || "68c946cc-c7f8-45be-9bc0-d6ccfb3d0fb1"; 
  const queryPrice = searchParams.get('price');
  const productPrice = queryPrice ? parseInt(queryPrice) : 2000;

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [sending, setSending] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const buyerFee = 500; 
  const totalAmount = productPrice + buyerFee;

  // 🛡️ فحص إجبارية الحساب للمشتري
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('🔒 عذراً، يجب عليك تسجيل الدخول أو إنشاء حساب أولاً لتتمكن من الشراء وتفعيل الضمان المالي!');
        router.push('/merchant/auth'); // تحويل المشتري لصفحة التسجيل الموحدة
      } else {
        setCheckingAuth(false);
      }
    }
    checkUser();
  }, [router]);

  async function handleSubmitOrder() {
    if (!proofFile) {
      alert('الرجاء إرفاق صورة وصل تحويل بريدي موب أولاً من جهازك!');
      return;
    }
    setSending(true);
    try {
      const fileExtension = proofFile.name.split('.').pop();
      const fileName = `proof-${Date.now()}.${fileExtension}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, proofFile);

      if (uploadError) throw new Error('فشل رفع صورة الوصل: ' + uploadError.message);

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      const { data: { session } } = await supabase.auth.getSession();

      const { error: updateError } = await supabase
        .from('escrow_orders')
        .update({ 
          status: 'waiting_admin_deposit_approval',
          payment_proof_url: publicUrlData.publicUrl,
          buyer_id: session?.user.id, // ربط الطلب بمعرّف المشتري الحقيقي المسجل
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw new Error(updateError.message);
      alert('✓ تم رفع الوصل بنجاح! بانتظار مصادقة الأدمن لحجز الأموال.');
      setProofFile(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleRaiseDispute() {
    if (!disputeReason) {
      alert('الرجاء كتابة سبب المشكلة بالتفصيل أولاً');
      return;
    }
    setSending(true);
    const { data: { session } } = await supabase.auth.getSession();

    const { error } = await supabase
      .from('disputes')
      .insert([{ 
        order_id: orderId, 
        raised_by_id: session?.user.id, // ربط النزاع بصاحب الحساب المشتكي
        reason: disputeReason 
      }]);

    setSending(false);
    if (error) {
      alert('حدث خطأ: ' + error.message);
    } else {
      alert('✓ تم فتح النزاع بنجاح وإرساله للمحكمة!');
      setShowDisputeForm(false);
      setDisputeReason('');
    }
  }

  if (checkingAuth) {
    return <div className="text-center py-12 text-slate-400">جاري فحص صلاحيات الأمان والولوج...</div>;
  }

  return (
    <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-800 text-right">
      <h1 className="text-xl font-bold text-white mb-4 text-center">فاتورة الشراء وتأكيد الدفع 🛒</h1>
      
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

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 mb-4 text-center">
        <p className="text-xs text-amber-400 font-bold mb-2">📋 معلومات تحويل بريدي موب:</p>
        <p className="text-sm text-slate-300">الحساب التابع للمنصة RIP:</p>
        <p className="text-base font-mono font-bold text-white bg-slate-900 p-2 rounded-lg mt-1 select-all">00799999002478845197</p>
      </div>

      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-300 mb-2">إرفاق صورة وصل الدفع (بريدي موب):</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setProofFile(e.target.files[0]);
            }
          }}
          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 text-right file:ml-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-blue-200 hover:file:bg-blue-800 cursor-pointer"
        />
        {proofFile && (
          <p className="text-[11px] text-green-400 mt-1 font-medium">✓ تم إرفاق الملف وجاهز للرفع: {proofFile.name}</p>
        )}
      </div>

      <button
        onClick={handleSubmitOrder}
        disabled={sending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm mb-4"
      >
        {sending ? 'جاري معالجة ورفع صورة الوصل...' : '✓ تأكيد الدفع وإرسال للأدمن'}
      </button>

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
