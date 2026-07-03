"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { PLATFORM_LIST } from "@/lib/platform-config";
import type { Platform } from "@/lib/types";
import { PlatformIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface PlatformSelectorProps {
  selected: Platform | null;
  onSelect: (platform: Platform) => void;
}

export function PlatformSelector({ selected, onSelect }: PlatformSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {PLATFORM_LIST.map((platform, index) => {
        const isSelected = selected === platform.id;
        return (
          <motion.button
            key={platform.id}
            type="button"
            onClick={() => onSelect(platform.id)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            aria-pressed={isSelected}
            className={cn(
              "group relative flex flex-col items-center gap-3 rounded-2xl border bg-card/60 px-4 py-6 text-center shadow-sm backdrop-blur-sm transition-colors",
              isSelected
                ? "border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/10"
                : "border-border/60 hover:border-primary/40 hover:bg-card",
            )}
          >
            {isSelected && (
              <span className="absolute -top-2 -left-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                <Check className="size-3.5" />
              </span>
            )}
            <span
              className="flex size-14 items-center justify-center rounded-2xl text-white shadow-inner transition-transform group-hover:scale-105"
              style={{ backgroundColor: platform.brandColor }}
            >
              <PlatformIcon platform={platform.id} className="size-7" />
            </span>
            <div>
              <p className="font-bold text-foreground">{platform.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{platform.tagline}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
