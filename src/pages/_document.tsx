import { Html, Head, Main, NextScript } from "next/document";

import { fontClassName } from "@/shared/styles/fonts";

export default function Document() {
  return (
    <Html lang="id" className={`${fontClassName} dark`}>
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
