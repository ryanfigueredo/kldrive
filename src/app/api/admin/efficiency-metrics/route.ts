import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Configurar filtros de data
    const dateFilterExclusive: { gte?: Date; lt?: Date } = {};
    if (startDate) dateFilterExclusive.gte = new Date(startDate + "T00:00:00");
    if (endDate) {
      const end = new Date(endDate + "T00:00:00");
      dateFilterExclusive.lt = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    }

    const filtros: {
      createdAt?: typeof dateFilterExclusive;
    } = {};

    if (Object.keys(dateFilterExclusive).length)
      filtros.createdAt = dateFilterExclusive;

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Se não foi informado período, aplica mês atual
    if (!startDate && !endDate) {
      filtros.createdAt = { gte: startOfCurrentMonth, lt: startOfNextMonth };
    }

    // Buscar dados de KM, rotas e abastecimentos
    const [kmRecords, rotas, abastecimentos] = await Promise.all([
      prisma.kmRecord.findMany({
        where: filtros,
        include: {
          user: true,
          vehicle: {
            include: {
              users: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.rotaRecord.findMany({
        where: filtros,
        include: {
          user: true,
          vehicle: {
            include: {
              users: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.fuelRecord.findMany({
        where: filtros,
        include: {
          user: true,
          vehicle: {
            include: {
              users: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Calcular métricas por veículo
    const metricsByVehicle: Record<
      string,
      {
        placa: string;
        modelo?: string;
        totalKm: number;
        totalGasto: number;
        totalLitros: number;
        custoPorKm: number;
        consumoMedio: number; // km/litro
        motoristas: string[];
        registros: number;
      }
    > = {};

    // Processar registros de KM - usar soma simples dos valores
    kmRecords.forEach((kmRecord) => {
      const vehicleId = kmRecord.vehicleId;
      if (!metricsByVehicle[vehicleId]) {
        metricsByVehicle[vehicleId] = {
          placa: kmRecord.vehicle?.placa || "Desconhecido",
          modelo: kmRecord.vehicle?.modelo || undefined,
          totalKm: 0,
          totalGasto: 0,
          totalLitros: 0,
          custoPorKm: 0,
          consumoMedio: 0,
          motoristas: [],
          registros: 0,
        };
      }

      // Adicionar motorista se não estiver na lista
      const motorista = kmRecord.user?.name || "Desconhecido";
      if (!metricsByVehicle[vehicleId].motoristas.includes(motorista)) {
        metricsByVehicle[vehicleId].motoristas.push(motorista);
      }

      metricsByVehicle[vehicleId].totalKm += kmRecord.km;
      metricsByVehicle[vehicleId].registros++;
    });

    // Processar rotas para adicionar KM de saída (se não houver KmRecord)
    rotas.forEach((rota) => {
      const vehicleId = rota.vehicleId;
      if (!metricsByVehicle[vehicleId]) {
        metricsByVehicle[vehicleId] = {
          placa: rota.vehicle?.placa || "Desconhecido",
          modelo: rota.vehicle?.modelo || undefined,
          totalKm: 0,
          totalGasto: 0,
          totalLitros: 0,
          custoPorKm: 0,
          consumoMedio: 0,
          motoristas: [],
          registros: 0,
        };
      }

      // Adicionar motorista se não estiver na lista
      const motorista = rota.user?.name || "Desconhecido";
      if (!metricsByVehicle[vehicleId].motoristas.includes(motorista)) {
        metricsByVehicle[vehicleId].motoristas.push(motorista);
      }

      // Para rotas, consideramos o kmSaida como referência, mas não somamos diretamente
      // pois pode ser um valor absoluto do odômetro
      metricsByVehicle[vehicleId].registros++;
    });

    // Processar abastecimentos para calcular gastos e litros
    abastecimentos.forEach((abastecimento) => {
      const vehicleId = abastecimento.vehicleId;
      if (!metricsByVehicle[vehicleId]) {
        metricsByVehicle[vehicleId] = {
          placa: abastecimento.vehicle?.placa || "Desconhecido",
          modelo: abastecimento.vehicle?.modelo || undefined,
          totalKm: 0,
          totalGasto: 0,
          totalLitros: 0,
          custoPorKm: 0,
          consumoMedio: 0,
          motoristas: [],
          registros: 0,
        };
      }

      metricsByVehicle[vehicleId].totalGasto += abastecimento.valor;
      metricsByVehicle[vehicleId].totalLitros += abastecimento.litros;
    });

    // Calcular métricas derivadas
    Object.values(metricsByVehicle).forEach((metric) => {
      if (metric.totalKm > 0) {
        metric.custoPorKm = metric.totalGasto / metric.totalKm;
      }
      if (metric.totalLitros > 0) {
        metric.consumoMedio = metric.totalKm / metric.totalLitros;
      }
    });

    // Calcular métricas por motorista
    const metricsByDriver: Record<
      string,
      {
        nome: string;
        totalKm: number;
        totalGasto: number;
        totalLitros: number;
        custoPorKm: number;
        consumoMedio: number;
        veiculos: string[];
        registros: number;
      }
    > = {};

    // Processar registros de KM por motorista - usar soma simples
    kmRecords.forEach((kmRecord) => {
      const motorista = kmRecord.user?.name || "Desconhecido";
      if (!metricsByDriver[motorista]) {
        metricsByDriver[motorista] = {
          nome: motorista,
          totalKm: 0,
          totalGasto: 0,
          totalLitros: 0,
          custoPorKm: 0,
          consumoMedio: 0,
          veiculos: [],
          registros: 0,
        };
      }

      // Adicionar veículo se não estiver na lista
      const placa = kmRecord.vehicle?.placa || "Desconhecido";
      if (!metricsByDriver[motorista].veiculos.includes(placa)) {
        metricsByDriver[motorista].veiculos.push(placa);
      }

      metricsByDriver[motorista].totalKm += kmRecord.km;
      metricsByDriver[motorista].registros++;
    });

    // Processar abastecimentos para adicionar gastos e litros por motorista
    abastecimentos.forEach((abastecimento) => {
      const motorista = abastecimento.user?.name || "Desconhecido";
      if (!metricsByDriver[motorista]) {
        metricsByDriver[motorista] = {
          nome: motorista,
          totalKm: 0,
          totalGasto: 0,
          totalLitros: 0,
          custoPorKm: 0,
          consumoMedio: 0,
          veiculos: [],
          registros: 0,
        };
      }

      // Adicionar veículo se não estiver na lista
      const placa = abastecimento.vehicle?.placa || "Desconhecido";
      if (!metricsByDriver[motorista].veiculos.includes(placa)) {
        metricsByDriver[motorista].veiculos.push(placa);
      }

      metricsByDriver[motorista].totalGasto += abastecimento.valor;
      metricsByDriver[motorista].totalLitros += abastecimento.litros;
      metricsByDriver[motorista].registros++;
    });

    // Processar rotas para adicionar registros por motorista
    rotas.forEach((rota) => {
      const motorista = rota.user?.name || "Desconhecido";
      if (!metricsByDriver[motorista]) {
        metricsByDriver[motorista] = {
          nome: motorista,
          totalKm: 0,
          totalGasto: 0,
          totalLitros: 0,
          custoPorKm: 0,
          consumoMedio: 0,
          veiculos: [],
          registros: 0,
        };
      }

      // Adicionar veículo se não estiver na lista
      const placa = rota.vehicle?.placa || "Desconhecido";
      if (!metricsByDriver[motorista].veiculos.includes(placa)) {
        metricsByDriver[motorista].veiculos.push(placa);
      }

      metricsByDriver[motorista].registros++;
    });

    // Calcular métricas derivadas por motorista
    Object.values(metricsByDriver).forEach((metric) => {
      if (metric.totalKm > 0) {
        metric.custoPorKm = metric.totalGasto / metric.totalKm;
      }
      if (metric.totalLitros > 0) {
        metric.consumoMedio = metric.totalKm / metric.totalLitros;
      }
    });

    // Calcular métricas de frota
    const fleetMetrics = {
      totalVeiculos: Object.keys(metricsByVehicle).length,
      totalMotoristas: Object.keys(metricsByDriver).length,
      totalKm: Object.values(metricsByVehicle).reduce(
        (acc, m) => acc + m.totalKm,
        0
      ),
      totalGasto: Object.values(metricsByVehicle).reduce(
        (acc, m) => acc + m.totalGasto,
        0
      ),
      totalLitros: Object.values(metricsByVehicle).reduce(
        (acc, m) => acc + m.totalLitros,
        0
      ),
      consumoMedioFrota: 0,
      custoMedioPorKm: 0,
    };

    if (fleetMetrics.totalLitros > 0) {
      fleetMetrics.consumoMedioFrota =
        fleetMetrics.totalKm / fleetMetrics.totalLitros;
    }
    if (fleetMetrics.totalKm > 0) {
      fleetMetrics.custoMedioPorKm =
        fleetMetrics.totalGasto / fleetMetrics.totalKm;
    }

    // Identificar veículos do mesmo modelo para comparação
    const vehiclesByModel: Record<string, typeof metricsByVehicle> = {};
    Object.values(metricsByVehicle).forEach((metric) => {
      const modelo = metric.modelo || "Desconhecido";
      if (!vehiclesByModel[modelo]) {
        vehiclesByModel[modelo] = {};
      }
      vehiclesByModel[modelo][metric.placa] = metric;
    });

    // Filtrar apenas modelos com mais de um veículo
    const modelComparisons = Object.entries(vehiclesByModel)
      .filter(([, vehicles]) => Object.keys(vehicles).length > 1)
      .map(([modelo, vehicles]) => ({
        modelo,
        veiculos: Object.values(vehicles),
        melhorConsumo: Math.max(
          ...Object.values(vehicles).map((v) => v.consumoMedio)
        ),
        piorConsumo: Math.min(
          ...Object.values(vehicles).map((v) => v.consumoMedio)
        ),
        diferencaConsumo: 0,
      }));

    // Calcular diferença de consumo
    modelComparisons.forEach((comparison) => {
      if (comparison.melhorConsumo > 0 && comparison.piorConsumo > 0) {
        comparison.diferencaConsumo =
          comparison.melhorConsumo - comparison.piorConsumo;
      }
    });

    console.log("🔎 DEBUG efficiency metrics:", {
      totalKmRecords: kmRecords.length,
      totalRotas: rotas.length,
      totalAbastecimentos: abastecimentos.length,
      vehiclesWithData: Object.keys(metricsByVehicle).length,
      driversWithData: Object.keys(metricsByDriver).length,
      fleetMetrics,
      sampleKmRecord: kmRecords[0],
      sampleFuelRecord: abastecimentos[0],
      sampleRotaRecord: rotas[0],
    });

    return NextResponse.json({
      metricsByVehicle: Object.values(metricsByVehicle),
      metricsByDriver: Object.values(metricsByDriver),
      fleetMetrics,
      modelComparisons,
      metaConsumo: 10, // Meta padrão de 10 km/litro
    });
  } catch (error) {
    console.error("Erro na API de métricas de eficiência:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
