import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const usuario = searchParams.get("usuario");
    const veiculo = searchParams.get("veiculo");

    // Configurar filtros de data
    const dateFilterExclusive: { gte?: Date; lt?: Date } = {};
    if (startDate) dateFilterExclusive.gte = new Date(startDate + "T00:00:00");
    if (endDate) {
      const end = new Date(endDate + "T00:00:00");
      dateFilterExclusive.lt = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    }

    // Se não foi informado período, aplica mês atual
    if (!startDate && !endDate) {
      const now = new Date();
      const startOfCurrentMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
      const startOfNextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
      );
      dateFilterExclusive.gte = startOfCurrentMonth;
      dateFilterExclusive.lt = startOfNextMonth;
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

    // Buscar todas as rotas ordenadas por data
    const rotas = await prisma.rotaRecord.findMany({
      where: filtros,
      include: {
        user: true,
        vehicle: true,
      },
      orderBy: [{ vehicleId: "asc" }, { createdAt: "asc" }],
    });

    console.log(` Encontradas ${rotas.length} rotas para análise`);

    // Calcular KM por veículo e por usuário
    const kmPorVeiculo: Record<string, number> = {};
    const kmPorUsuario: Record<string, number> = {};
    const detalhesPorVeiculo: Record<
      string,
      Array<{
        data: Date;
        kmSaida: number;
        kmRodado?: number;
        usuario: string;
        partida: string;
        destino: string;
      }>
    > = {};

    // Agrupar rotas por veículo
    const rotasPorVeiculo: Record<string, typeof rotas> = {};
    rotas.forEach((rota) => {
      if (!rotasPorVeiculo[rota.vehicleId]) {
        rotasPorVeiculo[rota.vehicleId] = [];
      }
      rotasPorVeiculo[rota.vehicleId].push(rota);
    });

    // Calcular KM para cada veículo
    Object.entries(rotasPorVeiculo).forEach(([, rotasDoVeiculo]) => {
      const placa = rotasDoVeiculo[0]?.vehicle?.placa || "Desconhecido";
      let kmTotalVeiculo = 0;

      if (!detalhesPorVeiculo[placa]) {
        detalhesPorVeiculo[placa] = [];
      }

      // Ordenar rotas por data para calcular diferenças corretas
      rotasDoVeiculo.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );

      rotasDoVeiculo.forEach((rota, index) => {
        const usuario = rota.user?.name || "Desconhecido";
        let kmRodado = 0;

        // Se não é a primeira rota, calcular diferença com a anterior
        if (index > 0) {
          const rotaAnterior = rotasDoVeiculo[index - 1];
          kmRodado = rota.kmSaida - rotaAnterior.kmSaida;

          // Validar se o KM é positivo (não pode ser negativo)
          if (kmRodado > 0) {
            kmTotalVeiculo += kmRodado;
            kmPorUsuario[usuario] = (kmPorUsuario[usuario] || 0) + kmRodado;
          }
        }

        detalhesPorVeiculo[placa].push({
          data: rota.createdAt,
          kmSaida: rota.kmSaida,
          kmRodado: index > 0 ? kmRodado : undefined,
          usuario,
          partida: rota.partida,
          destino: rota.destino,
        });
      });

      kmPorVeiculo[placa] = kmTotalVeiculo;
    });

    // Calcular totais
    const totalKmRodados = Object.values(kmPorVeiculo).reduce(
      (acc, km) => acc + km,
      0
    );
    const totalRotas = rotas.length;
    const totalUsuarios = Object.keys(kmPorUsuario).length;
    const totalVeiculos = Object.keys(kmPorVeiculo).length;

    // Top 5 usuários por KM
    const topUsuarios = Object.entries(kmPorUsuario)
      .map(([usuario, km]) => ({ usuario, km }))
      .sort((a, b) => b.km - a.km)
      .slice(0, 5);

    // Top 5 veículos por KM
    const topVeiculos = Object.entries(kmPorVeiculo)
      .map(([placa, km]) => ({ placa, km }))
      .sort((a, b) => b.km - a.km)
      .slice(0, 5);

    console.log(`📊 Métricas calculadas:`, {
      totalKmRodados,
      totalRotas,
      totalUsuarios,
      totalVeiculos,
      topUsuarios: topUsuarios.slice(0, 3),
      topVeiculos: topVeiculos.slice(0, 3),
    });

    return NextResponse.json({
      totalKmRodados,
      totalRotas,
      totalUsuarios,
      totalVeiculos,
      kmPorVeiculo,
      kmPorUsuario,
      detalhesPorVeiculo,
      topUsuarios,
      topVeiculos,
      periodo: {
        inicio: dateFilterExclusive.gte,
        fim: dateFilterExclusive.lt,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao calcular métricas de rota:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
