import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const usuario = searchParams.get("usuario");
  const veiculo = searchParams.get("veiculo");

  // Usaremos intervalo [gte, lt) para evitar perdas/duplas por precisão/fuso
  const dateFilterExclusive: { gte?: Date; lt?: Date } = {};
  if (startDate) dateFilterExclusive.gte = new Date(startDate + "T00:00:00");
  if (endDate) {
    const end = new Date(endDate + "T00:00:00");
    // fim exclusivo = dia seguinte 00:00
    dateFilterExclusive.lt = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }

  const filtros: {
    createdAt?: typeof dateFilterExclusive;
    userId?: string;
    vehicleId?: string;
  } = {};

  if (Object.keys(dateFilterExclusive).length)
    filtros.createdAt = dateFilterExclusive;
  if (usuario) filtros.userId = usuario;
  if (veiculo) filtros.vehicleId = veiculo;

  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  // Limite superior exclusivo: primeiro dia do mês seguinte 00:00:00
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Se não foi informado período, aplica mês atual ANTES de buscar
  if (!startDate && !endDate) {
    filtros.createdAt = { gte: startOfCurrentMonth, lt: startOfNextMonth };
  }

  // Mês atual (ou período filtrado)
  const [km, fuel] = await Promise.all([
    prisma.kmRecord.findMany({ where: filtros, include: { user: true } }),
    prisma.fuelRecord.findMany({ where: filtros, include: { user: true } }),
  ]);

  // Mês anterior
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonthExclusive = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ); // primeiro dia do mês atual

  const filtrosMesAnterior: typeof filtros = {
    createdAt: { gte: startOfLastMonth, lt: endOfLastMonthExclusive },
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
