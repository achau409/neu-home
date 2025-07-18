import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Shared/Navbar/Navbar";
import Footer from "@/components/Shared/Footer/Footer";
import {
  fetchHeader,
  getServices,
  fetchFooter,
  getAllServices,
} from "@/lib/api";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "NEU Home Services",
  description: "A Neu way for Home Improvement Projects",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const header = await fetchHeader();
  const footer = await fetchFooter();
  const services = await getAllServices();
  const publishedServices = await getServices();
  return (
    <html lang="en">
      <head>
        {/* Meta Pixel Code */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '811967330404772');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=811967330404772&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
        {/* TrustedForm Web SDK */}
        <Script
          src="https://cdn.trustedform.com/tf.min.js"
          strategy="afterInteractive"
        />
        <Script id="trustedform-init" strategy="afterInteractive">
          {`
            (function(){
              var tf = document.createElement('script');
              tf.type = 'text/javascript';
              tf.async = true;
              tf.src = 'https://cdn.trustedform.com/your_script.js&field=xxTrustedFormCertUrl';
              var s = document.getElementsByTagName('script')[0];
              s.parentNode.insertBefore(tf, s);
            })();
          `}
        </Script>
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar
          header={header}
          services={services}
          publishedServices={publishedServices}
        />
        <main className="flex-grow">{children}</main>
        <Footer footer={footer} />
        <Toaster />
      </body>
    </html>
  );
}
