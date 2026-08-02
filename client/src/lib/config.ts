// Runtime configuration. NEXT_PUBLIC_* values are inlined at build time;
// the fallbacks keep local dev working without a .env.local.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws";
