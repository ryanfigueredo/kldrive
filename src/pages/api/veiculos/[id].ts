// src/pages/api/veiculos/[id].ts
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "ID inválido" });
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    select: { id: true, placa: true, modelo: true },
  });

  if (!vehicle) {
    return res.status(404).json({ error: "Veículo não encontrado" });
  }

  return res.status(200).json(vehicle);
}
