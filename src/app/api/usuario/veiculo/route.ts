// src/app/api/usuario/veiculo/route.ts (Next.js app router)

import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: token.sub ?? "" },
    include: {
      vehicles: true, // inclui veículos vinculados
    },
  });

  if (!user || user.vehicles.length === 0) {
    return NextResponse.json(null); // sem veículo vinculado
  }

  // retorna o primeiro veículo vinculado (se for 1:1)
  const vehicle = user.vehicles[0];
  return NextResponse.json(vehicle);
}
