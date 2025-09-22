import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import AdminPerfil from "@/components/AdminPerfil";
import { type Session } from "next-auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session || !session.user) {
    return (
      <p className="p-4 text-center">
        Você precisa estar logado para acessar esta página.
      </p>
    );
  }

  const [rotasRaw, abastecimentosRaw] = await Promise.all([
    prisma.rotaRecord.findMany({
      include: {
        user: true,
        vehicle: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.fuelRecord.findMany({
      include: { user: true, vehicle: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Converte createdAt para string
  const rotas = rotasRaw.map((rota) => ({
    ...rota,
    createdAt: rota.createdAt.toISOString(),
  }));

  const abastecimentos = abastecimentosRaw.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <AdminPerfil
      session={session as Session}
      rotas={rotas}
      abastecimentos={abastecimentos}
    />
  );
}
