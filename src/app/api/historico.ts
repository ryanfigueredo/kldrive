// src/pages/api/historico.ts
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  if (!token) return res.status(401).json({ error: "Não autenticado" });

  const userEmail = token.email!;

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true },
  });

  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  const kmRecords = await prisma.kmRecord.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const fuelRecords = await prisma.fuelRecord.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return res.status(200).json({ kmRecords, fuelRecords });
}
