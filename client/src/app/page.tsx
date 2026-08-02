"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useAppSelector } from "@/store/hooks";

export default function Home() {
  const { status } = useAppSelector((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
    else if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
