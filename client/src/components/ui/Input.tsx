import { forwardRef, InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 ${className}`}
        {...props}
      />
    );
  }
);
