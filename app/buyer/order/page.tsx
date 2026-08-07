"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function BuyerOrderPage() {
  const searchParams = useSearchParams();
  // قراءة السعر ديناميكياً وتأمين الحساب المادي
  const basePrice = Number(searchParams.get("price")) || 0;
  const platformFee = 500;
  const totalPrice = basePrice + platformFee;

  // الحالات الافتراضية للتحكم بالواجهة (بريدي موب هو الافتراضي)
  const [paymentMethod, setPaymentMethod] = useState<"baridimob" | "crypto">("baridimob");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // دالة معالجة ورفع صورة الوصل/الإثبات يدوياً
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // توليد معاينة فورية للمشتري لراحة المستخدم
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);

    try {
      // هنا تضع كود الرفع الخاص بك إلى الـ Bucket (product-images أو bucket مخصص للإيصالات)
      // مثال: const { data, error } = await supabase.storage.from('receipts').upload(newName, file);
      console.log("يتم الآن رفع الملف إلى سوبابيز...", file.name);
    } catch (err) {
      console.error("خطأ أثناء الرفع:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        
        {/* رابط العودة */}
        <button className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition">
          ← العودة للصفحة الرئيسية للمنصة
        </button>

        {/* عنوان الفاتورة */}
        <h2 className="text-xl font-bold text-center flex items-center justify-center gap-2">
          🛒 فاتورة الشراء وتأكيد الدفع
        </h2>

        {/* تفاصيل الحساب المالي المدمج */}
        <div className="bg-slate-950 p-4 rounded-xl space-y-3 border border-slate-800">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">سعر المنتج الرقمي الأصلي:</span>
            <span className="font-semibold">{basePrice} دج</span>
          </div>
          <div className="flex justify-between text-sm text-blue-400">
            <span>رسوم عمليات المنصة والخصوصية:</span>
            <span>+{platformFee} دج</span>
          </div>
          <hr className="border-slate-800" />
          <div className="flex justify-between items-center text-lg font-bold text-green-400">
            <span>المبلغ الإجمالي المطلوب تحويله:</span>
            <span>{totalPrice} دج</span>
          </div>
        </div>

        {/* الشرط الأول: أداة اختيار طريقة الدفع الذكية */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400 font-medium block">اختر طريقة الدفع المناسبة:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("baridimob")}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                paymentMethod === "baridimob"
                  ? "border-blue-500 bg-blue-500/10 text-white"
                  : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
              }`}
            >
              <span className="text-xl">💳</span>
              <span className="text-sm font-semibold">بريدي موب</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("crypto")}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                paymentMethod === "crypto"
                  ? "border-yellow-500 bg-yellow-500/10 text-white"
                  : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
              }`}
            >
              <span className="text-xl">🪙</span>
              <span className="text-sm font-semibold">عملة رقمية (USDT)</span>
            </button>
          </div>
        </div>

        {/* التعليمات الديناميكية بناءً على اختيار الدفع */}
        {paymentMethod === "baridimob" ? (
          <div className="bg-blue-950/20 border border-blue-900/50 p-4 rounded-xl text-xs space-y-1 text-slate-300">
            <p className="font-semibold text-blue-400">📌 معلومات تحويل بريدي موب:</p>
            <p>يرجى تحويل المبلغ إلى الـ RIP الخاص بالتاجر، ثم إرفاق صورة الوصل الرسمية بالأسفل.</p>
          </div>
        ) : (
          <div className="bg-yellow-950/20 border border-yellow-900/50 p-4 rounded-xl text-xs space-y-1 text-slate-300">
            <p className="font-semibold text-yellow-400">📌 معلومات الدفع بالعملات الرقمية:</p>
            <p>شبكة التحويل: <span className="text-white font-mono">TRC-20</span></p>
            <p>يرجى تصوير لقطة الشاشة (Screenshot) لنجاح عملية التحويل التي تشمل رقم المعاملة (TXID).</p>
          </div>
        )}

        {/* الشرط الثاني: إرفاق صورة يدوياً بدلاً من الرابط النصي */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400 font-medium block">
            {paymentMethod === "baridimob" ? "📸 إرفاق صورة وصل تحويل بريدي موب:" : "📸 إرفاق إثبات تحويل العملة الرقمية:"}
          </label>
          
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl p-4 bg-slate-950 hover:border-slate-700 transition relative group cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={uploading}
            />
            
            {previewUrl ? (
              <div className="w-full flex flex-col items-center space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="max-h-32 object-contain rounded-lg border border-slate-800" />
                <span className="text-xs text-green-400">✓ تم اختيار الصورة بنجاح {uploading && "(جاري الرفع...)"}</span>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <span className="text-2xl text-slate-500 group-hover:text-slate-400">📁</span>
                <p className="text-xs text-slate-400">اضغط هنا لاختيار أو التقاط صورة الإثبات يدوياً</p>
                <p className="text-[10px] text-slate-600">يدعم صيغ JPG, PNG, WEBP</p>
              </div>
            )}
          </div>
        </div>

        {/* زر الإجراء الرئيسي المعزز */}
        <button
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 font-semibold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10"
        >
          <span>✓</span> تأكيد الدفع وإرسال للإدمن
        </button>

        {/* فتح نزاع */}
        <button className="w-full text-center text-xs text-red-400 hover:text-red-300 font-medium transition pt-2">
          ⚠️ واجهت مشكلة؟ فتح نزاع وتقديم شكوى للأدمن
        </button>

      </div>
    </div>
  );
}
