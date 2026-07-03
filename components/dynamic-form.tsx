"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  Calculator,
  CalendarDays,
  Eye,
  Hash,
  Heart,
  Loader2,
  MessageCircle,
  Radar,
  Tags,
  Users,
} from "lucide-react";

import { PLATFORMS } from "@/lib/platform-config";
import { buildPlatformSchema } from "@/lib/schema";
import type { FormValues, Platform } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

function fieldIcon(name: string) {
  if (/subscribers|followers/i.test(name)) return Users;
  if (/views|impressions/i.test(name)) return Eye;
  if (/likes/i.test(name)) return Heart;
  if (/comments/i.test(name)) return MessageCircle;
  if (/reach/i.test(name)) return Radar;
  if (/engagement/i.test(name)) return Activity;
  if (/permonth/i.test(name)) return CalendarDays;
  if (name === "niche") return Tags;
  return Hash;
}

interface DynamicFormProps {
  platform: Platform;
  onCalculate: (values: FormValues) => void;
  isCalculating: boolean;
}

export function DynamicForm({ platform, onCalculate, isCalculating }: DynamicFormProps) {
  const meta = PLATFORMS[platform];
  const schema = React.useMemo(() => buildPlatformSchema(platform), [platform]);

  const defaultValues = React.useMemo(() => {
    const values: Record<string, string> = {};
    for (const field of meta.fields) {
      values[field.name] = "";
    }
    return values;
  }, [meta]);

  const form = useForm<Record<string, string>>({
    // السكيمة ديناميكية (كل منصة عندها حقول مختلفة)، فبنعمل cast آمن لنوع الـ Resolver
    // لأن TypeScript مش قادر يستنتج شكل الحقول ديناميكياً وقت الكومبايل
    resolver: zodResolver(schema) as unknown as Resolver<Record<string, string>>,
    defaultValues,
    mode: "onSubmit",
  });

  function handleSubmit(values: Record<string, string>) {
    onCalculate(values as FormValues);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          {meta.fields.map((field) => {
            const Icon = fieldIcon(field.name);
            return (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: rhfField }) => (
                  <FormItem className={field.type === "select" ? "sm:col-span-2" : undefined}>
                    <FormLabel>
                      <Icon className="size-4 text-primary" />
                      {field.label}
                    </FormLabel>
                    <FormControl>
                      {field.type === "select" ? (
                        <Select onValueChange={rhfField.onChange} value={rhfField.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر مجال المحتوى..." />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            dir="ltr"
                            inputMode="decimal"
                            min={field.min ?? 0}
                            placeholder={field.placeholder}
                            className="text-right"
                            {...rhfField}
                          />
                          {field.unit && (
                            <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
                              {field.unit}
                            </span>
                          )}
                        </div>
                      )}
                    </FormControl>
                    {field.helperText && (
                      <p className="text-xs text-muted-foreground">{field.helperText}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}
        </div>

        <Button
          type="submit"
          size="lg"
          variant="premium"
          className="w-full"
          disabled={isCalculating}
        >
          {isCalculating ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              جاري الحساب...
            </>
          ) : (
            <>
              <Calculator className="size-5" />
              احسب الأرباح
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
