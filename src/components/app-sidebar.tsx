"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Home, Car, Fuel, BarChart2, User } from "lucide-react";

export function AppSidebar() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <Sidebar
      collapsible="icon"
      className="bg-[hsl(var(--sidebar-background))]  border-none shadow-md"
    >
      <SidebarHeader className="">
        <div className="mb-6 flex flex-col mt-4 items-center gap-2">
          <Image
            src="/logo-kl.svg"
            alt="KL Facilities"
            width={120}
            height={50}
          />
          <h1 className="text-xl font-bold">KL Drive</h1>
          <p className="text-sm text-gray-400 text-center">
            Controle de quilometragem e abastecimento
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent className=" py-4">
        <SidebarGroup className="">
          <SidebarNavLink href="/dashboard" icon={<Home className="w-5 h-5" />}>
            Dashboard
          </SidebarNavLink>

          <SidebarNavLink
            href="/quilometragem/novo"
            icon={<Car className="w-5 h-5" />}
          >
            Registrar Quilometragem
          </SidebarNavLink>

          <SidebarNavLink
            href="/abastecimento/novo"
            icon={<Fuel className="w-5 h-5" />}
          >
            Registrar Abastecimento
          </SidebarNavLink>

          {isAdmin && (
            <SidebarNavLink
              href="/admin"
              icon={<BarChart2 className="w-5 h-5" />}
            >
              Admin
            </SidebarNavLink>
          )}

          <SidebarNavLink href="/perfil" icon={<User className="w-5 h-5" />}>
            Perfil
          </SidebarNavLink>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className=" text-gray-500">
        <p className="text-xs ">v1.0.0 - KL HOLDING - SISTEMAS</p>
      </SidebarFooter>
    </Sidebar>
  );
}

interface SidebarNavLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SidebarNavLink({ href, icon, children }: SidebarNavLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-none hover:bg-[#c8d22c] hover: transition-colors"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
