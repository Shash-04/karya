import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/lib/types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  status: AuthStatus;
}

const initialState: AuthState = {
  user: null,
  status: "loading",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.status = "authenticated";
    },
    clearAuth(state) {
      state.user = null;
      state.status = "unauthenticated";
    },
    setUnauthenticated(state) {
      state.user = null;
      state.status = "unauthenticated";
    },
  },
});

export const { setUser, clearAuth, setUnauthenticated } = authSlice.actions;
export default authSlice.reducer;
