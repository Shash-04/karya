import { forwardRef, InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/25 ${className}`}
        {...props}
      />
    );
  }
);
