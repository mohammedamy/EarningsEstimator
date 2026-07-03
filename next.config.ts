import type { NextConfig } from "next";

// عند البناء داخل GitHub Actions لنشر الموقع على GitHub Pages، بيتم تمرير
// اسم الريبو تلقائياً كـ basePath (لأن GitHub Pages بيستضيف صفحات المشاريع
// على username.github.io/repo-name/ مش على الجذر مباشرة).
// محلياً (npm run dev / npm run build) الموقع بيشتغل عادي من غير أي basePath.
const basePath = process.env.NEXT_BASE_PATH || "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // نشغّل الفحص محلياً عبر npm run lint، ونمنع تعطيل الـ build بسبب اختلافات إصدار flat-config
    ignoreDuringBuilds: true,
  },
  // تصدير الموقع كملفات HTML/CSS/JS ثابتة بالكامل (بدون سيرفر Node)
  // ده ممكن لأن Earnly تطبيق كامل من جهة العميل (client-side) من غير API routes
  // أو Server Actions أو بيانات ديناميكية وقت الطلب.
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  ...(basePath
    ? {
        basePath,
        assetPrefix: `${basePath}/`,
      }
    : {}),
};

export default nextConfig;
