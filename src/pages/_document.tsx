import { Html, Head, Main, NextScript } from "next/document";

import { fontClassName } from "@/shared/styles/fonts";

export default function Document() {
  return (
    <Html lang="id" className={`${fontClassName} dark`}>
      <Head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
