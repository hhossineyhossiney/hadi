"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={5 * 60}          // refresh session every 5 minutes
      refetchOnWindowFocus={true}       // refresh on tab focus
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
}
