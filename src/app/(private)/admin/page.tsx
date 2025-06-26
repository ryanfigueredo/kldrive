import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import AdminPerfil from "@/components/AdminPerfil";
import { type Session } from "next-auth";

export default async function AdminPage() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session || !session.user) {
    return (
      <p className="p-4 text-center">
        Você precisa estar logado para acessar esta página.
      </p>
    );
  }

  return <AdminPerfil session={session as Session} />;
}
