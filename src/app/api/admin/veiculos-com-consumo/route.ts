import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const veiculos = await prisma.vehicle.findMany({
      include: {
        kmRecords: { select: { km: true } },
        fuelRecords: { select: { valor: true } },
      },
    });

    const formatado = veiculos.map((v) => ({
      id: v.id,
      placa: v.placa,
      modelo: v.modelo,
      totalKm: v.kmRecords?.reduce((acc, r) => acc + (r.km ?? 0), 0) ?? 0,
      totalCombustivel:
        v.fuelRecords?.reduce((acc, r) => acc + (r.valor ?? 0), 0) ?? 0,
    }));

    return NextResponse.json(formatado);
  } catch (error) {
    console.error("Erro ao buscar veículos:", error);
    return new Response("Erro interno", { status: 500 });
  }
}
