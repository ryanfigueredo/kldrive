import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: token.email },
    include: { vehicle: true },
  });

  if (!user || !user.vehicle) {
    return NextResponse.json({ resumo: null, abastecimentos: [] });
  }

  const fuelRecords = await prisma.fuelRecord.findMany({
    where: {
      userId: user.id,
      vehicleId: user.vehicle.id,
    },
    orderBy: { createdAt: "asc" },
  });

  const totalGasto = fuelRecords.reduce((sum, r) => sum + r.valor, 0);
  const totalLitros = fuelRecords.reduce((sum, r) => sum + r.litros, 0);
  const totalKm =
    fuelRecords.length > 0
      ? fuelRecords[fuelRecords.length - 1].kmAtual - fuelRecords[0].kmAtual
      : 0;

  const resumo = {
    totalGasto,
    abastecimentos: fuelRecords.length,
    totalKm,
    mediaPorLitro: totalKm > 0 ? totalKm / totalLitros : 0,
  };

  return NextResponse.json({
    resumo,
    abastecimentos: fuelRecords.map((r) => ({
      id: r.id,
      litros: r.litros,
      valor: r.valor,
      kmAtual: r.kmAtual,
      situacaoTanque: r.situacaoTanque,
      observacao: r.observacao,
      createdAt: r.createdAt,
      photoUrl: r.photoUrl,
    })),
  });
}
