// src/app/api/admin/usuarios/route.ts

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
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

  return NextResponse.json(usuarios);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, role, vehicleId } = body;

  if (!email || !role) {
    return NextResponse.json(
      { error: "Email e cargo são obrigatórios." },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json(
      { error: "E-mail já está cadastrado." },
      { status: 400 }
    );
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role,
      vehicles: vehicleId
        ? {
            connect: {
              id: vehicleId,
            },
          }
        : undefined,
      password: "senhaDoEmail", // senha padrão
    },
  });

  return NextResponse.json(user, { status: 201 });
}
