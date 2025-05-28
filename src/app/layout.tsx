"use client";

import { useSession } from "next-auth/react";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  // Enquanto carrega, pode mostrar algo neutro
  if (status === "loading") {
    return <div>Carregando...</div>;
  }

  const isLoggedIn = !!session;

  return (
    <html lang="en">
      <body className={`${figtree.className} antialiased`}>
        <SessionWrapper>
          {isLoggedIn && (
            <>
              <div className="hidden md:flex fixed top-0 left-0 bottom-0 w-64">
                <Sidebar />
              </div>

              <div className="fixed top-0 left-0 right-0 h-16 z-50">
                <Header />
              </div>

              <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
                <MobileNav />
              </div>
            </>
          )}

          <main
            className={`${isLoggedIn ? "md:ml-64 pt-16" : ""} p-4 min-h-screen`}
          >
            {children}
          </main>
        </SessionWrapper>
      </body>
    </html>
  );
}
