import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
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

  return NextResponse.json({ veiculos, usuarios });
}
