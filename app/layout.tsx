import type { Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// خط Cairo مستضاف ذاتياً (Self-hosted) بدل next/font/google:
// أسرع تحميلاً، من غير أي اتصال خارجي وقت البناء أو التصفح، وأفضل للخصوصية
import "@fontsource-variable/cairo";
import "./globals.css";

export const metadata: Metadata = {
  title: "Earnly — احسب أرباحك المتوقعة من السوشيال ميديا",
  description:
    "أدخل إحصائيات حسابك على يوتيوب أو إنستجرام أو تيك توك أو فيسبوك أو إكس، واحصل على تقدير واقعي لأرباحك اليومية والشهرية والسنوية مع نصائح مخصصة لزيادة دخلك.",
  keywords: [
    "أرباح يوتيوب",
    "حاسبة أرباح السوشيال ميديا",
    "أرباح تيك توك",
    "أرباح إنستجرام",
    "Earnly",
  ],
  openGraph: {
    title: "Earnly — احسب أرباحك المتوقعة من السوشيال ميديا",
    description:
      "تقدير واقعي لأرباح صنّاع المحتوى على يوتيوب، إنستجرام، تيك توك، فيسبوك وإكس.",
    locale: "ar_EG",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
