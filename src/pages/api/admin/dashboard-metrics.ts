import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { startDate, endDate, usuario, veiculo } = req.query;

  // Corrigido para tipagem segura
  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (typeof startDate === "string") {
    dateFilter.gte = new Date(startDate + "T00:00:00");
  }
  if (typeof endDate === "string") {
    dateFilter.lte = new Date(endDate + "T23:59:59");
  }

  const userId = Array.isArray(usuario) ? usuario[0] : usuario;
  const vehicleId = Array.isArray(veiculo) ? veiculo[0] : veiculo;

  const filtros: {
    createdAt?: { gte?: Date; lte?: Date };
    userId?: string;
    vehicleId?: string;
  } = {};

  if (Object.keys(dateFilter).length) filtros.createdAt = dateFilter;
  if (userId) filtros.userId = userId;
  if (vehicleId) filtros.vehicleId = vehicleId;

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

  return res.status(200).json({
    totalKm,
    totalValorAbastecido,
    totalPorTipo,
    kmPorData,
    abastecimentoPorVeiculo,
  });
}
