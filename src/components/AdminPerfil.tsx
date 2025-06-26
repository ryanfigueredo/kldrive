"use client";

import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistroItem } from "@/components/RegistroItem";
import { CriarUsuarioDialog } from "@/components/CriarUsuarioDialog";
import { CriarVeiculoDialog } from "@/components/CriarVeiculoDialog";
import { VincularUsuarioDialog } from "@/components/VincularUsuarioDialog";
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
import { Car, Fuel, Gauge, Users } from "lucide-react";

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
  totalKm?: number;
  totalValorAbastecido?: number;
  totalPorTipo?: {
    KM?: number;
    ABASTECIMENTO?: number;
  };
  kmPorData?: Record<string, number>;
}

export default function AdminPerfil({ session }: { session: Session }) {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [graficoData, setGraficoData] = useState<GraficoData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalImgSrc, setModalImgSrc] = useState<string | null>(null);
  const [modalImgAlt, setModalImgAlt] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (!session) return;
    if (session.user.role !== "ADMIN") {
      alert("Acesso restrito ao administrador.");
      router.push("/");
    }
  }, [session, router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [registrosRes, dashboardRes] = await Promise.all([
          fetch(`/api/admin/registros`),
          fetch(`/api/admin/dashboard-metrics`),
        ]);

        if (!registrosRes.ok || !dashboardRes.ok)
          throw new Error("Erro ao carregar dados.");

        const registrosData: Registro[] = await registrosRes.json();
        const dashboardData: GraficoData = await dashboardRes.json();

        setRegistros(registrosData ?? []);
        setGraficoData(dashboardData ?? {});
      } catch {
        setError("Erro ao carregar dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const dadosGraficoArea = graficoData.kmPorData
    ? Object.entries(graficoData.kmPorData).map(([data, km]) => ({
        data,
        km,
      }))
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
    <main className="min-h-screen px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Painel Administrativo
      </h1>

      <div className="flex gap-4 mb-6">
        <CriarUsuarioDialog onUserCreated={() => window.location.reload()} />
        <CriarVeiculoDialog onCreated={() => window.location.reload()} />
        <VincularUsuarioDialog onVincular={() => window.location.reload()} />
      </div>

      {loading && <p>Carregando dados...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-black border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              Total KM Rodado
            </CardTitle>
            <Gauge className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {graficoData.totalKm?.toLocaleString() ?? "0"} km
            </div>
            <p className="text-xs text-muted-foreground">
              ↑ 3.1% desde o mês anterior
            </p>
          </CardContent>
        </Card>
        <Card className="bg-black border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total Abastecido
            </CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {graficoData.totalValorAbastecido?.toFixed(2) ?? "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">↑ 1.7% este mês</p>
          </CardContent>
        </Card>
        <Card className="bg-black border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Registros de KM
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {graficoData.totalPorTipo?.KM ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              ↓ 2% em relação à média
            </p>
          </CardContent>
        </Card>
        <Card className="bg-black border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Registros de Abastecimento
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {graficoData.totalPorTipo?.ABASTECIMENTO ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">+2 esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos seguem abaixo... */}

      {/* Gráfico KM rodado */}
      {dadosGraficoArea.length > 0 && (
        <>
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
        </>
      )}

      {/* Gráfico consumo por usuário */}
      {dadosGraficoComposto.length > 0 && (
        <>
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
        </>
      )}

      <section className="flex flex-col gap-3 mt-6">
        {registros.length > 0 ? (
          registros.map((r) => (
            <RegistroItem
              key={r.id}
              r={r}
              onImageClick={(src) => {
                setModalImgSrc(src);
                setModalImgAlt(`${r.tipo} - ${r.placa}`);
              }}
            />
          ))
        ) : !loading ? (
          <p className="text-gray-400">Nenhum registro encontrado.</p>
        ) : null}
      </section>

      {modalImgSrc && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 cursor-zoom-out"
          onClick={() => setModalImgSrc(null)}
        >
          <Image
            src={modalImgSrc}
            alt={modalImgAlt}
            className="max-w-[90vw] max-h-[90vh] rounded-lg"
            width={800}
            height={600}
          />
        </div>
      )}
    </main>
  );
}
