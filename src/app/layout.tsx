import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import { PostHogProvider } from "@/providers/PostHogProvider";

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
  return (
    <html lang="en">
      <head>
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
          <Toaster />
        </PostHogProvider>
      </body>
    </html>
  );
}
