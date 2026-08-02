// Small wrapper over localStorage for JWT access/refresh tokens.
const ACCESS_KEY = "tf_access_token";
const REFRESH_KEY = "tf_refresh_token";

export const tokenStore = {
  getAccess(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },
  getRefresh(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  set(accessToken: string, refreshToken: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_KEY, accessToken);
    window.localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};
