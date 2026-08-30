"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  size = "lg",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  size?: "lg" | "xl";
  children: ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === "xl" ? "max-w-2xl" : "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className={`relative z-10 w-full ${maxW}`}>
        <div className="max-h-[88vh] overflow-y-auto rounded-xl2 border border-border bg-surface shadow-2xl shadow-stone-900/20 tf-scroll">
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div className="flex items-start gap-3">
              {icon && (
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                  {icon}
                </span>
              )}
              <div>
                <h2 className="text-lg font-bold">{title}</h2>
                {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-faint transition-colors hover:bg-surface-2 hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
