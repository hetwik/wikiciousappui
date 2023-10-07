import Document, { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <Script
            src="/datafeeds/udf/dist/bundle.js"
            strategy="beforeInteractive"
          ></Script>
   <script>
  if (typeof navigator.serviceWorker !== 'undefined') {
    navigator.serviceWorker.register('service-worker.js')
  }
</script>
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
