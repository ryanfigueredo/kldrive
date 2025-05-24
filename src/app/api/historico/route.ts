import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token)
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const userEmail = token.email!;

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true },
  });

  if (!user)
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 }
    );

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

  return NextResponse.json({ kmRecords, fuelRecords });
}
