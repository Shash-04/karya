import { ReactNode } from "react";

export function Alert({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
      {children}
    </div>
  );
}
