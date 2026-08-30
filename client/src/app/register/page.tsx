"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Cpu, Lock, Mail, User } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(getErrorMessage(err, "Could not create account"));
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/30">
            <Cpu className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Create your workspace</h1>
          <p className="mt-1 text-sm text-muted">
            Spin up an account to dispatch jobs and watch them process live.
          </p>
        </div>

        <div className="rounded-xl2 border border-border bg-surface p-6 shadow-sm shadow-stone-900/[0.03]">
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <Alert>{error}</Alert>}
            <Field label="Full Name" icon={<User className="h-4 w-4" />}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                required
                className="pl-9"
              />
            </Field>
            <Field label="Email Address" icon={<Mail className="h-4 w-4" />}>
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9"
              />
            </Field>
            <Field label="Password" icon={<Lock className="h-4 w-4" />}>
              <Input
                type="password"
                autoComplete="new-password"
                minLength={8}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9"
              />
            </Field>
            <p className="text-xs text-faint">At least 8 characters.</p>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Spinner className="h-4 w-4 text-white" />}
              Create Account
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Sign in
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
