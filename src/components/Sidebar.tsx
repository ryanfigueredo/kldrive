"use client";

import Link from "next/link";
import { Home, Fuel, BarChart2, Route } from "lucide-react";
import { Session } from "next-auth";
import { useState } from "react";

interface SidebarProps {
  session: Session;
}

export function Sidebar({ session }: SidebarProps) {
  const isAdmin = session.user.role === "ADMIN";
  const [, setOpen] = useState(false);

  return (
    <aside className="fixed top-0 left-0 h-full w-16 bg-[#242424] text-white flex flex-col justify-between py-4 items-center shadow-lg z-50">
      <nav className="flex flex-col gap-8 mt-28">
        <SidebarNavLink
          href="/dashboard"
          icon={<Home size={24} />}
          label="Dashboard"
        />
        <SidebarNavLink
          href="/abastecimento/novo"
          icon={<Fuel size={24} />}
          label="Abastecer"
        />

        <SidebarNavLink
          href="/rota/nova"
          icon={<Route size={24} />}
          label="Nova Rota"
        />

        {isAdmin && (
          <SidebarNavLink
            href="/admin"
            icon={<BarChart2 size={24} />}
            label="Admin"
          />
        )}
      </nav>

      {/* Avatar e Menu */}
      <div className="relative mb-4">
        <button onClick={() => setOpen((prev) => !prev)}>
          {session.user.image ? (
            <img
              src={session.user.image}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
          ) : (
            <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm">
              {session.user.name?.[0] ?? "?"}
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}

function SidebarNavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center text-xs hover:text-[#c8d22c] transition-colors"
    >
      {icon}
      <span className="mt-1">{label}</span>
    </Link>
  );
}
