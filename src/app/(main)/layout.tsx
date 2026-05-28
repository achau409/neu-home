import Navbar from "@/components/Shared/Navbar/Navbar";
import Footer from "@/components/Shared/Footer/Footer";
import { fetchHeader, fetchFooter } from "@/lib/api";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [header, footer] = await Promise.all([
    fetchHeader(),
    fetchFooter(),
  ]);

  return (
    <>
      <header>
        <Navbar header={header} />
      </header>
      {children}
      <Footer footer={footer} />
    </>
  );
}
