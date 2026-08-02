"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { Spinner } from "./ui/Spinner";

/** Gates a page on authentication (and optionally the ADMIN role). */
export function AuthGuard({
  children,
  requireAdmin = false,
}: {
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const { status, user } = useAppSelector((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && requireAdmin && user?.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [status, user, requireAdmin, router]);

  if (status !== "authenticated" || (requireAdmin && user?.role !== "ADMIN")) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return <>{children}</>;
}
