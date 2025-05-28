import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

import SessionWrapper from "@/components/SessionWrapper";
import MobileNav from "@/components/MobileNav";

import Header from "@/components/header";
import { Sidebar } from "@/components/Sidebar";

const figtree = Figtree({
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
      <body className={`${figtree.className} antialiased`}>
        {" "}
        <SessionWrapper>
          <div className="hidden md:flex fixed top-0 left-0 bottom-0 w-64">
            <Sidebar />
          </div>

          {/* Header fixo sempre no topo */}
          <div className="fixed top-0 left-0 right-0 h-16 z-50">
            <Header />
          </div>

          {/* Mobile nav apenas mobile */}
          <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
            <MobileNav />
          </div>

          <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
            <MobileNav />
          </div>

          <main className="md:m-24 min-h-screen">{children}</main>
        </SessionWrapper>
      </body>
    </html>
  );
}
