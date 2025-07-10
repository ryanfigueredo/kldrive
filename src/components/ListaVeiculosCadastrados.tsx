"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VeiculoConsumo {
  id: string;
  placa: string;
  modelo?: string;
  totalKm: number;
  totalCombustivel: number;
}

export function ListaVeiculosCadastrados() {
  const [veiculos, setVeiculos] = useState<VeiculoConsumo[]>([]);

  useEffect(() => {
    fetch("/api/admin/veiculos-com-consumo")
      .then((res) => res.json())
      .then(setVeiculos);
  }, []);

  return (
    <Card className="dark:bg-card bg-white h-full text-black dark:text-white shadow-xl rounded-xl border-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Veículos Cadastrados
        </CardTitle>
      </CardHeader>
      <ScrollArea className="max-h-[400px]">
        <CardContent className="divide-y">
          {veiculos.map((v) => (
            <div key={v.id} className="py-3 flex justify-between">
              <div>
                <p className="font-medium text-sm">Placa: {v.placa}</p>
                <p className="text-xs text-muted-foreground">
                  Modelo: {v.modelo || "N/A"}
                </p>
              </div>
              <div className="text-right text-sm">
                <p>KM: {v.totalKm} km</p>
                <p>R$ {v.totalCombustivel.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
