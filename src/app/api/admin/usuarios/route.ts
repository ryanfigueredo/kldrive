import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        vehicles: {
          select: {
            id: true,
            placa: true,
            modelo: true,
          },
        },
      },
    });

    return res.status(200).json(usuarios);
  }

  if (req.method === "POST") {
    const { name, email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: "Email e cargo são obrigatórios." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "E-mail já está cadastrado." });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: "senhaDoEmail", // mock por enquanto
      },
    });

    return res.status(201).json(user);
  }

  return res.status(405).json({ error: "Método não permitido." });
}
