import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'رقم الصفقة مطلوب' }, { status: 400 });
    }

    // 1. جلب بيانات الصفقة من السيرفر لمعرفة سعر المنتج وهوية التاجر
    const { data: order } = await supabase
      .from('escrow_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'الصفقة غير موجودة' }, { status: 404 });
    }

    // تطبيق شرطك الصارم: حساب صافي أرباح التاجر (سعر المنتج - 500 دج عمولة المنصة)
    const merchantNetEarnings = order.product_price_da - order.merchant_fee_da;

    // 2. تحديث حالة الصفقة إلى مكتملة بنجاح (completed)
    await supabase
      .from('escrow_orders')
      .update({ 
        status: 'completed', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId);

    // 3. جلب الرصيد الافتراضي الحالي للتاجر لتحديثه
    const { data: wallet } = await supabase
      .from('merchant_wallets')
      .select('total_earned_da')
      .eq('merchant_id', order.merchant_id)
      .single();

    const currentBalance = wallet ? wallet.total_earned_da : 0;
    
    // إضافة المكتسبات الصافية الجديدة إلى رصيد التاجر القديم
    const newBalance = currentBalance + merchantNetEarnings;

    // 4. حفظ وتحديث المحفظة الافتراضية للتاجر في قاعدة البيانات
    await supabase
      .from('merchant_wallets')
      .upsert({ 
        merchant_id: order.merchant_id, 
        total_earned_da: newBalance, 
        last_payout_at: new Date().toISOString() 
      });

    return NextResponse.json({ message: 'تم ترحيل المكتسبات الافتراضية الصافية لحساب التاجر بنجاح!' });
  } catch (err) {
    return NextResponse.json({ error: 'حدث خطأ أثناء ترحيل أرباح التاجر' }, { status: 500 });
  }
}
