"use client";

import { useEffect, useState } from "react";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graficoData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abastecimentos?: any[];
  filtroDataInicio?: Date;
  filtroDataFim?: Date;
}

export default function DashboardGraficos({
  graficoData, // eslint-disable-line @typescript-eslint/no-unused-vars
  abastecimentos = [], // eslint-disable-line @typescript-eslint/no-unused-vars
  filtroDataInicio,
  filtroDataFim,
}: Props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEfficiencyMetrics = async () => {
      try {
        const formatDate = (d?: Date) =>
          d
            ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                2,
                "0"
              )}-${String(d.getDate()).padStart(2, "0")}`
            : undefined;

        const start = formatDate(filtroDataInicio);
        const end = formatDate(filtroDataFim);

        const params = new URLSearchParams();
        if (start) params.set("startDate", start);
        if (end) params.set("endDate", end);

        const response = await fetch(
          `/api/admin/efficiency-metrics${
            params.toString() ? `?${params.toString()}` : ""
          }`
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Dados recebidos da API:", data);
        } else {
          const errorData = await response.json();
          console.error("Erro na API:", errorData);
        }
      } catch (error) {
        console.error("Erro ao carregar métricas de eficiência:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEfficiencyMetrics();
  }, [filtroDataInicio, filtroDataFim]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center py-8">
          Carregando métricas de eficiência...
        </div>
        <div className="text-center">
          <button
            onClick={async () => {
              try {
                const response = await fetch("/api/admin/debug-data");
                const data = await response.json();
                console.log("Debug data:", data);
                alert(
                  `Dados encontrados: ${JSON.stringify(data.totals, null, 2)}`
                );
              } catch (error) {
                console.error("Erro ao buscar dados de debug:", error);
              }
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Verificar Dados no Banco
          </button>
        </div>
      </div>
    );
  }

  return <div className="flex flex-col gap-6"></div>;
}
