# Earnly — حاسبة أرباح صنّاع المحتوى

موقع Next.js 15 كامل (App Router + TypeScript + Tailwind CSS + Shadcn/ui) لحساب تقدير الأرباح المتوقعة من يوتيوب، إنستجرام، تيك توك، فيسبوك، وإكس. واجهة عربية بالكامل (RTL) مع دعم Dark/Light Mode.

## التشغيل محلياً

المتطلبات: Node.js 20 أو أحدث.

```bash
cd earnly
npm install
npm run dev
```

افتح http://localhost:3000

## البناء للإنتاج

المشروع مُعدّ كموقع ثابت بالكامل (Static Export) عشان يشتغل على GitHub Pages من غير أي سيرفر Node:

```bash
npm run build
```

هيطلع كل الموقع كملفات HTML/CSS/JS جاهزة داخل فولدر `out/`. لمعاينته محلياً:

```bash
npx serve out
```

## النشر على GitHub Pages

الريبو فيه Workflow جاهز (`.github/workflows/deploy.yml`) بينشر الموقع تلقائياً على GitHub Pages مع كل push على branch `main`. الخطوات:

1. **ارفع الكود على GitHub** (من داخل فولدر `earnly`):

   ```bash
   git init
   git add .
   git commit -m "Initial commit: Earnly"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```

   استبدل `<username>` و`<repo-name>` باسم حسابك واسم الريبو اللي هتنشئه على github.com (كـ Empty repository، من غير README أو .gitignore عشان ميحصلش تعارض).

2. **فعّل GitHub Pages**: من صفحة الريبو على GitHub، روح لـ **Settings → Pages**، وفي **Build and deployment → Source** اختار **GitHub Actions**.

3. أي push جديد على `main` هيشغّل الـ Workflow تلقائياً ويبني وينشر الموقع. تقدر تتابع التقدم من تبويب **Actions**. بعد ما يخلص، هيظهر رابط الموقع في نفس الصفحة (Settings → Pages) وعادةً بيكون بالشكل:

   ```
   https://<username>.github.io/<repo-name>/
   ```

   (أو `https://<username>.github.io/` مباشرة لو سميت الريبو بالظبط `<username>.github.io`)

الـ Workflow بيحدد الـ `basePath` الصحيح تلقائياً حسب اسم الريبو، فمش محتاج تعدّل أي حاجة يدوياً في الكود.

## بنية المشروع

- `app/page.tsx` — الصفحة الرئيسية: اختيار المنصة + الفورم الديناميكي + عرض النتيجة (الملف الأساسي المطلوب)
- `app/layout.tsx` — القالب العام (RTL، خط Cairo مستضاف ذاتياً، Dark/Light mode عبر next-themes)
- `app/globals.css` — نظام الألوان الكامل (Light/Dark) وتوكنز Tailwind v4
- `lib/calculations.ts` — محرك حساب الأرباح لكل منصة (معادلات واقعية + شرح خطوة بخطوة + نصائح مخصصة)
- `lib/platform-config.ts` — تعريف حقول الفورم الخاصة بكل منصة
- `lib/schema.ts` — التحقق من صحة المدخلات (Zod) لكل منصة ديناميكياً
- `lib/types.ts` — الأنواع المشتركة
- `components/platform-selector.tsx` — شبكة اختيار المنصة بالأيقونات
- `components/dynamic-form.tsx` — الفورم الديناميكي (React Hook Form + Zod)
- `components/results-card.tsx` — كارت النتيجة (تبويبات يومي/شهري/سنوي + تفصيل + نصائح)
- `components/icons.tsx` — أيقونات المنصات (SVG مخصص مطابق للهوية البصرية الحقيقية)
- `components/ui/` — مكونات Shadcn/ui الأساسية (button, card, select, tabs, accordion...)

## منهجية الحساب (لكل منصة)

كل تقدير أرباح = **دخل مباشر من المنصة** (إعلانات/برنامج مكافآت، حسب الشروط الفعلية لكل منصة) + **تقدير دخل رعايات وتعاونات مدفوعة** (بناءً على حجم الحساب ومعدل التفاعل). الأرقام تقديرية ومبنية على متوسطات صناعية عامة (منشورة علناً وتتغير بمرور الوقت)، وليست ضماناً لدخل فعلي. كل النتائج تُعرض كمدى (من - إلى) وليس رقم واحد وهمي الدقة، مع شرح واضح لكل خطوة حساب داخل الكارت نفسه.

## التخصيص

- الألوان والخطوط: `app/globals.css`
- إضافة منصة جديدة: أضف تعريفها في `lib/platform-config.ts` ثم أضف دالة حساب مقابلة في `lib/calculations.ts`
- تعديل معدلات RPM / أسعار الرعايات: كل القيم موجودة بشكل صريح في أعلى كل دالة حساب داخل `lib/calculations.ts` لسهولة التحديث الدوري.

## ملاحظة تقنية

المشروع يستخدم Next.js 15.5 + React 19 + Tailwind CSS v4 + Zod v4، ومُعدّ بـ `output: "export"` (تصدير ثابت بالكامل) عشان يشتغل على GitHub Pages من غير سيرفر Node. تم فحص المشروع بالكامل (`tsc --noEmit` و`next build`) وتأكيد أنه يبني وينتج صفحات ثابتة بنجاح، بما فيها مسار الأيقونة.

لو حبيت ترجع تشغّله كتطبيق Next.js عادي بسيرفر (SSR/API routes مستقبلاً)، شيل `output: "export"` و`trailingSlash` و`images.unoptimized` من `next.config.ts`، وارجع لـ `npm run start` بعد `next build`.
