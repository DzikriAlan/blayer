import type { AppProps } from "next/app";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/shared/components/ui/sonner";
import "@/shared/styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const PROTECTED_ROUTES = ['/home', '/agents']

function AuthGuard({ children }: { readonly children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isProtected = PROTECTED_ROUTES.some(r => router.pathname.startsWith(r))

  useEffect(() => {
    if (status === 'loading') return
    if (!session && isProtected) router.replace('/')
  }, [session, status, isProtected, router])

  if (status === 'loading' && isProtected) return null
  if (!session && isProtected) return null

  return <>{children}</>
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <QueryClientProvider client={queryClient}>
        <AuthGuard>
          <div className="font-sans">
            <Toaster position="top-right" />
            <Component {...pageProps} />
          </div>
        </AuthGuard>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
