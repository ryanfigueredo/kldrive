import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const usuarios = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      vehicleId: true,
    },
  });

  return res.status(200).json(usuarios);
}
