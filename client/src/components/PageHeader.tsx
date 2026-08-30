import { ReactNode } from "react";

export function PageHeader({
  kicker,
  title,
  subtitle,
  actions,
}: {
  kicker?: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker && (
          <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand">
            {kicker}
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function LiveKicker({ label }: { label: string }) {
  return (
    <>
      <span className="h-1.5 w-1.5 rounded-full bg-brand tf-live-dot" />
      {label}
    </>
  );
}
