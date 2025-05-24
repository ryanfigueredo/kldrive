import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  if (!token) return res.status(401).json({ error: "Não autenticado" });

  // (opcional) limitar só a admins aqui

  const [kmRecords, fuelRecords] = await Promise.all([
    prisma.kmRecord.findMany({
      include: {
        user: true,
        vehicle: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.fuelRecord.findMany({
      include: {
        user: true,
        vehicle: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const registros = [
    ...kmRecords.map((r) => ({
      id: r.id,
      tipo: "KM",
      placa: r.vehicle?.placa ?? "—",
      usuario: r.user?.email ?? "—",
      valor: 0,
      km: r.km,
      imagem: r.photoUrl,
      data: r.createdAt,
    })),
    ...fuelRecords.map((r) => ({
      id: r.id,
      tipo: "ABASTECIMENTO",
      placa: r.vehicle?.placa ?? "—",
      usuario: r.user?.email ?? "—",
      valor: r.valor,
      km: r.kmAtual,
      imagem: r.photoUrl,
      data: r.createdAt,
    })),
  ];

  return res.status(200).json(registros);
}
