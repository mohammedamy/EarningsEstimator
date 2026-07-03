export const size = { width: 32, height: 32 };
export const contentType = "image/svg+xml";
// مطلوب صراحة مع output: "export" عشان Next يعرف إن المسار ده ثابت بالكامل
export const dynamic = "force-static";

// أيقونة ثابتة (SVG خام) بدل next/og ImageResponse:
// أخف، وبدون أي اعتماد على محرك رسم خطوط وقت البناء.
export default function Icon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f9d68" />
      <stop offset="100%" stop-color="#f5a524" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="8" fill="url(#g)" />
  <text x="16" y="22" font-family="Arial, sans-serif" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">E</text>
</svg>`;

  return new Response(svg, {
    headers: { "Content-Type": contentType },
  });
}
