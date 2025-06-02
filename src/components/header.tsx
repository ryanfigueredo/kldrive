"use client";

import Image from "next/image";
import { Bell, Calendar, Plus } from "lucide-react";

export default function Header() {
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
      </div>
    </header>
  );
}
