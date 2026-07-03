import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * دمج أصناف Tailwind بذكاء مع حل التعارضات
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * تنسيق رقم صحيح بفواصل الآلاف (أرقام إنجليزية دائماً لسهولة القراءة)
 */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

/**
 * تنسيق رقم مختصر مثل 1.2K أو 3.4M
 */
export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * تنسيق قيمة مالية بالدولار
 */
export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "$0";
  const maximumFractionDigits = value < 50 ? 2 : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  }).format(value);
}

/**
 * تحويل مدخل نصي/رقمي إلى رقم آمن (يمنع NaN وينع القيم السالبة)
 */
export function toSafeNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "string" ? parseFloat(value) : Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

/**
 * تأخير بسيط يستخدم لمحاكاة زمن معالجة لطيف قبل ظهور النتيجة
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
