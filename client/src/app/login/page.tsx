"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("user@taskforge.ai");
  const [password, setPassword] = useState("UserPassword123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(getErrorMessage(err, "Invalid email or password"));
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6">
        <h1 className="text-xl font-bold">Sign in to TaskForge</h1>
        <p className="mt-1 text-sm text-slate-500">Use the seeded demo account or your own.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && <Alert>{error}</Alert>}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Spinner className="h-4 w-4 text-white" />}
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          No account?{" "}
          <Link href="/register" className="font-medium text-indigo-600 hover:underline">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
