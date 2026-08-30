"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Cpu, Link2, Lock, Mail } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";

const DEMO = {
  user: { email: "user@taskforge.ai", password: "UserPassword123!" },
  admin: { email: "admin@taskforge.ai", password: "AdminPassword123!" },
};

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(mail: string, pass: string) {
    setLoading(true);
    setError(null);
    try {
      await login(mail, pass);
    } catch (err) {
      setError(getErrorMessage(err, "Invalid email or password"));
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void submit(email, password);
  }

  function quick(kind: keyof typeof DEMO) {
    setEmail(DEMO[kind].email);
    setPassword(DEMO[kind].password);
    void submit(DEMO[kind].email, DEMO[kind].password);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/30">
            <Cpu className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back to TaskForge</h1>
          <p className="mt-1 text-sm text-muted">
            Sign in to access your asynchronous job queue &amp; real-time telemetry
          </p>
        </div>

        <div className="rounded-xl2 border border-border bg-surface p-6 shadow-sm shadow-stone-900/[0.03]">
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <Alert>{error}</Alert>}
            <Field label="Email Address" icon={<Mail className="h-4 w-4" />}>
              <Input
                type="email"
                autoComplete="email"
                placeholder="user@taskforge.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9"
              />
            </Field>
            <Field label="Password" icon={<Lock className="h-4 w-4" />}>
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9"
              />
            </Field>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Spinner className="h-4 w-4 text-white" />}
              Sign In to TaskForge
            </Button>
          </form>

          <div className="my-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
            <Link2 className="h-3.5 w-3.5" />
            Quick Demo Logins
          </div>
          <div className="grid grid-cols-2 gap-3">
            <QuickCard
              title="Demo User"
              email="user@taskforge.ai"
              onClick={() => quick("user")}
              disabled={loading}
            />
            <QuickCard
              title="Admin User"
              email="admin@taskforge.ai"
              accent
              onClick={() => quick("admin")}
              disabled={loading}
            />
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-brand hover:underline">
            Register new workspace account
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

function QuickCard({
  title,
  email,
  accent,
  onClick,
  disabled,
}: {
  title: string;
  email: string;
  accent?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-border-strong bg-surface p-3 text-left transition-colors hover:border-brand hover:bg-brand-softer disabled:opacity-50"
    >
      <div className={`text-sm font-bold ${accent ? "text-brand" : "text-foreground"}`}>{title}</div>
      <div className="mt-0.5 text-[11px] text-faint">{email}</div>
    </button>
  );
}
