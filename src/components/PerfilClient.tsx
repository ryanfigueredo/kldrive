"use client";

import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

import { ChartContainer, ChartTooltipContent } from "@/components/ui/charts";

interface FuelRecord {
  id: string;
  litros: number;
  valor: number;
  kmAtual: number;
  situacaoTanque: string;
  observacao: string | null;
  createdAt: string;
  photoUrl: string;
}

interface KmResumo {
  totalKm: number;
  totalGasto: number;
  abastecimentos: number;
  mediaPorLitro: number;
}

export default function PerfilClient({ session }: { session: Session }) {
  const [resumo, setResumo] = useState<KmResumo | null>(null);
  const [historico, setHistorico] = useState<FuelRecord[]>([]);

  useEffect(() => {
    fetch("/api/usuario/resumo")
      .then((res) => res.json())
      .then((data) => {
        setResumo(data.resumo);
        setHistorico(data.abastecimentos);
      });
  }, []);

  const chartData = historico.map((item) => ({
    date: new Date(item.createdAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    valor: item.valor,
  }));

  const radarData = historico.reduce((acc, curr) => {
    const local = curr.observacao?.trim() || "Desconhecido";
    const existing = acc.find((item) => item.local === local);
    if (existing) {
      existing.valor += curr.valor;
    } else {
      acc.push({ local, valor: curr.valor });
    }
    return acc;
  }, [] as { local: string; valor: number }[]);

  if (!session?.user) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Carregando sessão...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 md:px-6 lg:px-10 py-8 bg-muted/50">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Painel de Desempenho Operacional
          </h1>
          <p className="text-muted-foreground text-sm">
            {session.user.name} • {session.user.email} • {session.user.role}
          </p>
        </div>
      </div>

      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total KM</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {resumo.totalKm} km
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Valor Abastecido</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              R${" "}
              {resumo.totalGasto.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Abastecimentos</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {resumo.abastecimentos}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Média por litro</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {resumo.mediaPorLitro.toFixed(2)} km/L
            </CardContent>
          </Card>
        </div>
      )}

      {historico.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Gastos com Abastecimento (R$ por dia)
          </h2>
          <ChartContainer className="w-full aspect-[4/1]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis dataKey="date" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#3b82f6"
                  fill="#bfdbfe"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-4 font-semibold border-b">
          Histórico de Abastecimento
        </div>
        <div className="divide-y text-sm">
          {historico.length > 0 ? (
            historico.map((a) => (
              <div key={a.id} className="p-4 flex justify-between">
                <div>
                  <p className="font-semibold">
                    {a.litros}L - R${" "}
                    {a.valor.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    KM: {a.kmAtual} • {new Date(a.createdAt).toLocaleString()}
                  </p>
                  {a.observacao && <p className="text-xs">{a.observacao}</p>}
                </div>
                <Image
                  src={a.photoUrl}
                  alt="cupom"
                  width={64}
                  height={64}
                  className="rounded object-cover border"
                />
              </div>
            ))
          ) : (
            <p className="p-4 text-gray-400">
              Nenhum abastecimento encontrado.
            </p>
          )}
        </div>
      </div>

      {radarData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Locais de Abastecimento (R$ total por local)
          </h2>
          <ChartContainer className="w-full aspect-square">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="local" />
                <PolarRadiusAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Radar
                  name="Valor abastecido"
                  dataKey="valor"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )}
    </main>
  );
}
