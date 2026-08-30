import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl2 border border-border bg-surface shadow-sm shadow-stone-900/[0.03] ${className}`}
      {...props}
    />
  );
}
