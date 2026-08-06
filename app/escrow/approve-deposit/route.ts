import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // استقبال رقم الصفقة المراد تفعيلها من لوحة الأدمن
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'رقم الصفقة مطلوب' }, { status: 400 });
    }

    // تحديث حالة الطلب في قاعدة البيانات إلى "أموال محجوزة بأمان" لتنبيه التاجر بالتسليم
    const { data: order, error: orderError } = await supabase
      .from('escrow_orders')
      .update({ 
        status: 'funds_locked', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId)
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'تمت المصادقة بنجاح، وتجميد الأموال في الضمان!', order });
  } catch (err) {
    return NextResponse.json({ error: 'حدث خطأ غير متوقع في الخادم الخلفي' }, { status: 500 });
  }
}
