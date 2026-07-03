// تصريحات أنواع عامة لاستيرادات CSS / الخطوط الجانبية (side-effect imports)
// عشان TypeScript ميعترضش على استيراد ملفات مش .ts/.tsx زي globals.css وخط Cairo

declare module "*.css";
declare module "@fontsource-variable/cairo";
