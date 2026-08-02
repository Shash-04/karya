"use client";

import { useAppSelector } from "@/store/hooks";

export default function Home() {
  const { status, user } = useAppSelector((s) => s.auth);
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-3xl font-bold">TaskForge</h1>
      <p className="mt-2 text-slate-500">Task automation &amp; job processing platform</p>
      <p className="mt-6 text-sm">
        Auth status: <span className="font-mono">{status}</span>
      </p>
      {user && (
        <p className="text-sm">
          Signed in as {user.email} ({user.role})
        </p>
      )}
    </main>
  );
}
