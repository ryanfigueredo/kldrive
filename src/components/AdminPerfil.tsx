"use client";

import { useEffect, useState, useMemo } from "react";
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
import { ImageModal } from "./ImageModal";
import { FiltroRotas } from "./FiltroRotas";
import { Session } from "next-auth";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  vehicleId?: string;
}

interface AbastecimentoRecord {
  id: string;
  litros: number;
  valor: number;
  kmAtual: number;
  photoUrl: string;
  createdAt: string;
  user?: { name?: string };
  vehicle?: { placa?: string };
  vehicleId?: string;
}

export default function AdminPerfil({
  session,
  rotas = [],
  abastecimentos = [],
}: {
  session: Session;
  rotas: RotaRecord[];
  abastecimentos?: AbastecimentoRecord[];
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
  const [filtroTipo, setFiltroTipo] = useState<
    "ALL" | "ROTA" | "ABASTECIMENTO"
  >("ALL");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<null | {
    processed: number;
    inserted: number;
    duplicates: number;
    invalid: number;
    notFoundVehicle: number;
    insertedItems?: {
      row: number;
      placa: string;
      data: string;
      litros: number;
      valor: number;
      kmAtual: number;
    }[];
    details?: { row: number; placa?: string; reason: string }[];
  }>(null);

  // memo placeholder if needed in the future
  useMemo(
    () => ({
      dataInicio: filtroDataInicio,
      dataFim: filtroDataFim,
      tipo: filtroTipo,
    }),
    [filtroDataInicio, filtroDataFim, filtroTipo]
  );

  const { rotasFiltradas, abastecimentosFiltrados } = useMemo(() => {
    const filtraPorData = (dateStr: string) => {
      const d = new Date(dateStr);
      if (filtroDataInicio && d < filtroDataInicio) return false;
      if (filtroDataFim && d > filtroDataFim) return false;
      return true;
    };

    const r = rotas.filter((rota) => filtraPorData(rota.createdAt));
    const a = (abastecimentos ?? []).filter((ab) =>
      filtraPorData(ab.createdAt)
    );

    return { rotasFiltradas: r, abastecimentosFiltrados: a };
  }, [rotas, abastecimentos, filtroDataInicio, filtroDataFim]);

  const gruposPorVeiculo = useMemo(() => {
    type Entrada =
      | ({ tipo: "ROTA" } & RotaRecord)
      | ({ tipo: "ABASTECIMENTO" } & AbastecimentoRecord);

    const mapa: Record<string, { placa: string; entradas: Entrada[] }> = {};

    const incluir = (
      vehicleId: string | undefined,
      placa: string,
      entrada: Entrada
    ) => {
      const key = vehicleId ?? `SEM-${placa ?? "-"}`;
      if (!mapa[key]) mapa[key] = { placa: placa ?? "-", entradas: [] };
      mapa[key].entradas.push(entrada);
    };

    if (filtroTipo !== "ABASTECIMENTO") {
      rotasFiltradas.forEach((rota) => {
        incluir(rota.vehicleId, rota.vehicle?.placa ?? "-", {
          ...rota,
          tipo: "ROTA",
        });
      });
    }
    if (filtroTipo !== "ROTA") {
      abastecimentosFiltrados.forEach((ab) => {
        incluir(ab.vehicleId, ab.vehicle?.placa ?? "-", {
          ...ab,
          tipo: "ABASTECIMENTO",
        });
      });
    }

    // ordenar entradas por data desc
    Object.values(mapa).forEach((g) =>
      g.entradas.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );

    // ordenar colunas por placa
    const gruposOrdenados = Object.entries(mapa)
      .sort(([, a], [, b]) => a.placa.localeCompare(b.placa))
      .map(([, v]) => v);

    return gruposOrdenados;
  }, [rotasFiltradas, abastecimentosFiltrados, filtroTipo]);

  const handleFiltroChange = (filtros: {
    dataInicio?: Date;
    dataFim?: Date;
    periodo?: string;
    tipo?: "ALL" | "ROTA" | "ABASTECIMENTO";
  }) => {
    setFiltroDataInicio(filtros.dataInicio);
    setFiltroDataFim(filtros.dataFim);
    setFiltroTipo(filtros.tipo ?? "ALL");
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
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const form = new FormData();
              form.append("file", file);
              const res = await fetch("/api/admin/importar-abastecimentos", {
                method: "POST",
                body: form,
              });
              if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert(`Falha ao importar: ${err.error ?? res.status}`);
                return;
              }
              const summary = await res.json();
              setImportResult(summary);
              setImportOpen(true);
            }}
          />
          <Button
            variant="default"
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#c8d22c] text-black hover:bg-[#b7c11d]"
          >
            Importar Ticket Log (.xlsx)
          </Button>
        </div>
      </div>

      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Registros por veículo</h2>
          <Badge variant="secondary">
            {gruposPorVeiculo.reduce((acc, g) => acc + g.entradas.length, 0)}{" "}
            registro
            {gruposPorVeiculo.reduce((acc, g) => acc + g.entradas.length, 0) !==
            1
              ? "s"
              : ""}
          </Badge>
        </div>

        <FiltroRotas onFiltroChange={handleFiltroChange} />

        {/* Grid de colunas por veículo */}
        {gruposPorVeiculo.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            Nenhum registro encontrado para os filtros selecionados.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {gruposPorVeiculo.map((grupo) => (
              <Card key={grupo.placa} className="bg-white text-black">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    Veículo {grupo.placa}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {grupo.entradas.map((e) => (
                    <div key={e.id} className="flex gap-3 items-start">
                      <div className="relative">
                        <Image
                          src={e.photoUrl}
                          alt="Imagem"
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded-md cursor-pointer"
                          onClick={() =>
                            abrirModalImagem(
                              e.photoUrl,
                              ("kmSaida" in e
                                ? (e as RotaRecord).kmSaida
                                : (e as AbastecimentoRecord).kmAtual) ?? 0,
                              "partida" in e ? (e as RotaRecord).partida : "—",
                              "destino" in e ? (e as RotaRecord).destino : "—",
                              e.vehicle?.placa ?? "-",
                              e.user?.name ?? "-"
                            )
                          }
                        />
                        <Badge
                          className="absolute -top-2 -right-2"
                          variant={e.tipo === "ROTA" ? "secondary" : "default"}
                        >
                          {e.tipo === "ROTA" ? "Rota" : "Abastecimento"}
                        </Badge>
                      </div>
                      <div className="flex-1 text-sm">
                        {e.tipo === "ROTA" ? (
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold">
                                {(e as RotaRecord).kmSaida.toLocaleString()} km
                              </p>
                              <p className="text-gray-600">
                                <strong>{(e as RotaRecord).partida}</strong> →{" "}
                                <strong>{(e as RotaRecord).destino}</strong>
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {(e as RotaRecord).alterouRota && (
                                <Badge variant="destructive">
                                  Rota Alterada
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold">
                                R$ {(e as AbastecimentoRecord).valor.toFixed(2)}
                              </p>
                              <p className="text-gray-600">
                                {(e as AbastecimentoRecord).litros.toFixed(2)} L
                                • {(e as AbastecimentoRecord).kmAtual} km
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-500 mt-1">
                          <p>
                            <strong>Data:</strong>{" "}
                            {new Date(e.createdAt).toLocaleString("pt-BR")}
                          </p>
                          <p>
                            <strong>Veículo:</strong> {e.vehicle?.placa ?? "-"}
                          </p>
                          <p>
                            <strong>Colaborador:</strong> {e.user?.name ?? "-"}
                          </p>
                        </div>
                        {e.tipo === "ROTA" &&
                          (e as RotaRecord).alterouRota &&
                          (e as RotaRecord).alteracaoRota && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <p className="text-xs text-yellow-800">
                                <strong>Alteração:</strong>{" "}
                                {(e as RotaRecord).alteracaoRota}
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-3xl bg-white text-black dark:bg-neutral-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>Resultado da Importação</DialogTitle>
          </DialogHeader>
          {importResult && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <Badge variant="secondary">
                  Processados: {importResult.processed}
                </Badge>
                <Badge variant="default">
                  Inseridos: {importResult.inserted}
                </Badge>
                <Badge variant="secondary">
                  Duplicados: {importResult.duplicates}
                </Badge>
                <Badge variant="secondary">
                  Inválidos: {importResult.invalid}
                </Badge>
                <Badge variant="secondary">
                  Sem veículo: {importResult.notFoundVehicle}
                </Badge>
              </div>
              {Boolean(
                importResult.insertedItems &&
                  importResult.insertedItems.length > 0
              ) && (
                <div>
                  <h3 className="font-semibold mb-2">Inseridos</h3>
                  <div className="max-h-60 overflow-auto border rounded border-gray-200 dark:border-gray-700">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="p-2">Linha</th>
                          <th className="p-2">Placa</th>
                          <th className="p-2">Data</th>
                          <th className="p-2">Litros</th>
                          <th className="p-2">Valor</th>
                          <th className="p-2">KM</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {importResult.insertedItems?.map((it) => (
                          <tr key={`i-${it.row}`} className="border-t">
                            <td className="p-2">{it.row}</td>
                            <td className="p-2">{it.placa}</td>
                            <td className="p-2">
                              {new Date(it.data).toLocaleString("pt-BR")}
                            </td>
                            <td className="p-2">{it.litros}</td>
                            <td className="p-2">R$ {it.valor.toFixed(2)}</td>
                            <td className="p-2">{it.kmAtual}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {Boolean(
                importResult.details && importResult.details.length > 0
              ) && (
                <div>
                  <h3 className="font-semibold mb-2">Itens não inseridos</h3>
                  <div className="max-h-60 overflow-auto border rounded border-gray-200 dark:border-gray-700">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="p-2">Linha</th>
                          <th className="p-2">Placa</th>
                          <th className="p-2">Motivo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {importResult.details?.map((d, idx: number) => (
                          <tr key={`d-${idx}`} className="border-t">
                            <td className="p-2">{d.row}</td>
                            <td className="p-2">{d.placa ?? "-"}</td>
                            <td className="p-2">{d.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setImportOpen(false);
                    window.location.reload();
                  }}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
