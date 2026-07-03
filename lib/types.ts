// أنواع بيانات أساسية يستخدمها التطبيق بالكامل

export type Platform = "youtube" | "instagram" | "tiktok" | "facebook" | "x";

export type FieldType = "number" | "select";

export interface SelectOption {
  value: string;
  label: string;
}

/** تعريف حقل واحد داخل الفورم الديناميكي */
export interface FieldConfig {
  /** اسم الحقل (يُستخدم كمفتاح في كائن القيم) */
  name: string;
  /** التسمية المعروضة بالعربية */
  label: string;
  type: FieldType;
  placeholder?: string;
  /** نص مساعد صغير أسفل الحقل */
  helperText?: string;
  min?: number;
  max?: number;
  /** وحدة القياس المعروضة (مشاهدة، متابع...) */
  unit?: string;
  options?: SelectOption[];
}

/** بيانات وصفية عن كل منصة + حقول الفورم الخاصة بها */
export interface PlatformMeta {
  id: Platform;
  name: string;
  tagline: string;
  /** لون العلامة التجارية للمنصة (يستخدم في التدرجات والحدود) */
  brandColor: string;
  fields: FieldConfig[];
}

/** قيم الفورم المُدخلة من المستخدم */
export type FormValues = Record<string, string>;

export interface EarningsBreakdownItem {
  label: string;
  monthlyMin: number;
  monthlyMax: number;
  description: string;
}

export interface EligibilityInfo {
  eligible: boolean;
  message: string;
}

export interface EarningsResult {
  platform: Platform;
  daily: { min: number; max: number };
  monthly: { min: number; max: number };
  yearly: { min: number; max: number };
  breakdown: EarningsBreakdownItem[];
  /** خطوات الشرح: كيف تم احتساب الرقم */
  explanation: string[];
  /** نصائح مخصصة بناءً على أرقام المستخدم */
  tips: string[];
  eligibility?: EligibilityInfo;
  engagementRate?: number;
  performanceLabel?: string;
}
