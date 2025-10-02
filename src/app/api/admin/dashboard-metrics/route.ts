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

  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfCurrentMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  // Se não foi informado período, aplica mês atual ANTES de buscar
  if (!startDate && !endDate) {
    filtros.createdAt = { gte: startOfCurrentMonth, lte: endOfCurrentMonth };
  }

  // Mês atual (ou período filtrado)
  const [km, fuel] = await Promise.all([
    prisma.kmRecord.findMany({ where: filtros, include: { user: true } }),
    prisma.fuelRecord.findMany({ where: filtros, include: { user: true } }),
  ]);

  // Mês anterior
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59
  );

  const filtrosMesAnterior: typeof filtros = {
    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
  };
  if (usuario) filtrosMesAnterior.userId = usuario;
  if (veiculo) filtrosMesAnterior.vehicleId = veiculo;

  const [kmAnterior, fuelAnterior] = await Promise.all([
    prisma.kmRecord.findMany({ where: filtrosMesAnterior }),
    prisma.fuelRecord.findMany({ where: filtrosMesAnterior }),
  ]);

  const totalKm = km.reduce((acc, r) => acc + r.km, 0);
  const totalValorAbastecido = fuel.reduce((acc, r) => acc + r.valor, 0);

  const totalPorTipo = {
    KM: km.length,
    ABASTECIMENTO: fuel.length,
  };

  const kmPorData: Record<string, number> = {};
  km.forEach((r) => {
    const dia = r.createdAt.toISOString().split("T")[0];
    kmPorData[dia] = (kmPorData[dia] ?? 0) + r.km;
  });

  const abastecimentoPorVeiculo: Record<string, number> = {};
  fuel.forEach((r) => {
    const placa = r.vehicleId ?? "Desconhecido";
    abastecimentoPorVeiculo[placa] =
      (abastecimentoPorVeiculo[placa] ?? 0) + r.valor;
  });

  const abastecimentoPorDataPorUsuario: Record<
    string,
    Record<string, number>
  > = {};
  fuel.forEach((r) => {
    const dia = r.createdAt.toISOString().split("T")[0];
    const usuario = r.user?.email ?? "desconhecido";

    if (!abastecimentoPorDataPorUsuario[dia]) {
      abastecimentoPorDataPorUsuario[dia] = {};
    }

    abastecimentoPorDataPorUsuario[dia][usuario] =
      (abastecimentoPorDataPorUsuario[dia][usuario] ?? 0) + r.valor;
  });

  const historicoComparativo = {
    kmAnterior: kmAnterior?.reduce((acc, r) => acc + r.km, 0) ?? 0,
    valorAbastecidoAnterior:
      fuelAnterior?.reduce((acc, r) => acc + r.valor, 0) ?? 0,
    qtdKmAnterior: kmAnterior?.length ?? 0,
    qtdAbastecimentoAnterior: fuelAnterior?.length ?? 0,
  };

  console.log("🔎 DEBUG metrics:", {
    totalKm,
    totalValorAbastecido,
    totalPorTipo,
    historicoComparativo,
  });

  return NextResponse.json({
    totalKm,
    totalValorAbastecido,
    totalPorTipo,
    kmPorData,
    abastecimentoPorVeiculo,
    abastecimentoPorDataPorUsuario,
    historicoComparativo: {
      kmAnterior: kmAnterior?.reduce((acc, r) => acc + r.km, 0) ?? 0,
      valorAbastecidoAnterior:
        fuelAnterior?.reduce((acc, r) => acc + r.valor, 0) ?? 0,
      qtdKmAnterior: kmAnterior?.length ?? 0,
      qtdAbastecimentoAnterior: fuelAnterior?.length ?? 0,
    },
  });
}
