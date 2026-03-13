import Navbar from "@/components/Shared/Navbar/Navbar";
import {
  fetchHeader,
} from "@/lib/api";



export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [header] = await Promise.all([
    fetchHeader(),
  ]);

  return (
      <div>
          <Navbar
            header={header}
          />
          {children}
      </div>
  );
}
