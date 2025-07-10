"use client";

import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistroItem } from "@/components/RegistroItem";
import { CriarUsuarioDialog } from "@/components/CriarUsuarioDialog";
import { CriarVeiculoDialog } from "@/components/CriarVeiculoDialog";
import { VincularUsuarioDialog } from "@/components/VincularUsuarioDialog";
import { Car, Fuel, Gauge, Users } from "lucide-react";
import { ListaUsuariosCadastrados } from "./ListaUsuariosCadastrados";
import { ListaVeiculosCadastrados } from "./ListaVeiculosCadastrados";
import DashboardGraficos from "./AdminGraficos";
import { EstatisticaCard } from "./EstatisticaCard";

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
  historicoComparativo?: {
    kmAnterior: number;
    valorAbastecidoAnterior: number;
    qtdKmAnterior: number;
    qtdAbastecimentoAnterior: number;
  };
}

export default function AdminPerfil({ session }: { session: Session }) {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [graficoData, setGraficoData] = useState<GraficoData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setModalImgSrc] = useState<string | null>(null);
  const [, setModalImgAlt] = useState<string>("");
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

        console.log("DADOS DO DASHBOARD", dashboardData);

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

  return (
    <main className="min-h-screen px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Painel Administrativo
      </h1>

      {loading && <p>Carregando dados...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="flex gap-4 mb-6">
        <CriarUsuarioDialog onUserCreated={() => window.location.reload()} />
        <CriarVeiculoDialog onCreated={() => window.location.reload()} />
        <VincularUsuarioDialog onVincular={() => window.location.reload()} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <EstatisticaCard
          titulo="Total KM Rodado"
          valor={`${graficoData.totalKm?.toLocaleString() ?? "0"} km`}
          valorAtual={graficoData.totalKm ?? 0}
          valorAnterior={graficoData.historicoComparativo?.kmAnterior ?? 0}
          icone={<Gauge className="h-4 w-4" />}
          sufixo="km"
        />
        <EstatisticaCard
          titulo="Valor Total Abastecido"
          valor={`R$ ${graficoData.totalValorAbastecido?.toFixed(2) ?? "0.00"}`}
          valorAtual={graficoData.totalValorAbastecido ?? 0}
          valorAnterior={
            graficoData.historicoComparativo?.valorAbastecidoAnterior ?? 0
          }
          icone={<Fuel className="h-4 w-4" />}
          sufixo="R$"
        />
        <EstatisticaCard
          titulo="Registros de KM"
          valor={`${graficoData.totalPorTipo?.KM ?? 0}`}
          valorAtual={graficoData.totalPorTipo?.KM ?? 0}
          valorAnterior={graficoData.historicoComparativo?.qtdKmAnterior ?? 0}
          icone={<Car className="h-4 w-4" />}
        />
        <EstatisticaCard
          titulo="Registros de Abastecimento"
          valor={`${graficoData.totalPorTipo?.ABASTECIMENTO ?? 0}`}
          valorAtual={graficoData.totalPorTipo?.ABASTECIMENTO ?? 0}
          valorAnterior={
            graficoData.historicoComparativo?.qtdAbastecimentoAnterior ?? 0
          }
          icone={<Users className="h-4 w-4" />}
        />
      </div>

      <div className="flex py-8 gap-8">
        <div className="items-start grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <ListaUsuariosCadastrados />
          <ListaVeiculosCadastrados />
          <Card className="dark:bg-card bg-white h-full text-black dark:text-white shadow-xl rounded-xl border-none ">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Últimos Registros
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
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
            </CardContent>
          </Card>
        </div>
      </div>

      <DashboardGraficos registros={registros} graficoData={graficoData} />
    </main>
  );
}
