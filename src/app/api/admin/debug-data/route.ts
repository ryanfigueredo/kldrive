import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Verificar dados básicos
    const [kmRecords, fuelRecords, rotaRecords, vehicles, users] =
      await Promise.all([
        prisma.kmRecord.findMany({
          take: 5,
          include: { user: true, vehicle: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.fuelRecord.findMany({
          take: 5,
          include: { user: true, vehicle: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.rotaRecord.findMany({
          take: 5,
          include: { user: true, vehicle: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.vehicle.findMany({
          take: 5,
          include: { users: true },
        }),
        prisma.user.findMany({
          take: 5,
          include: { vehicle: true },
        }),
      ]);

    // Contar totais
    const [totalKm, totalFuel, totalRotas, totalVehicles, totalUsers] =
      await Promise.all([
        prisma.kmRecord.count(),
        prisma.fuelRecord.count(),
        prisma.rotaRecord.count(),
        prisma.vehicle.count(),
        prisma.user.count(),
      ]);

    return NextResponse.json({
      totals: {
        kmRecords: totalKm,
        fuelRecords: totalFuel,
        rotaRecords: totalRotas,
        vehicles: totalVehicles,
        users: totalUsers,
      },
      samples: {
        kmRecords,
        fuelRecords,
        rotaRecords,
        vehicles,
        users,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar dados de debug:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
