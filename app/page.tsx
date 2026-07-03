"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { PLATFORMS } from "@/lib/platform-config";
import { calculateEarnings } from "@/lib/calculations";
import type { EarningsResult, FormValues, Platform } from "@/lib/types";
import { sleep } from "@/lib/utils";
import { PlatformSelector } from "@/components/platform-selector";
import { DynamicForm } from "@/components/dynamic-form";
import { ResultsCard } from "@/components/results-card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [platform, setPlatform] = React.useState<Platform | null>(null);
  const [result, setResult] = React.useState<EarningsResult | null>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);

  const formSectionRef = React.useRef<HTMLDivElement>(null);
  const resultSectionRef = React.useRef<HTMLDivElement>(null);

  function handleSelectPlatform(next: Platform) {
    setPlatform(next);
    setResult(null);
    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function handleChangePlatform() {
    setPlatform(null);
    setResult(null);
  }

  async function handleCalculate(values: FormValues) {
    if (!platform) return;
    setIsCalculating(true);
    // تأخير بسيط لإحساس "معالجة" أفخم بدل ظهور النتيجة فجأة
    await sleep(700);
    const earnings = calculateEarnings(platform, values);
    setResult(earnings);
    setIsCalculating(false);
    requestAnimationFrame(() => {
      resultSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function handleReset() {
    setResult(null);
    setPlatform(null);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  return (
    <>
      {/* الهيرو */}
      <section className="hero-glow relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="accent" className="mb-6">
              <Sparkles className="size-3.5" />
              حاسبة أرباح صنّاع المحتوى العرب
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl leading-[1.2] font-black tracking-tight text-foreground sm:text-5xl md:text-6xl"
          >
            اعرف قد إيه ممكن
            <span className="bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
              {" "}
              تكسب{" "}
            </span>
            من محتواك
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground"
          >
            اختر منصتك، دخّل أرقامك الحقيقية، واحصل على تقدير واقعي لأرباحك
            اليومية والشهرية والسنوية — مبني على معادلات صناعية فعلية، مش تخمين.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary" />
              بياناتك ما بتتخزنش
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="size-4 text-primary" />
              نتيجة فورية
            </span>
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="size-4 text-primary" />
              معادلات واقعية
            </span>
          </motion.div>
        </div>
      </section>

      {/* اختيار المنصة */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            اختر منصتك
          </h2>
          <p className="mt-2 text-muted-foreground">
            هنجهزلك فورم مخصص حسب أرقام المنصة اللي هتختارها
          </p>
        </div>
        <PlatformSelector selected={platform} onSelect={handleSelectPlatform} />
      </section>

      {/* الفورم الديناميكي */}
      <AnimatePresence mode="wait">
        {platform && (
          <motion.section
            key={platform}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="mx-auto max-w-3xl overflow-hidden px-4 pb-16 sm:px-6"
          >
            <div
              ref={formSectionRef}
              className="scroll-mt-24 rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur-sm sm:p-8"
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-foreground">
                  بيانات حسابك على {PLATFORMS[platform].name}
                </h3>
                <button
                  type="button"
                  onClick={handleChangePlatform}
                  className="shrink-0 text-sm font-medium text-primary hover:underline"
                >
                  تغيير المنصة
                </button>
              </div>
              <DynamicForm
                platform={platform}
                onCalculate={handleCalculate}
                isCalculating={isCalculating}
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* النتيجة */}
      {result && platform && (
        <section
          ref={resultSectionRef}
          className="mx-auto max-w-3xl scroll-mt-24 px-4 pb-24 sm:px-6"
        >
          <ResultsCard
            result={result}
            platformMeta={PLATFORMS[platform]}
            onReset={handleReset}
          />
        </section>
      )}
    </>
  );
}
