"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { tokenStore } from "@/lib/tokenStore";
import { authService } from "@/services/authService";
import { store } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { setUnauthenticated, setUser } from "@/store/authSlice";

/** Hydrates auth state on load: if a token exists, resolve the current user. */
function AuthBootstrap() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (tokenStore.getAccess()) {
      authService
        .me()
        .then((user) => dispatch(setUser(user)))
        .catch(() => {
          tokenStore.clear();
          dispatch(setUnauthenticated());
        });
    } else {
      dispatch(setUnauthenticated());
    }
  }, [dispatch]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 10_000, retry: 1, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap />
        {children}
      </QueryClientProvider>
    </Provider>
  );
}
