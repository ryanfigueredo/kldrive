"use client";

import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  Bar,
  Legend,
  BarChart,
  CartesianGrid,
} from "recharts";

import { ChartContainer, ChartTooltipContent } from "@/components/ui/charts";

interface GraficoData {
  kmPorData?: Record<string, number>;
}

interface Props {
  graficoData: GraficoData;
  abastecimentos?: Array<{
    createdAt: string;
    valor: number;
    user?: { name?: string; email?: string } | null;
    vehicle?: {
      users?: Array<{ name?: string; email?: string } | null>;
    } | null;
  }>;
}

export default function DashboardGraficos({
  graficoData,
  abastecimentos = [],
}: Props) {
  const dadosGraficoArea = graficoData.kmPorData
    ? Object.entries(graficoData.kmPorData).map(([data, km]) => ({ data, km }))
    : [];

  // Agrega consumo por usuário para um ranking simples (total por período)
  const consumoPorUsuario: Record<string, number> = {};
  for (const ab of abastecimentos) {
    const linkedUsers = ab.vehicle?.users
      ?.map((u) => u?.name)
      .filter(Boolean) as string[] | undefined;
    const usuarios =
      linkedUsers && linkedUsers.length > 0
        ? linkedUsers
        : [ab.user?.name || "Desconhecido"];
    const share = usuarios.length > 0 ? ab.valor / usuarios.length : ab.valor;
    usuarios.forEach((nome) => {
      consumoPorUsuario[nome] = (consumoPorUsuario[nome] ?? 0) + share;
    });
  }

  const dadosPorUsuario = Object.entries(consumoPorUsuario)
    .map(([usuario, valor]) => ({ usuario, valor }))
    .sort((a, b) => b.valor - a.valor);

  return (
    <div className="flex flex-col gap-6">
      {dadosGraficoArea.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">KM rodado por dia</h2>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dadosGraficoArea}>
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="km"
                  stroke="#B0BC1D"
                  fill="#B0BC1D"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )}

      {dadosPorUsuario.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Consumo de combustível por usuário (total)
          </h2>
          <ChartContainer>
            <ResponsiveContainer
              width="100%"
              height={40 * Math.max(4, dadosPorUsuario.length)}
            >
              <BarChart
                data={dadosPorUsuario}
                layout="vertical"
                margin={{ left: 24, right: 16, top: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `R$ ${Number(v).toFixed(0)}`}
                />
                <YAxis type="category" dataKey="usuario" width={160} />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={(v: number | string) =>
                        `R$ ${Number(v).toFixed(2)}`
                      }
                    />
                  }
                />
                <Bar dataKey="valor" fill="#5D9CEC" radius={[4, 4, 4, 4]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )}
    </div>
  );
}
