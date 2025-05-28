"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Home, Car, Fuel, BarChart2, User } from "lucide-react";

export default function MobileNav() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-[#242424] text-white py-3 px-6 roundedfull shadow-lg flex justify-between items-center">
      <Link href="/dashboard" className="flex flex-col items-center gap-1 ">
        <Home className="w-5 h-5" />
      </Link>

      <Link
        href="/quilometragem/novo"
        className="flex flex-col items-center gap-1 "
      >
        <Car className="w-5 h-5" />
      </Link>

      <Link
        href="/abastecimento/novo"
        className="flex flex-col items-center gap-1 "
      >
        <Fuel className="w-5 h-5" />
      </Link>

      {isAdmin && (
        <Link href="/admin" className="flex flex-col items-center gap-1 ">
          <BarChart2 className="w-5 h-5" />
        </Link>
      )}

      <Link href="/perfil" className="flex flex-col items-center gap-1 ">
        <User className="w-5 h-5" />
      </Link>
    </nav>
  );
}
