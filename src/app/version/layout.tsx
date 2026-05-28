import Footer from "@/components/Shared/Footer/Footer";
import { fetchFooter } from "@/lib/api";

export default async function VersionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const footer = await fetchFooter();
  return (
    <>
      {children}
      <Footer footer={footer} />
    </>
  );
}
