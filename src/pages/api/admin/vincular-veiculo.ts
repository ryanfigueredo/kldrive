import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { userId, vehicleId } = req.body;

  if (!userId || !vehicleId) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { user: { connect: { id: userId } } },
  });

  return res.status(200).json({ success: true });
}
