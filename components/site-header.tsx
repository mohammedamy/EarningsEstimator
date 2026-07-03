import Link from "next/link";
import { Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-md shadow-primary/20">
            <Sparkles className="size-5" />
          </span>
          <span className="text-lg font-black tracking-tight text-foreground">
            Earnly<span className="text-primary">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            حاسبة أرباح صنّاع المحتوى
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
