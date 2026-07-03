export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm leading-relaxed text-muted-foreground sm:px-6">
        <p>
          © {new Date().getFullYear()} Earnly — الأرقام المعروضة تقديرية لأغراض التخطيط والتوجيه، وليست ضماناً لدخل فعلي.
        </p>
      </div>
    </footer>
  );
}
