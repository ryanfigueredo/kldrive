"use client";

import Image from "next/image";
import Link from "next/link"; // Importa o Link
import { Bell, Calendar, Plus } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="hidden md:flex fixed top-0 left-16 right-0 h-16 bg-white shadow-md text-white  items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image src="/logo-kl.svg" alt="KL Facilities" width={80} height={40} />
      </div>

      {/* Ações e perfil */}
      <div className="flex items-center gap-4">
        <button
          className="roundedmd bg-[#c8d22c] p-2 hover:bg-[#a6b51f] transition-colors"
          aria-label="Adicionar"
        >
          <Plus className="w-5 h-5 text-gray-900" />
        </button>

        <button
          className="roundedsm bg-gray-800 p-2 hover:bg-gray-700 transition-colors"
          aria-label="Notificações"
        >
          <Bell className="w-5 h-5 " />
        </button>

        <button
          className="roundedsm bg-gray-800 p-2 hover:bg-gray-700 transition-colors"
          aria-label="Calendário"
        >
          <Calendar className="w-5 h-5 " />
        </button>

        {/* Perfil */}
        {session?.user && (
          <div className="relative group">
            <Link href="/perfil" passHref>
              <button className="flex items-center gap-2 roundedsm bg-gray-800 p-2 hover:bg-gray-700 transition-colors">
                <span className="font-semibold">
                  {session.user.name ?? session.user.email}
                </span>
                <div className="w-8 h-8 bg-gray-600 roundedsm overflow-hidden">
                  <img
                    src={session.user.image ?? "/default-profile.png"}
                    alt="Perfil"
                    className="w-full h-full object-cover"
                  />
                </div>
              </button>
            </Link>

            {/* Dropdown */}
            <div className="hidden group-hover:block absolute right-0 mt-2 w-40 bg-gray-800 rounded shadow-lg z-50">
              <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-700"
                onClick={() => signOut()}
              >
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
