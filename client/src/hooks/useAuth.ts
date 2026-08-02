"use client";

import { useRouter } from "next/navigation";
import { tokenStore } from "@/lib/tokenStore";
import { authService } from "@/services/authService";
import { clearAuth, setUser } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, status } = useAppSelector((s) => s.auth);

  async function login(email: string, password: string) {
    const res = await authService.login(email, password);
    tokenStore.set(res.accessToken, res.refreshToken);
    dispatch(setUser(res.user));
    router.push("/dashboard");
  }

  async function register(name: string, email: string, password: string) {
    const res = await authService.register(name, email, password);
    tokenStore.set(res.accessToken, res.refreshToken);
    dispatch(setUser(res.user));
    router.push("/dashboard");
  }

  async function logout() {
    const refreshToken = tokenStore.getRefresh();
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch {
      // best-effort revoke
    }
    tokenStore.clear();
    dispatch(clearAuth());
    router.push("/login");
  }

  return { user, status, login, register, logout };
}
