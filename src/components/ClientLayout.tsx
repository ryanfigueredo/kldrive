"use client";

import { Session } from "next-auth";
import { ReactNode } from "react";

import { Sidebar } from "./Sidebar";
import Header from "./header";
import MobileNav from "./MobileNav";

interface ClientLayoutProps {
  session: Session | null;
  children: ReactNode;
}

export default function ClientLayout({ session, children }: ClientLayoutProps) {
  const isLoggedIn = !!session;

  return (
    <>
      {isLoggedIn && (
        <>
          <div className="hidden md:flex fixed top-0 left-0 bottom-0 w-64">
            <Sidebar session={session} /> {/* ✅ Sessão passada direto */}
          </div>

          <div className="fixed top-0 left-0 right-0 h-16 z-50">
            <Header />
          </div>

          <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
            <MobileNav session={session} />
          </div>
        </>
      )}

      <main
        className={`${isLoggedIn ? "md:ml-64 pt-16" : ""} p-4 min-h-screen`}
      >
        {children}
      </main>
    </>
  );
}
