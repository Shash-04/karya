import { AxiosError } from "axios";
import type { ApiResponse } from "./types";

/** Pull a human-readable message out of an axios/API error. */
export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err && typeof err === "object" && "isAxiosError" in err) {
    const axiosError = err as AxiosError<ApiResponse<unknown>>;
    return axiosError.response?.data?.message ?? axiosError.message ?? fallback;
  }
  return fallback;
}
