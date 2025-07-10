"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface EstatisticaCardProps {
  titulo: string;
  valor: string;
  valorAtual: number;
  valorAnterior: number;
  icone: ReactNode;
  sufixo?: string;
}

export function EstatisticaCard({
  titulo,
  valor,
  valorAtual,
  valorAnterior,
  icone,
  sufixo,
}: EstatisticaCardProps) {
  const variacao = (atual: number, anterior: number): string => {
    if (anterior === 0) {
      return atual === 0 ? "0%" : "↑ ∞%";
    }
    const diff = ((atual - anterior) / anterior) * 100;
    const prefix = diff > 0 ? "↑" : diff < 0 ? "↓" : "";
    return `${prefix} ${Math.abs(diff).toFixed(1)}%`;
  };

  return (
    <Card className="dark:bg-card bg-white h-full text-black dark:text-white shadow-xl rounded-xl border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{titulo}</CardTitle>
        <div>{icone}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{valor}</div>
        <p className="text-xs text-muted-foreground">
          {variacao(valorAtual, valorAnterior)} {sufixo && `em ${sufixo}`}
        </p>
      </CardContent>
    </Card>
  );
}
