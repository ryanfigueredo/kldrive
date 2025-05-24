import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  const [veiculos, usuarios] = await Promise.all([
    prisma.vehicle.findMany({
      select: { id: true, placa: true },
      orderBy: { placa: "asc" },
    }),
    prisma.user.findMany({
      select: { id: true, email: true },
      orderBy: { email: "asc" },
    }),
  ]);

  res.status(200).json({ veiculos, usuarios });
}
