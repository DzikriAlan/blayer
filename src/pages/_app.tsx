import type { AppProps } from "next/app";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "@/shared/styles/globals.css";

import AuthGuard from "@/features/auth/components/authGuard";
import ErrorBoundary from "@/shared/components/error-boundary";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>
      <div className={`${archivo.variable} ${jetbrainsMono.variable}`}>
        {/* Guard dipasang di sini, bukan per halaman, supaya halaman baru ikut
            terkunci secara bawaan dan pengecualiannya cukup didaftarkan di satu
            tempat. */}
        {/* Batas error dipasang di dalam guard: kegagalan render satu halaman
            tidak boleh menjatuhkan pemeriksaan sesi bersamanya. */}
        <AuthGuard>
          <ErrorBoundary>
            <Component {...pageProps} />
          </ErrorBoundary>
        </AuthGuard>
      </div>
      {/* Devtools hanya alat pengembang — jangan ikut terkirim ke pengguna. */}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
}
