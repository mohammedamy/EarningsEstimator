import type {
  EarningsBreakdownItem,
  EarningsResult,
  FormValues,
  Platform,
} from "./types";
import { formatNumber, toSafeNumber } from "./utils";

/* ------------------------------------------------------------------ */
/*  أدوات مساعدة عامة للمحرك الحسابي                                    */
/* ------------------------------------------------------------------ */

/** يرجع قيمة من جدول شرائح (tiers) بناءً على أقرب حد أدنى أقل من أو يساوي value */
function tierValue<T>(
  value: number,
  tiers: { threshold: number; result: T }[],
): T {
  let result = tiers[0].result;
  for (const t of tiers) {
    if (value >= t.threshold) result = t.result;
  }
  return result;
}

function num(values: FormValues, key: string): number {
  return toSafeNumber(values[key], 0);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

interface MonthlyRange {
  min: number;
  max: number;
}

function buildResult(
  platform: Platform,
  monthly: MonthlyRange,
  breakdown: EarningsBreakdownItem[],
  explanation: string[],
  tips: string[],
  extra?: Partial<
    Pick<EarningsResult, "eligibility" | "engagementRate" | "performanceLabel">
  >,
): EarningsResult {
  const monthlyMin = Math.max(0, round2(monthly.min));
  const monthlyMax = Math.max(monthlyMin, round2(monthly.max));
  return {
    platform,
    daily: { min: round2(monthlyMin / 30), max: round2(monthlyMax / 30) },
    monthly: { min: monthlyMin, max: monthlyMax },
    yearly: { min: round2(monthlyMin * 12), max: round2(monthlyMax * 12) },
    breakdown,
    explanation,
    tips,
    ...extra,
  };
}

/* ------------------------------------------------------------------ */
/*  يوتيوب                                                              */
/* ------------------------------------------------------------------ */

// معدل RPM (عائد الإعلانات الصافي للصانع لكل 1000 مشاهدة، بعد خصم حصة يوتيوب ~45%)
const YOUTUBE_NICHE_RPM: Record<string, [number, number]> = {
  finance: [9, 26],
  tech: [7, 16],
  education: [5, 12],
  gaming: [2, 5],
  entertainment: [2, 6],
  beauty: [4, 9],
  lifestyle: [2, 5],
  food: [3, 7],
  fitness: [3, 7],
  travel: [3, 8],
  news: [3, 8],
  other: [2, 6],
};

const YOUTUBE_NICHE_LABELS: Record<string, string> = {
  finance: "المال والاستثمار",
  tech: "التقنية والبرمجة",
  education: "التعليم",
  gaming: "الألعاب",
  entertainment: "الترفيه",
  beauty: "الجمال والموضة",
  lifestyle: "لايف ستايل",
  food: "الطبخ والطعام",
  fitness: "اللياقة والصحة",
  travel: "السفر",
  news: "الأخبار والمجتمع",
  other: "المجال العام",
};

function calculateYouTube(values: FormValues): EarningsResult {
  const subscribers = num(values, "subscribers");
  const avgViews = num(values, "avgViews30d");
  const videosPerMonth = num(values, "videosPerMonth");
  const niche = values.niche || "other";

  const [rpmMin, rpmMax] = YOUTUBE_NICHE_RPM[niche] ?? YOUTUBE_NICHE_RPM.other;
  const nicheLabel = YOUTUBE_NICHE_LABELS[niche] ?? YOUTUBE_NICHE_LABELS.other;

  const monthlyViews = avgViews * videosPerMonth;
  const adRevenueMin = (monthlyViews / 1000) * rpmMin;
  const adRevenueMax = (monthlyViews / 1000) * rpmMax;

  // برنامج شركاء يوتيوب (تبسيط: 1000 مشترك كحد أدنى معلن، والشرط الكامل يشمل أيضاً ساعات مشاهدة/شورتس)
  const eligible = subscribers >= 1000;

  // تقدير دخل الرعايات والتعاونات المدفوعة بناءً على متوسط المشاهدات (أدق من عدد المشتركين فقط)
  const [dealsMin, dealsMax] = tierValue(subscribers, [
    { threshold: 0, result: [0, 0] as [number, number] },
    { threshold: 1000, result: [0, 1] as [number, number] },
    { threshold: 10000, result: [1, 2] as [number, number] },
    { threshold: 100000, result: [2, 4] as [number, number] },
    { threshold: 1000000, result: [3, 6] as [number, number] },
  ]);
  const perDealMin = (avgViews / 1000) * 4;
  const perDealMax = (avgViews / 1000) * 15;
  const sponsorMin = perDealMin * dealsMin;
  const sponsorMax = perDealMax * dealsMax;

  const monthly: MonthlyRange = {
    min: adRevenueMin + sponsorMin,
    max: adRevenueMax + sponsorMax,
  };

  const breakdown: EarningsBreakdownItem[] = [
    {
      label: "أرباح إعلانات يوتيوب (YPP)",
      monthlyMin: round2(adRevenueMin),
      monthlyMax: round2(adRevenueMax),
      description: `${formatNumber(monthlyViews)} مشاهدة شهرياً × معدل RPM من $${rpmMin} إلى $${rpmMax} لكل 1000 مشاهدة في مجال "${nicheLabel}"`,
    },
    {
      label: "رعايات وتعاونات مدفوعة (تقديري)",
      monthlyMin: round2(sponsorMin),
      monthlyMax: round2(sponsorMax),
      description:
        dealsMax > 0
          ? `تقدير ${dealsMin}-${dealsMax} تعاون شهرياً بسعر $${Math.round(perDealMin)}-$${Math.round(perDealMax)} للتعاون الواحد`
          : "حجم القناة الحالي لسه صغير على جذب رعايات ثابتة",
    },
  ];

  const explanation = [
    `مشاهدات الشهر = متوسط مشاهدات الفيديو (${formatNumber(avgViews)}) × عدد الفيديوهات الشهرية (${videosPerMonth}) = ${formatNumber(monthlyViews)} مشاهدة`,
    `طبّقنا معدل RPM الخاص بمجال "${nicheLabel}" وهو $${rpmMin}-$${rpmMax} لكل 1000 مشاهدة (ده صافي نصيبك بعد خصم يوتيوب 45%)`,
    `أضفنا تقدير دخل الرعايات بناءً على متوسط المشاهدات وحجم القناة (${formatNumber(subscribers)} مشترك)`,
    "الإجمالي الشهري = أرباح الإعلانات + تقدير دخل الرعايات، ثم قسّمناه على 30 يوم للتقدير اليومي، وضربناه في 12 للتقدير السنوي",
  ];

  const viewToSubRatio = subscribers > 0 ? avgViews / subscribers : 0;

  const tips: string[] = [];
  if (!eligible) {
    tips.push(
      "قناتك لسه ماوصلتش لحد برنامج شركاء يوتيوب (1000 مشترك + 4000 ساعة مشاهدة خلال سنة، أو 10 مليون مشاهدة شورتس خلال 90 يوم). ركّز الأول على الوصول لهذا الحد قبل التفكير في تحسين الأرباح.",
    );
  }
  if (videosPerMonth < 4) {
    tips.push(
      "معدل نشرك أقل من فيديو أسبوعياً. الثبات في النشر (4-8 فيديوهات شهرياً على الأقل) بيسرّع نمو القناة وثقة الخوارزمية فيها.",
    );
  }
  if (subscribers > 0 && viewToSubRatio < 0.1) {
    tips.push(
      "نسبة المشاهدات لعدد المشتركين منخفضة، يعني جزء كبير من متابعينك مش بيشوف فيديوهاتك الجديدة. جرّب تحسين العناوين والصور المصغّرة (Thumbnails) وتوقيت النشر.",
    );
  }
  if (["gaming", "entertainment", "lifestyle"].includes(niche)) {
    tips.push(
      "مجالك الحالي معدل RPM فيه أقل نسبياً. فكّر تضيف محتوى فرعي بيربط مجالك بمواضيع أعلى قيمة إعلانية زي التقنية أو النصائح المالية لتنويع مصدر الدخل.",
    );
  }
  tips.push(
    "نوّع دخلك بعيداً عن الإعلانات فقط: عضويات القناة (Channel Memberships)، المنتجات الرقمية، والتسويق بالعمولة (Affiliate Marketing).",
  );
  tips.push(
    "الفيديوهات اللي بتخلي المشاهد يكمّلها كاملة (نسبة مشاهدة عالية) بتاخد إعلانات أطول وأغلى، فركّز على قوة أول 15 ثانية من الفيديو.",
  );

  let performanceLabel = "متوسط";
  if (viewToSubRatio >= 0.4) performanceLabel = "ممتاز";
  else if (viewToSubRatio >= 0.2) performanceLabel = "جيد جداً";
  else if (viewToSubRatio >= 0.1) performanceLabel = "جيد";
  else performanceLabel = "بحاجة لتحسين";

  return buildResult("youtube", monthly, breakdown, explanation, tips, {
    eligibility: {
      eligible,
      message: eligible
        ? "قناتك مؤهلة لبرنامج شركاء يوتيوب"
        : "قناتك غير مؤهلة بعد لبرنامج شركاء يوتيوب (يتطلب 1000 مشترك كحد أدنى)",
    },
    engagementRate: round2(viewToSubRatio * 100),
    performanceLabel,
  });
}

/* ------------------------------------------------------------------ */
/*  إنستجرام                                                            */
/* ------------------------------------------------------------------ */

function engagementTierInstagram(rate: number): { multiplier: number; label: string } {
  if (rate >= 6) return { multiplier: 1.4, label: "ممتاز" };
  if (rate >= 3) return { multiplier: 1.0, label: "جيد" };
  if (rate >= 1) return { multiplier: 0.7, label: "متوسط" };
  return { multiplier: 0.45, label: "ضعيف" };
}

function calculateInstagram(values: FormValues): EarningsResult {
  const followers = num(values, "followers");
  const avgLikes = num(values, "avgLikes");
  const avgComments = num(values, "avgComments");
  const avgReach = num(values, "avgReach");

  const engagementRate = followers > 0 ? ((avgLikes + avgComments) / followers) * 100 : 0;
  const { multiplier, label } = engagementTierInstagram(engagementRate);

  const [baseMin, baseMax, postsMin, postsMax] = tierValue(followers, [
    { threshold: 0, result: [4, 8, 0, 1] as [number, number, number, number] },
    { threshold: 5000, result: [5, 10, 1, 2] as [number, number, number, number] },
    { threshold: 20000, result: [8, 15, 2, 4] as [number, number, number, number] },
    { threshold: 100000, result: [10, 20, 3, 6] as [number, number, number, number] },
    { threshold: 500000, result: [15, 35, 6, 12] as [number, number, number, number] },
  ]);

  const perPostMin = (followers / 1000) * baseMin * multiplier;
  const perPostMax = (followers / 1000) * baseMax * multiplier;
  const monthly: MonthlyRange = {
    min: perPostMin * postsMin,
    max: perPostMax * postsMax,
  };

  const breakdown: EarningsBreakdownItem[] = [
    {
      label: "منشورات وشراكات ممولة (تقديري)",
      monthlyMin: round2(monthly.min),
      monthlyMax: round2(monthly.max),
      description:
        postsMax > 0
          ? `${postsMin}-${postsMax} منشور ممول شهرياً بسعر $${Math.round(perPostMin)}-$${Math.round(perPostMax)} للمنشور، بناءً على معدل تفاعل ${engagementRate.toFixed(1)}%`
          : "حسابك لسه في بداية الطريق لجذب رعايات ثابتة",
    },
  ];

  const explanation = [
    `معدل التفاعل = (متوسط اللايكات ${formatNumber(avgLikes)} + متوسط الكومنتات ${formatNumber(avgComments)}) ÷ المتابعين ${formatNumber(followers)} × 100 = ${engagementRate.toFixed(1)}%`,
    `تصنيف معدل التفاعل: ${label} (مضاعف السعر ×${multiplier})`,
    `إنستجرام مالوش برنامج أرباح إعلانات مباشر زي يوتيوب، فالدخل الأساسي بييجي من الشراكات المدفوعة مع البراندات`,
    `سعر المنشور الواحد يعتمد على شريحة متابعينك (سعر تقريبي لكل 1000 متابع) مضروب في مضاعف التفاعل`,
    "الإجمالي الشهري = سعر المنشور × عدد المنشورات الممولة المتوقعة",
  ];

  const tips: string[] = [];
  if (engagementRate < 1) {
    tips.push(
      "معدل التفاعل عندك أقل من 1%، وده بيقلل تقييم حسابك عند البراندات. راجع جودة قاعدة متابعينك، وركّز على محتوى تفاعلي زي الأسئلة والاستفتاءات في الستوري.",
    );
  } else if (engagementRate < 3) {
    tips.push(
      "معدل تفاعلك متوسط. جرّب ترد على الكومنتات بسرعة في أول ساعة بعد النشر، وانشر وقت ذروة نشاط متابعينك حسب الإنسايتس.",
    );
  }
  if (followers > 0 && avgReach / followers < 0.3) {
    tips.push(
      "الريتش بتاعك منخفض مقارنة بعدد متابعينك، يعني الخوارزمية مش بتوزّع محتواك كويس. جرّب تنوّع بين الريلز والصور والكاروسيل بانتظام.",
    );
  }
  tips.push(
    "الحسابات المتوسطة (Micro-Influencers) غالباً بتحقق سعر أعلى لكل متابع من الحسابات الكبيرة، لأن البراندات بتدوّر على تفاعل حقيقي مش أرقام بس.",
  );
  tips.push(
    "أضف دخل التسويق بالعمولة (Affiliate Marketing) في البايو والستوري، ده بيدي دخل شبه ثابت من غير ما تستنى عروض رعاية.",
  );

  return buildResult("instagram", monthly, breakdown, explanation, tips, {
    engagementRate: round2(engagementRate),
    performanceLabel: label,
  });
}

/* ------------------------------------------------------------------ */
/*  تيك توك                                                             */
/* ------------------------------------------------------------------ */

function calculateTikTok(values: FormValues): EarningsResult {
  const followers = num(values, "followers");
  const avgViews = num(values, "avgViews");
  const avgLikes = num(values, "avgLikes");
  const videosPerMonth = num(values, "videosPerMonth");

  const monthlyViews = avgViews * videosPerMonth;
  const engagementRate = avgViews > 0 ? (avgLikes / avgViews) * 100 : 0;

  // شروط مبسطة لبرنامج TikTok Creator Rewards Program
  const eligible = followers >= 10000 && monthlyViews >= 100000;
  const platformRevenueMin = eligible ? (monthlyViews / 1000) * 0.4 : 0;
  const platformRevenueMax = eligible ? (monthlyViews / 1000) * 1.0 : 0;

  const [dealsMin, dealsMax] = tierValue(followers, [
    { threshold: 0, result: [0, 0] as [number, number] },
    { threshold: 10000, result: [1, 2] as [number, number] },
    { threshold: 50000, result: [2, 4] as [number, number] },
    { threshold: 500000, result: [4, 8] as [number, number] },
  ]);
  const perPostMin = (avgViews / 1000) * 3;
  const perPostMax = (avgViews / 1000) * 10;
  const sponsorMin = perPostMin * dealsMin;
  const sponsorMax = perPostMax * dealsMax;

  const monthly: MonthlyRange = {
    min: platformRevenueMin + sponsorMin,
    max: platformRevenueMax + sponsorMax,
  };

  const breakdown: EarningsBreakdownItem[] = [
    {
      label: "TikTok Creator Rewards Program",
      monthlyMin: round2(platformRevenueMin),
      monthlyMax: round2(platformRevenueMax),
      description: eligible
        ? `${formatNumber(monthlyViews)} مشاهدة شهرياً × $0.4-$1 لكل 1000 مشاهدة للمحتوى المؤهل (دقيقة+)`
        : "الحساب لسه مايستوفيش شروط برنامج Creator Rewards (10 آلاف متابع + 100 ألف مشاهدة خلال 30 يوم)",
    },
    {
      label: "رعايات وتعاونات مدفوعة (تقديري)",
      monthlyMin: round2(sponsorMin),
      monthlyMax: round2(sponsorMax),
      description:
        dealsMax > 0
          ? `${dealsMin}-${dealsMax} تعاون شهرياً بسعر $${Math.round(perPostMin)}-$${Math.round(perPostMax)} للفيديو الواحد`
          : "حجم الحساب الحالي لسه صغير على جذب رعايات ثابتة",
    },
  ];

  const explanation = [
    `مشاهدات الشهر = متوسط المشاهدات (${formatNumber(avgViews)}) × عدد الفيديوهات (${videosPerMonth}) = ${formatNumber(monthlyViews)} مشاهدة`,
    eligible
      ? "حسابك مؤهل لبرنامج TikTok Creator Rewards، فطبّقنا معدل $0.4-$1 لكل 1000 مشاهدة"
      : "حسابك لسه مش مؤهل لبرنامج Creator Rewards، فاحتسبنا بس إمكانية دخل الرعايات",
    "أضفنا تقدير دخل الرعايات بناءً على متوسط المشاهدات وحجم قاعدة المتابعين",
  ];

  const tips: string[] = [];
  if (!eligible) {
    tips.push(
      "لتفعيل Creator Rewards Program لازم يكون عندك 10 آلاف متابع على الأقل و100 ألف مشاهدة خلال آخر 30 يوم. ركّز على الثبات في النشر للوصول للحد ده.",
    );
  }
  if (engagementRate < 4) {
    tips.push(
      "معدل تفاعلك (لايكات/مشاهدات) أقل من المتوسط على تيك توك (المتوسط العام حوالي 4-9%). جرّب تستخدم صوتيات ترند وتحديات نشطة حالياً.",
    );
  }
  tips.push(
    "الفيديوهات اللي أطول من دقيقة بتاخد أولوية أعلى في أرباح برنامج Creator Rewards الجديد، فحاول توسّع في محتوى أطول شوية بدل الفيديوهات القصيرة جداً.",
  );
  tips.push(
    "الرد بفيديو على الكومنتات بيزوّد الانتشار بشكل كبير جداً على تيك توك تحديداً مقارنة بباقي المنصات.",
  );

  return buildResult("tiktok", monthly, breakdown, explanation, tips, {
    eligibility: {
      eligible,
      message: eligible
        ? "الحساب مؤهل لبرنامج TikTok Creator Rewards"
        : "الحساب غير مؤهل بعد لبرنامج TikTok Creator Rewards",
    },
    engagementRate: round2(engagementRate),
    performanceLabel: engagementRate >= 9 ? "ممتاز" : engagementRate >= 4 ? "جيد" : "بحاجة لتحسين",
  });
}

/* ------------------------------------------------------------------ */
/*  فيسبوك                                                              */
/* ------------------------------------------------------------------ */

function calculateFacebook(values: FormValues): EarningsResult {
  const followers = num(values, "followers");
  const avgViews = num(values, "avgViews");
  const avgEngagement = num(values, "avgEngagement");
  const postsPerMonth = num(values, "postsPerMonth");

  const monthlyViews = avgViews * postsPerMonth;
  const engagementRate = avgViews > 0 ? (avgEngagement / avgViews) * 100 : 0;

  // تبسيط لشرط برنامج Facebook Content Monetization
  const eligible = followers >= 10000;
  const platformRevenueMin = eligible ? (monthlyViews / 1000) * 1 : 0;
  const platformRevenueMax = eligible ? (monthlyViews / 1000) * 4 : 0;

  const [dealsMin, dealsMax] = tierValue(followers, [
    { threshold: 0, result: [0, 0] as [number, number] },
    { threshold: 10000, result: [1, 2] as [number, number] },
    { threshold: 100000, result: [2, 4] as [number, number] },
    { threshold: 1000000, result: [3, 6] as [number, number] },
  ]);
  const perPostMin = (followers / 1000) * 4;
  const perPostMax = (followers / 1000) * 10;
  const sponsorMin = perPostMin * dealsMin;
  const sponsorMax = perPostMax * dealsMax;

  const monthly: MonthlyRange = {
    min: platformRevenueMin + sponsorMin,
    max: platformRevenueMax + sponsorMax,
  };

  const breakdown: EarningsBreakdownItem[] = [
    {
      label: "إعلانات الفيديو (In-Stream Ads)",
      monthlyMin: round2(platformRevenueMin),
      monthlyMax: round2(platformRevenueMax),
      description: eligible
        ? `${formatNumber(monthlyViews)} مشاهدة شهرياً × $1-$4 لكل 1000 مشاهدة`
        : "الصفحة لسه مايستوفيش شروط برنامج Facebook Content Monetization (10 آلاف متابع تقريباً كحد أدنى)",
    },
    {
      label: "رعايات وتعاونات مدفوعة (تقديري)",
      monthlyMin: round2(sponsorMin),
      monthlyMax: round2(sponsorMax),
      description:
        dealsMax > 0
          ? `${dealsMin}-${dealsMax} تعاون شهرياً بسعر $${Math.round(perPostMin)}-$${Math.round(perPostMax)} للمنشور`
          : "حجم الصفحة الحالي لسه صغير على جذب رعايات ثابتة",
    },
  ];

  const explanation = [
    `مشاهدات الشهر = متوسط المشاهدات (${formatNumber(avgViews)}) × عدد المنشورات (${postsPerMonth}) = ${formatNumber(monthlyViews)} مشاهدة`,
    eligible
      ? "الصفحة مؤهلة تقريباً لبرنامج Facebook Content Monetization، فطبّقنا معدل $1-$4 لكل 1000 مشاهدة"
      : "الصفحة لسه صغيرة على تفعيل إعلانات الفيديو المباشرة، فاحتسبنا بس إمكانية الرعايات",
    "أضفنا تقدير دخل الرعايات بناءً على حجم قاعدة المتابعين",
  ];

  const tips: string[] = [];
  if (!eligible) {
    tips.push(
      "لتفعيل إعلانات الفيديو على فيسبوك محتاج تكبّر قاعدة متابعينك ودقائق المشاهدة الإجمالية. ركّز على فيديوهات أطول (فوق 3 دقائق) تزوّد وقت المشاهدة.",
    );
  }
  if (engagementRate < 3) {
    tips.push(
      "معدل التفاعل بالنسبة للمشاهدات منخفض. جرّب تستخدم صور غلاف جذابة وأسئلة في نص المنشور لتشجيع الكومنتات.",
    );
  }
  tips.push(
    "محتوى الفيديو الطويل (Facebook Watch) عادة بيحقق دخل إعلانات أعلى من المنشورات النصية أو الصور.",
  );
  tips.push(
    "استخدم فيسبوك كقناة توجيه لجمهورك نحو منصات تانية (يوتيوب أو موقعك) عشان تنوّع مصادر دخلك.",
  );

  return buildResult("facebook", monthly, breakdown, explanation, tips, {
    eligibility: {
      eligible,
      message: eligible
        ? "الصفحة مؤهلة تقريباً لبرنامج إعلانات الفيديو"
        : "الصفحة غير مؤهلة بعد لبرنامج إعلانات الفيديو",
    },
    engagementRate: round2(engagementRate),
    performanceLabel: engagementRate >= 8 ? "ممتاز" : engagementRate >= 3 ? "جيد" : "بحاجة لتحسين",
  });
}

/* ------------------------------------------------------------------ */
/*  إكس (تويتر سابقاً)                                                   */
/* ------------------------------------------------------------------ */

function calculateX(values: FormValues): EarningsResult {
  const followers = num(values, "followers");
  const avgImpressions = num(values, "avgImpressions");
  const postsPerMonth = num(values, "postsPerMonth");

  const monthlyImpressions = avgImpressions * postsPerMonth;
  const rolling3moImpressions = monthlyImpressions * 3;

  // تبسيط لشروط برنامج مشاركة الإيرادات على إكس
  const eligible = followers >= 500 && rolling3moImpressions >= 5000000;
  const platformRevenueMin = eligible ? (monthlyImpressions / 1000) * 0.01 : 0;
  const platformRevenueMax = eligible ? (monthlyImpressions / 1000) * 0.03 : 0;

  const [dealsMin, dealsMax] = tierValue(followers, [
    { threshold: 0, result: [0, 0] as [number, number] },
    { threshold: 5000, result: [0, 1] as [number, number] },
    { threshold: 50000, result: [1, 3] as [number, number] },
    { threshold: 500000, result: [2, 5] as [number, number] },
  ]);
  const perPostMin = (followers / 1000) * 3;
  const perPostMax = (followers / 1000) * 8;
  const sponsorMin = perPostMin * dealsMin;
  const sponsorMax = perPostMax * dealsMax;

  const monthly: MonthlyRange = {
    min: platformRevenueMin + sponsorMin,
    max: platformRevenueMax + sponsorMax,
  };

  const breakdown: EarningsBreakdownItem[] = [
    {
      label: "مشاركة أرباح الإعلانات (Ads Revenue Sharing)",
      monthlyMin: round2(platformRevenueMin),
      monthlyMax: round2(platformRevenueMax),
      description: eligible
        ? `${formatNumber(monthlyImpressions)} مشاهدة شهرياً × $0.01-$0.03 لكل 1000 مشاهدة`
        : "الحساب لسه مايستوفيش شروط البرنامج (500 متابع + 5 مليون مشاهدة خلال آخر 3 شهور)",
    },
    {
      label: "رعايات وتعاونات مدفوعة (تقديري)",
      monthlyMin: round2(sponsorMin),
      monthlyMax: round2(sponsorMax),
      description:
        dealsMax > 0
          ? `${dealsMin}-${dealsMax} تعاون شهرياً بسعر $${Math.round(perPostMin)}-$${Math.round(perPostMax)} للمنشور`
          : "حجم الحساب الحالي لسه صغير على جذب رعايات ثابتة",
    },
  ];

  const explanation = [
    `مشاهدات الشهر = متوسط المشاهدات للمنشور (${formatNumber(avgImpressions)}) × عدد المنشورات (${postsPerMonth}) = ${formatNumber(monthlyImpressions)} مشاهدة`,
    eligible
      ? "الحساب مستوفي تقريباً لشروط برنامج مشاركة الإيرادات، فطبّقنا معدل $0.01-$0.03 لكل 1000 مشاهدة (معدل متحفظ لأن الأرقام الحقيقية متفاوتة جداً)"
      : "الحساب لسه مايستوفيش شروط برنامج مشاركة الإيرادات، فاحتسبنا بس إمكانية الرعايات",
    "أضفنا تقدير دخل الرعايات بناءً على حجم قاعدة المتابعين",
  ];

  const tips: string[] = [];
  if (!eligible) {
    tips.push(
      "برنامج مشاركة الإيرادات على إكس محتاج 500 متابع على الأقل و5 مليون مشاهدة (Impressions) خلال آخر 3 شهور، مع اشتراك بريميوم فعّال. ركّز على زيادة تكرار النشر.",
    );
  }
  tips.push(
    "الردود الطويلة والخيوط (Threads) اللي بتخلي الناس تتفاعل بالرد بتزوّد المشاهدات بشكل كبير على الخوارزمية الحالية.",
  );
  tips.push(
    "دخل الرعايات على إكس بيعتمد بشكل كبير على مصداقية الحساب في مجال معيّن، فركّز على الاستمرارية في نيش واحد بدل التشتت.",
  );

  return buildResult("x", monthly, breakdown, explanation, tips, {
    eligibility: {
      eligible,
      message: eligible
        ? "الحساب مستوفٍ تقريباً لشروط مشاركة الإيرادات"
        : "الحساب غير مستوفٍ بعد لشروط مشاركة الإيرادات",
    },
  });
}

/* ------------------------------------------------------------------ */
/*  نقطة الدخول الموحدة                                                  */
/* ------------------------------------------------------------------ */

export function calculateEarnings(
  platform: Platform,
  values: FormValues,
): EarningsResult {
  switch (platform) {
    case "youtube":
      return calculateYouTube(values);
    case "instagram":
      return calculateInstagram(values);
    case "tiktok":
      return calculateTikTok(values);
    case "facebook":
      return calculateFacebook(values);
    case "x":
      return calculateX(values);
    default:
      throw new Error(`منصة غير مدعومة: ${platform}`);
  }
}
