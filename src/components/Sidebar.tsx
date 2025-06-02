import Link from "next/link";
import {
  Home,
  Car,
  Fuel,
  BarChart2,
  User,
  Bell,
  Calendar,
  Plus,
} from "lucide-react";

export function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-full w-16 text-white bg-[#242424] flex flex-col items-center py-4  shadow-lg">
      <nav className="flex py-28 flex-col gap-8 text-white ">
        <SidebarNavLink
          href="/dashboard"
          icon={<Home size={24} />}
          label="Dashboard"
        />
        <SidebarNavLink
          href="/quilometragem/novo"
          icon={<Car size={24} />}
          label="KM"
        />
        <SidebarNavLink
          href="/abastecimento/novo"
          icon={<Fuel size={24} />}
          label="Abastecer"
        />
        <SidebarNavLink
          href="/admin"
          icon={<BarChart2 size={24} />}
          label="Admin"
        />
        <SidebarNavLink
          href="/perfil"
          icon={<User size={24} />}
          label="Perfil"
        />
      </nav>
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

export function Header() {
  return (
    <header className="fixed top-0 left-16 right-0 h-16 bg-white shadow-md text-white flex items-center justify-between px-6">
      <div className="flex items-center gap-4 text-gray-700">
        <button
          aria-label="Adicionar"
          className="p-2 roundedsm hover:bg-gray-200"
        >
          <Plus size={20} />
        </button>
        <button
          aria-label="Notificações"
          className="p-2 roundedsm hover:bg-gray-200"
        >
          <Bell size={20} />
        </button>
        <button
          aria-label="Calendário"
          className="p-2 roundedsm hover:bg-gray-200"
        >
          <Calendar size={20} />
        </button>
        <div
          className="w-8 h-8 roundedsm bg-gray-300"
          title="Avatar do Usuário"
        />
      </div>
    </header>
  );
}
