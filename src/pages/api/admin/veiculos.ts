import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const veiculos = await prisma.vehicle.findMany({
    select: {
      id: true,
      placa: true,
      modelo: true,
    },
  });

  return res.status(200).json(veiculos);
}
