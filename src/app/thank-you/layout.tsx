export const metadata = {
  title: "NEU Home Services - Thank You",
  description: "Thank you for your request. Your estimator will call you shortly.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
