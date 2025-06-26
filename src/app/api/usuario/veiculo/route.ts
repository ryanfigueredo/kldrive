import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: token.sub ?? "" },
    include: {
      vehicle: true, // ✅ relacionamento 1:1
    },
  });

  if (!user || !user.vehicle) {
    return NextResponse.json(null); // sem veículo vinculado
  }

  return NextResponse.json(user.vehicle);
}
