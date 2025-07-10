"use client";

import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Legend,
} from "recharts";

import { ChartContainer, ChartTooltipContent } from "@/components/ui/charts";

interface Registro {
  id: string;
  tipo: "KM" | "ABASTECIMENTO";
  placa: string;
  usuario: string;
  valor: number;
  km: number;
  imagem: string;
  data: string;
}

interface GraficoData {
  kmPorData?: Record<string, number>;
}

interface Props {
  registros: Registro[];
  graficoData: GraficoData;
}

export default function DashboardGraficos({ registros, graficoData }: Props) {
  const dadosGraficoArea = graficoData.kmPorData
    ? Object.entries(graficoData.kmPorData).map(([data, km]) => ({ data, km }))
    : [];

  type CompostoData = {
    [data: string]: {
      data: string;
      [usuario: string]: number | string;
    };
  };

  const dadosBarChart: CompostoData = registros
    .filter((r) => r.tipo === "ABASTECIMENTO")
    .reduce((acc, r) => {
      const dia = r.data.split("T")[0];
      if (!acc[dia]) acc[dia] = { data: dia };
      acc[dia][r.usuario] = ((acc[dia][r.usuario] ?? 0) as number) + r.valor;
      return acc;
    }, {} as CompostoData);

  const dadosGraficoComposto = Object.values(dadosBarChart);

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

      {dadosGraficoComposto.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Consumo de combustível por usuário
          </h2>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={dadosGraficoComposto} stackOffset="expand">
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                {registros
                  .filter((r) => r.tipo === "ABASTECIMENTO")
                  .map((r) => r.usuario)
                  .filter((v, i, arr) => arr.indexOf(v) === i)
                  .map((usuario, idx) => (
                    <Bar
                      key={usuario}
                      dataKey={usuario}
                      stackId="a"
                      fill={idx % 2 === 0 ? "#5D9CEC" : "#ED5565"}
                    />
                  ))}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )}
    </div>
  );
}
