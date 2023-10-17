import Document, { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel='manifest' href='/manifest.json' />
          <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
          <meta name="theme-color" content="#317EFB" />
          <Script
            src="/datafeeds/udf/dist/bundle.js"
            strategy="beforeInteractive"
          ></Script>
        </Head>
        <body className="hide-scroll bg-th-bkg-1">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
