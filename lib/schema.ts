import { z } from "zod";

import { PLATFORMS } from "./platform-config";
import type { Platform } from "./types";

/**
 * يبني سكيمة Zod ديناميكياً بناءً على حقول المنصة المختارة،
 * بحيث كل منصة عندها قواعد تحقق مختلفة حسب حقولها.
 */
export function buildPlatformSchema(platform: Platform) {
  const meta = PLATFORMS[platform];
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of meta.fields) {
    if (field.type === "select") {
      shape[field.name] = z.string().min(1, "من فضلك اختر قيمة");
    } else {
      const min = field.min ?? 0;
      const max = field.max ?? 1_000_000_000;
      shape[field.name] = z.coerce
        .number()
        .min(min, `القيمة لازم تكون ${min} أو أكثر`)
        .max(max, "الرقم أكبر من المتوقع، تأكد من القيمة المدخلة");
    }
  }

  return z.object(shape);
}
