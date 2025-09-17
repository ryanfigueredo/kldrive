"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistroItem } from "@/components/RegistroItem";
import { CriarUsuarioDialog } from "@/components/CriarUsuarioDialog";
import { CriarVeiculoDialog } from "@/components/CriarVeiculoDialog";
import { VincularUsuarioDialog } from "@/components/VincularUsuarioDialog";
import { Car, Fuel, Gauge, Users, Eye } from "lucide-react";
import { ListaUsuariosCadastrados } from "./ListaUsuariosCadastrados";
import { ListaVeiculosCadastrados } from "./ListaVeiculosCadastrados";
import DashboardGraficos from "./AdminGraficos";
import { EstatisticaCard } from "./EstatisticaCard";
import { ImageModal } from "./ImageModal";
import { FiltroRotas } from "./FiltroRotas";
import { Session } from "next-auth";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [modalImageTitle, setModalImageTitle] = useState<string>("");
  const [modalImageSubtitle, setModalImageSubtitle] = useState<string>("");
  const [filtroDataInicio, setFiltroDataInicio] = useState<Date>();
  const [filtroDataFim, setFiltroDataFim] = useState<Date>();
  const router = useRouter();

  const rotasFiltradas = useMemo(() => {
    if (!filtroDataInicio && !filtroDataFim) return rotas;

    return rotas.filter((rota) => {
      const dataRota = new Date(rota.createdAt);

      if (filtroDataInicio && dataRota < filtroDataInicio) return false;
      if (filtroDataFim && dataRota > filtroDataFim) return false;

      return true;
    });
  }, [rotas, filtroDataInicio, filtroDataFim]);

  const handleFiltroChange = (dataInicio?: Date, dataFim?: Date) => {
    setFiltroDataInicio(dataInicio);
    setFiltroDataFim(dataFim);
  };

  const abrirModalImagem = (
    imageUrl: string,
    kmSaida: number,
    partida: string,
    destino: string,
    placa: string,
    usuario: string
  ) => {
    setModalImageUrl(imageUrl);
    setModalImageTitle(`Odômetro: ${kmSaida} km`);
    setModalImageSubtitle(`${partida} → ${destino} | ${placa} | ${usuario}`);
  };

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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Rotas Registradas</h2>
          <Badge variant="secondary">
            {rotasFiltradas.length} registro
            {rotasFiltradas.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        <FiltroRotas onFiltroChange={handleFiltroChange} />

        <div className="flex flex-col gap-3  ">
          {rotasFiltradas.length > 0 ? (
            rotasFiltradas.map((rota) => (
              <Card key={rota.id} className="p-4 bg-gray-50 text-black">
                <div className="flex gap-4 items-start ">
                  <div className="relative">
                    <Image
                      src={rota.photoUrl}
                      alt="Foto KM"
                      width={80}
                      height={80}
                      className="w-20  h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() =>
                        abrirModalImagem(
                          rota.photoUrl,
                          rota.kmSaida,
                          rota.partida,
                          rota.destino,
                          rota.vehicle?.placa ?? "-",
                          rota.user?.name ?? "-"
                        )
                      }
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() =>
                        abrirModalImagem(
                          rota.photoUrl,
                          rota.kmSaida,
                          rota.partida,
                          rota.destino,
                          rota.vehicle?.placa ?? "-",
                          rota.user?.name ?? "-"
                        )
                      }
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {rota.kmSaida.toLocaleString()} km
                        </h3>
                        <p className="text-sm text-gray-600">
                          <strong>{rota.partida}</strong> →{" "}
                          <strong>{rota.destino}</strong>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {rota.alterouRota && (
                          <Badge variant="destructive">Rota Alterada</Badge>
                        )}
                        {rota.realizouAbastecimento && (
                          <Badge variant="default">Com Abastecimento</Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-500">
                      <p>
                        <strong>Data:</strong>{" "}
                        {new Date(rota.createdAt).toLocaleString("pt-BR")}
                      </p>
                      <p>
                        <strong>Veículo:</strong> {rota.vehicle?.placa ?? "-"}
                      </p>
                      <p>
                        <strong>Colaborador:</strong> {rota.user?.name ?? "-"}
                      </p>
                    </div>

                    {rota.alterouRota && rota.alteracaoRota && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-800">
                          <strong>Alteração:</strong> {rota.alteracaoRota}
                        </p>
                      </div>
                    )}

                    {rota.realizouAbastecimento && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                        <p className="text-xs text-green-800">
                          ⛽ Realizou abastecimento nesta rota - verificar
                          registro de combustível
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              {rotas.length === 0
                ? "Nenhuma rota registrada ainda."
                : "Nenhuma rota encontrada para o período selecionado."}
            </p>
          )}
        </div>
      </section>

      {/* Modal para visualizar imagens */}
      <ImageModal
        isOpen={!!modalImageUrl}
        onClose={() => setModalImageUrl(null)}
        imageUrl={modalImageUrl || ""}
        title={modalImageTitle}
        subtitle={modalImageSubtitle}
      />

      {/* Resto do componente permanece igual... */}
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
          <Card className=" bg-white h-full text-black dark:text-white shadow-xl rounded-xl border-none ">
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
                      setModalImageUrl(src);
                      setModalImageTitle(`${r.tipo} - ${r.placa}`);
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
