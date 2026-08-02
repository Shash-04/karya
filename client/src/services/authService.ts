import { api } from "@/lib/api";
import type { ApiResponse, AuthResponse, User } from "@/lib/types";

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/register", {
      name,
      email,
      password,
    });
    return data.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/login", {
      email,
      password,
    });
    return data.data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>("/auth/me");
    return data.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post("/auth/logout", { refreshToken });
  },
};
