"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } }));
  return (
    <SessionProvider>
      <QueryClientProvider client={qc}>
        {children}
        <Toaster theme="dark" richColors />
      </QueryClientProvider>
    </SessionProvider>
  );
}
