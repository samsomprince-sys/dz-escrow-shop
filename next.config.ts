import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* هنا تضع إعدادات مشروعك السابقة وتجاوز الفحص مؤقتاً */
  images: {
    unoptimized: true, // هذا السطر يفرض على فيرسيل قراءة وعرض أي صورة داخل مجلد public فوراً دون حجبها
  },
};

export default nextConfig;
