import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coins App",
  description: "A simple app to track your coins",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`antialiased m-0 p-0 box-border`}
      >
        {children}
      </body>
    </html>
  );
}
