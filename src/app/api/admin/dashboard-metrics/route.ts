import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const usuario = searchParams.get("usuario");
  const veiculo = searchParams.get("veiculo");

  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (startDate) dateFilter.gte = new Date(startDate + "T00:00:00");
  if (endDate) dateFilter.lte = new Date(endDate + "T23:59:59");

  const filtros: {
    createdAt?: typeof dateFilter;
    userId?: string;
    vehicleId?: string;
  } = {};

  if (Object.keys(dateFilter).length) filtros.createdAt = dateFilter;
  if (usuario) filtros.userId = usuario;
  if (veiculo) filtros.vehicleId = veiculo;

  const [km, fuel] = await Promise.all([
    prisma.kmRecord.findMany({ where: filtros }),
    prisma.fuelRecord.findMany({ where: filtros }),
  ]);

  const totalKm = km.reduce((acc, r) => acc + r.km, 0);
  const totalValorAbastecido = fuel.reduce((acc, r) => acc + r.valor, 0);

  const totalPorTipo = {
    KM: km.length,
    ABASTECIMENTO: fuel.length,
  };

  const kmPorData: Record<string, number> = {};
  km.forEach((r) => {
    const dia = new Date(r.createdAt).toLocaleDateString("pt-BR");
    kmPorData[dia] = (kmPorData[dia] ?? 0) + r.km;
  });

  const abastecimentoPorVeiculo: Record<string, number> = {};
  fuel.forEach((r) => {
    const placa = r.vehicleId ?? "Desconhecido";
    abastecimentoPorVeiculo[placa] =
      (abastecimentoPorVeiculo[placa] ?? 0) + r.valor;
  });

  return NextResponse.json({
    totalKm,
    totalValorAbastecido,
    totalPorTipo,
    kmPorData,
    abastecimentoPorVeiculo,
  });
}
