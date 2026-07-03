"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Check,
  Copy,
  Info,
  Lightbulb,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import type { EarningsResult, PlatformMeta } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { PlatformIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ResultsCardProps {
  result: EarningsResult;
  platformMeta: PlatformMeta;
  onReset: () => void;
}

type Period = "daily" | "monthly" | "yearly";

const PERIOD_LABEL: Record<Period, string> = {
  daily: "يومياً",
  monthly: "شهرياً",
  yearly: "سنوياً",
};

const PERIOD_FACTOR: Record<Period, number> = {
  daily: 1 / 30,
  monthly: 1,
  yearly: 12,
};

export function ResultsCard({ result, platformMeta, onReset }: ResultsCardProps) {
  const [period, setPeriod] = React.useState<Period>("monthly");
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    const text = [
      `تقدير أرباحي على ${platformMeta.name} عبر Earnly:`,
      `يومياً: ${formatCurrency(result.daily.min)} - ${formatCurrency(result.daily.max)}`,
      `شهرياً: ${formatCurrency(result.monthly.min)} - ${formatCurrency(result.monthly.max)}`,
      `سنوياً: ${formatCurrency(result.yearly.min)} - ${formatCurrency(result.yearly.max)}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // تجاهل بصمت لو المتصفح رفض صلاحية الحافظة
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-b from-card to-card/60">
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="flex size-12 items-center justify-center rounded-2xl text-white shadow"
                style={{ backgroundColor: platformMeta.brandColor }}
              >
                <PlatformIcon platform={result.platform} className="size-6" />
              </span>
              <div>
                <CardTitle className="text-xl">تقدير أرباحك من {platformMeta.name}</CardTitle>
                <CardDescription>نتيجة مبنية على الأرقام اللي أدخلتها بنفسك</CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {result.performanceLabel && (
                <Badge variant="accent">
                  <TrendingUp />
                  الأداء: {result.performanceLabel}
                </Badge>
              )}
              {result.eligibility && (
                <Badge variant={result.eligibility.eligible ? "success" : "outline"}>
                  {result.eligibility.eligible ? <ShieldCheck /> : <ShieldAlert />}
                  {result.eligibility.message}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">يومي</TabsTrigger>
              <TabsTrigger value="monthly">شهري</TabsTrigger>
              <TabsTrigger value="yearly">سنوي</TabsTrigger>
            </TabsList>

            {(["daily", "monthly", "yearly"] as Period[]).map((p) => (
              <TabsContent key={p} value={p} className="mt-6 space-y-6">
                <div className="rounded-3xl border border-primary/15 bg-primary/5 p-8 text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    الأرباح المتوقعة {PERIOD_LABEL[p]}
                  </p>
                  <p className="mt-2 bg-gradient-to-tr from-primary to-accent bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
                    {formatCurrency(result[p].min)} - {formatCurrency(result[p].max)}
                  </p>
                </div>

                <div className="space-y-4">
                  {result.breakdown.map((item) => {
                    const scaledMin = item.monthlyMin * PERIOD_FACTOR[p];
                    const scaledMax = item.monthlyMax * PERIOD_FACTOR[p];
                    const share =
                      result.monthly.max > 0
                        ? (item.monthlyMax / result.monthly.max) * 100
                        : 0;
                    return (
                      <div key={item.label} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold">{item.label}</span>
                          <span className="text-muted-foreground">
                            {formatCurrency(scaledMin)} - {formatCurrency(scaledMax)}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-gradient-to-l from-primary to-accent"
                            style={{ width: `${Math.min(100, Math.max(4, share))}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <Separator />

          <Accordion type="single" collapsible defaultValue="explanation" className="w-full">
            <AccordionItem value="explanation">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <Info className="size-4 text-primary" />
                  إزاي حسبنا الرقم ده؟
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ol className="space-y-2.5">
                  {result.explanation.map((step, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tips">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <Lightbulb className="size-4 text-accent" />
                  نصائح مخصصة لزيادة دخلك
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2.5">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2.5">
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="outline" className="flex-1" onClick={handleCopy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "تم النسخ" : "نسخ النتيجة"}
            </Button>
            <Button type="button" variant="ghost" className="flex-1" onClick={onReset}>
              <RefreshCcw className="size-4" />
              احسب من جديد
            </Button>
          </div>

          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            هذه الأرقام تقديرية بناءً على متوسطات عامة في الصناعة، وتختلف فعلياً حسب بلد المشاهدين، جودة المحتوى، الموسم، وسياسات كل منصة القابلة للتغيير.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
