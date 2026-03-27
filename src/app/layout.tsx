import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/Shared/Footer/Footer";
import Script from "next/script";
import { PostHogProvider } from "@/providers/PostHogProvider";
import { fetchFooter } from "@/lib/api";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ['400', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: "NEU Home Services",
  description: "A Neu way for Home Improvement Projects",
  keywords: "NEU Home Services, Home Improvement, Home Services, Home Improvement Projects, Home Improvement Contractors, Home Improvement Companies, Home Improvement Services, Home Improvement Contractors Near Me, Home Improvement Companies Near Me, Home Improvement Services Near Me, Home Improvement Contractors Near Me, Home Improvement Companies Near Me, Home Improvement Services Near Me",
  openGraph: {
    title: "NEU Home Services",
    description: "A Neu way for Home Improvement Projects",
    images: [
      { url: "https://www.neuhomeservices.com/images/logo.png" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NEU Home Services",
    description: "A Neu way for Home Improvement Projects",
    images: [
      { url: "https://www.neuhomeservices.com/images/logo.png" },
    ],
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  apple: {
    title: "NEU Home Services",
    description: "A Neu way for Home Improvement Projects",
    images: [
      { url: "https://www.neuhomeservices.com/images/logo.png" },
    ],
  },
  alternates: {
    canonical: "https://www.neuhomeservices.com",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [footer] = await Promise.all([
    fetchFooter(),
  ]);
  const pixelId = process.env.FACEBOOK_PIXEL_ID;
  const shouldLoadFacebookPixel =
    process.env.NODE_ENV === "production" && Boolean(pixelId);
  return (
    <html lang="en">
      <head>
        {/* Meta Pixel Code */}
        {shouldLoadFacebookPixel && (
          <>
            <Script id="facebook-pixel" strategy="lazyOnload">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelId}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
        {/* End Meta Pixel Code */}
        {/* TrustedForm Web SDK */}
        <Script
          src="https://cdn.trustedform.com/tf.min.js"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <PostHogProvider>
          <div className="flex-grow">{children}</div>
          <Footer footer={footer} />
          <Toaster />
        </PostHogProvider>
      </body>
    </html>
  );
}
