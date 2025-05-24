import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import SessionWrapper from "@/components/SessionWrapper";
import MobileNav from "@/components/MobileNav";

const inter = Inter({
  subsets: ["latin"],
  weight: ["600"],
});
export const metadata: Metadata = {
  title: "KL Drive",
  description: "Controle de quilometragem e abastecimento",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {" "}
        <SessionWrapper>
          {children}
          <div className="block md:hidden">
            <MobileNav />
          </div>
        </SessionWrapper>
      </body>
    </html>
  );
}
