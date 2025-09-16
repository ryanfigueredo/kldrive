"use client";

import { useEffect, useState } from "react";
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
import { Session } from "next-auth";

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

interface RotaRecord {
  id: string;
  kmSaida: number;
  photoUrl: string;
  partida: string;
  destino: string;
  alterouRota: boolean;
  alteracaoRota?: string | null;
  realizouAbastecimento: boolean;
  createdAt: string;
  user?: { name?: string };
  vehicle?: { placa?: string };
}

export default function AdminPerfil({
  session,
  rotas = [],
}: {
  session: Session;
  rotas: RotaRecord[];
}) {
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

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <CriarUsuarioDialog onUserCreated={() => window.location.reload()} />
        <CriarVeiculoDialog onCreated={() => window.location.reload()} />
        <VincularUsuarioDialog onVincular={() => window.location.reload()} />
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Rotas Registradas</h2>
        <div className="flex flex-col gap-3">
          {rotas.length > 0 ? (
            rotas.map((rota) => (
              <div
                key={rota.id}
                className="bg-white p-3 rounded-xl shadow-md flex gap-4 items-center"
              >
                <img
                  src={rota.photoUrl}
                  alt="Foto KM"
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="text-sm text-gray-800">
                  <p>
                    <strong>{rota.kmSaida} km</strong> | {rota.partida} →{" "}
                    {rota.destino}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(rota.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs">
                    Veículo: {rota.vehicle?.placa ?? "-"} | Colaborador:{" "}
                    {rota.user?.name ?? "-"}
                  </p>
                  {rota.alterouRota && (
                    <p className="text-xs text-yellow-700">
                      Alteração: {rota.alteracaoRota}
                    </p>
                  )}
                  {rota.realizouAbastecimento && (
                    <p className="text-xs text-green-700">
                      Realizou abastecimento nesta rota
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              Nenhuma rota registrada ainda.
            </p>
          )}
        </div>
      </section>

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
