"use client";

import Link from "next/link";
import { Home, Fuel, BarChart2 } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface MobileNavProps {
  session: Session;
}

export default function MobileNav({ session }: MobileNavProps) {
  const isAdmin = session.user.role === "ADMIN";
  const avatarUrl = session.user.image;
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-[#242424] text-white py-3 px-6 rounded-full shadow-lg flex justify-between items-center ">
      <Link href="/dashboard" className="flex flex-col items-center gap-1">
        <Home className="w-5 h-5" />
      </Link>

      <Link
        href="/abastecimento/novo"
        className="flex flex-col items-center gap-1"
      >
        <Fuel className="w-5 h-5" />
      </Link>

      {isAdmin && (
        <Link href="/admin" className="flex flex-col items-center gap-1">
          <BarChart2 className="w-5 h-5" />
        </Link>
      )}

      {/* Avatar + menu */}
      <div className="relative">
        <button onClick={() => setOpen((prev) => !prev)}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-white"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white text-black text-sm font-bold flex items-center justify-center">
              {session.user.name?.[0] ?? "?"}
            </div>
          )}
        </button>

        {open && (
          <div className="absolute bottom-12 right-0 bg-white text-black rounded shadow-md text-sm w-44 p-2">
            <button
              onClick={() => router.push("/perfil")}
              className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
            >
              Ver veículo vinculado
            </button>
            <button
              onClick={() => signOut()}
              className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 rounded"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
