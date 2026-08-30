import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-brand hover:bg-brand-hover text-white shadow-sm shadow-brand/20",
  secondary:
    "bg-surface border border-border-strong text-foreground hover:bg-surface-2 hover:border-faint",
  danger: "bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-600/20",
  ghost: "text-muted hover:bg-surface-2 hover:text-foreground",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
