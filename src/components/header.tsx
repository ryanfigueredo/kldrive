"use client";

import Image from "next/image";
import { Bell, Calendar, Plus } from "lucide-react"; // ícones que você pode usar
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between bg-white text-white p-2 shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image src="/logo-kl.svg" alt="KL Facilities" width={80} height={40} />
      </div>

      {/* Search (opcional, pode remover se quiser) */}
      {/* <div className="flex-1 mx-2">
        <input
          type="search"
          placeholder="Pesquisar clientes, veículos e mais..."
          className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c8d22c]"
        />
      </div> */}

      {/* Ações e perfil */}
      <div className="flex items-center gap-4">
        <button
          className="rounded-md bg-[#c8d22c] p-2 hover:bg-[#a6b51f] transition-colors"
          aria-label="Adicionar"
        >
          <Plus className="w-5 h-5 text-gray-900" />
        </button>

        <button
          className="rounded-sm bg-gray-800 p-2 hover:bg-gray-700 transition-colors"
          aria-label="Notificações"
        >
          <Bell className="w-5 h-5 " />
        </button>

        <button
          className="rounded-sm bg-gray-800 p-2 hover:bg-gray-700 transition-colors"
          aria-label="Calendário"
        >
          <Calendar className="w-5 h-5 " />
        </button>

        {/* Perfil */}
        {session?.user && (
          <div className="relative group">
            <button className="flex items-center gap-2 rounded-sm bg-gray-800 p-2 hover:bg-gray-700 transition-colors">
              <span className=" font-semibold">
                {session.user.name ?? session.user.email}
              </span>
              {/* Você pode adicionar foto do usuário aqui */}
              <div className="w-8 h-8 bg-gray-600 rounded-sm overflow-hidden">
                {/* Exemplo de imagem de perfil */}
                <img
                  src={session.user.image ?? "/default-profile.png"}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              </div>
            </button>
            {/* Dropdown simples (exemplo) */}
            <div className="hidden group-hover:block absolute right-0 mt-2 w-40 bg-gray-800 rounded shadow-lg z-50">
              <button
                className="block w-full px-4 py-2 text-left  hover:bg-gray-700"
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
