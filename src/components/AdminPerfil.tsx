"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { RegistroItem } from "@/components/RegistroItem";
import { CriarUsuarioDialog } from "@/components/CriarUsuarioDialog";
import { CriarVeiculoDialog } from "@/components/CriarVeiculoDialog";
import { VincularUsuarioDialog } from "@/components/VincularUsuarioDialog";
import {
  Fuel,
  Users,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Droplets,
  Route,
  AlertTriangle,
  TrendingUp,
  Edit3,
} from "lucide-react";
import { ListaUsuariosCadastrados } from "./ListaUsuariosCadastrados";
import { ListaVeiculosCadastrados } from "./ListaVeiculosCadastrados";
import DashboardGraficos from "./AdminGraficos";
import { EstatisticaCard } from "./EstatisticaCard";
import { ImageModal } from "./ImageModal";
import { FiltroRotas } from "./FiltroRotas";
import { CalculadoraEficiencia } from "./CalculadoraEficiencia";
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
import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from "recharts";

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

interface RotaMetrics {
  totalKmRodados: number;
  totalRotas: number;
  totalUsuarios: number;
  totalVeiculos: number;
  kmPorVeiculo: Record<string, number>;
  kmPorUsuario: Record<string, number>;
  topUsuarios: Array<{ usuario: string; km: number }>;
  topVeiculos: Array<{ placa: string; km: number }>;
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
  vehicle?: { placa?: string; users?: { name?: string }[] };
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
  vehicle?: { placa?: string; users?: { name?: string }[] };
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
  const [graficoData, setGraficoData] = useState<GraficoData>({});
  const [rotaMetrics, setRotaMetrics] = useState<RotaMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [modalImageTitle, setModalImageTitle] = useState<string>("");
  const [modalImageSubtitle, setModalImageSubtitle] = useState<string>("");
  // Inicializar com o mês atual
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [filtroDataInicio, setFiltroDataInicio] = useState<Date | undefined>(
    startOfCurrentMonth
  );
  const [filtroDataFim, setFiltroDataFim] = useState<Date | undefined>(
    endOfCurrentMonth
  );
  const [filtroTipo, setFiltroTipo] = useState<
    "ALL" | "ROTA" | "ABASTECIMENTO"
  >("ALL");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
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

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [editRotaOpen, setEditRotaOpen] = useState(false);
  const [rotaParaEditar, setRotaParaEditar] = useState<RotaRecord | null>(null);
  const [calculadoraOpen, setCalculadoraOpen] = useState(false);

  const formatBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleEditRota = (rota: RotaRecord) => {
    setRotaParaEditar(rota);
    setEditRotaOpen(true);
  };

  const getGroupSummary = (grupo: {
    placa: string;
    entradas: (RotaRecord | AbastecimentoRecord)[];
  }) => {
    let total = 0;
    let totalKmRodados = 0;
    let totalLitros = 0;
    const names = new Set<string>();

    // Separar abastecimentos (Ticket Log) e rotas (dados manuais)
    const abastecimentos = grupo.entradas.filter(
      (e) => (e as AbastecimentoRecord).valor !== undefined
    ) as AbastecimentoRecord[];

    const rotas = grupo.entradas.filter(
      (e) => (e as RotaRecord).kmSaida !== undefined
    ) as RotaRecord[];

    // Ordenar abastecimentos por data (dados mais confiáveis do Ticket Log)
    const abastecimentosOrdenados = [...abastecimentos].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // 🎯 HIERARQUIA DE CONFIABILIDADE PARA CONTROLE PERFEITO:
    // 1º PRIORIDADE: Rotas manuais (dados preenchidos pelo funcionário) - MAIS CONFIÁVEL
    // 2º PRIORIDADE: Ticket Log (quando não há rotas manuais) - MENOS CONFIÁVEL

    let fonteKmRodados = "Nenhuma";
    let confiabilidadeKm = "baixa";

    if (rotas.length > 0) {
      // 🥇 USAR ROTAS MANUAIS (mais confiáveis - funcionário preencheu)
      const rotasOrdenadas = [...rotas].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const primeiraRota = rotasOrdenadas[0];
      const ultimaRota = rotasOrdenadas[rotasOrdenadas.length - 1];

      const kmPrimeira = Number(primeiraRota.kmSaida) || 0;
      const kmUltima = Number(ultimaRota.kmSaida) || 0;

      // KM rodados = diferença entre primeira e última rota por data
      if (kmUltima > kmPrimeira) {
        totalKmRodados = kmUltima - kmPrimeira;
        fonteKmRodados = "Rotas Manuais";
        confiabilidadeKm = "alta";
      }
    } else if (abastecimentosOrdenados.length > 0) {
      // 🥈 USAR TICKET LOG (menos confiável - frentista pode errar)
      const kmValues = abastecimentosOrdenados
        .map((ab) => Number(ab.kmAtual) || 0)
        .filter((km) => km > 0);

      if (kmValues.length > 0) {
        const kmMinimo = Math.min(...kmValues);
        const kmMaximo = Math.max(...kmValues);
        totalKmRodados = kmMaximo - kmMinimo;
        fonteKmRodados = "Ticket Log";
        confiabilidadeKm = "média";
      }
    }

    // Somar valores e litros de todos os abastecimentos (Ticket Log)
    if (abastecimentosOrdenados.length > 0) {
      for (const abastecimento of abastecimentosOrdenados) {
        const valor = Number(abastecimento.valor) || 0;
        const litros = Number(abastecimento.litros) || 0;
        total += valor;
        totalLitros += litros;
      }
    }

    // Processar usuários
    grupo.entradas.forEach((e) => {
      const vehUsers = (e as RotaRecord | AbastecimentoRecord).vehicle?.users;
      if (vehUsers && vehUsers.length) {
        vehUsers.forEach((u) => u?.name && names.add(u.name));
      } else if ((e as RotaRecord | AbastecimentoRecord).user?.name) {
        names.add((e as RotaRecord | AbastecimentoRecord).user!.name as string);
      }
    });

    // Calcular consumo médio baseado nos dados do Ticket Log
    const consumoMedio =
      totalLitros > 0 && totalKmRodados > 0
        ? ((totalLitros / totalKmRodados) * 100).toFixed(2)
        : null;

    // Verificar se o consumo está dentro de um range razoável (5-20 L/100km)
    const consumoValido =
      consumoMedio &&
      parseFloat(consumoMedio) >= 5 &&
      parseFloat(consumoMedio) <= 20;

    // Calcular indicadores de eficiência e alertas
    const custoPorKm = totalKmRodados > 0 ? total / totalKmRodados : 0;
    const alertaEficiencia =
      consumoMedio && parseFloat(consumoMedio) < 8
        ? "⚠️ Baixa eficiência"
        : null;
    const alertaGasto = custoPorKm > 1.0 ? "💰 Alto custo por km" : null;

    return {
      total,
      users: Array.from(names).join(", "),
      totalKmRodados,
      totalLitros,
      consumoMedio,
      consumoValido,
      fonteDados: fonteKmRodados,
      confiabilidadeKm,
      custoPorKm,
      alertaEficiencia,
      alertaGasto,
      qtdAbastecimentos: abastecimentosOrdenados.length,
      qtdRotas: rotas.length,
    };
  };

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

  // Lógica do RadialChart - KM por usuário (baseado nas rotas)
  const kmPorUsuario = rotaMetrics?.kmPorUsuario || {};

  const dadosPorUsuario = Object.entries(kmPorUsuario)
    .map(([usuario, km]) => ({ usuario, valor: km }))
    .sort((a, b) => b.valor - a.valor);

  // Dados de teste se não houver dados reais
  const dadosTeste = [
    { usuario: "João Silva", valor: 500, fill: "#c8d22c" },
    { usuario: "Maria Santos", valor: 300, fill: "#55D462" },
    { usuario: "Pedro Costa", valor: 200, fill: "#7ED957" },
  ];

  // Aplicar cores do projeto aos dados
  const coresProjeto = ["#c8d22c", "#55D462", "#7ED957", "#a0e76b", "#c3f480"];
  const dadosComCores = (
    dadosPorUsuario.length > 0 ? dadosPorUsuario : dadosTeste
  ).map((item, index) => ({
    ...item,
    fill: coresProjeto[index % coresProjeto.length],
  }));

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

        const [registrosRes, dashboardRes, rotaMetricsRes] = await Promise.all([
          fetch(`/api/admin/registros`),
          fetch(
            `/api/admin/dashboard-metrics${
              params.toString() ? `?${params.toString()}` : ""
            }`
          ),
          fetch(
            `/api/admin/rota-metrics${
              params.toString() ? `?${params.toString()}` : ""
            }`
          ),
        ]);

        if (!registrosRes.ok || !dashboardRes.ok || !rotaMetricsRes.ok)
          throw new Error("Erro ao carregar dados.");

        await registrosRes.json();
        const dashboardData: GraficoData = await dashboardRes.json();
        const rotaMetricsData: RotaMetrics = await rotaMetricsRes.json();

        setGraficoData(dashboardData ?? {});
        setRotaMetrics(rotaMetricsData ?? null);
      } catch {
        setError("Erro ao carregar dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filtroDataInicio, filtroDataFim]);

  return (
    <main className="min-h-screen py-6">
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
            className="bg-[#c8d22c] text-white hover:bg-[#b7c11d]"
          >
            Importar Ticket Log
          </Button>
          <Button
            variant="secondary"
            onClick={() => setManualOpen(true)}
            className="bg-gray-200 text-black hover:bg-gray-300"
          >
            Registrar Abastecimento (Admin)
          </Button>
          <Button
            variant="outline"
            onClick={() => setCalculadoraOpen(true)}
            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
          >
            Calculadora de Eficiência
          </Button>
        </div>
      </div>

      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Registros por veículo</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filtroDataInicio && filtroDataFim ? (
                <>
                  Dados do período:{" "}
                  {filtroDataInicio.toLocaleDateString("pt-BR")} a{" "}
                  {filtroDataFim.toLocaleDateString("pt-BR")}
                </>
              ) : (
                <>Todos os dados disponíveis</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={
                filtroDataInicio && filtroDataFim ? "default" : "outline"
              }
              size="sm"
              onClick={() => {
                setFiltroDataInicio(startOfCurrentMonth);
                setFiltroDataFim(endOfCurrentMonth);
              }}
            >
              Mês Atual
            </Button>
            <Button
              variant={
                !filtroDataInicio && !filtroDataFim ? "default" : "outline"
              }
              size="sm"
              onClick={() => {
                setFiltroDataInicio(undefined);
                setFiltroDataFim(undefined);
              }}
            >
              Todos os Dados
            </Button>
            <Badge variant="secondary">
              {gruposPorVeiculo.reduce((acc, g) => acc + g.entradas.length, 0)}{" "}
              registro
              {gruposPorVeiculo.reduce(
                (acc, g) => acc + g.entradas.length,
                0
              ) !== 1
                ? "s"
                : ""}
            </Badge>
          </div>
        </div>

        <FiltroRotas onFiltroChange={handleFiltroChange} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Coluna 1: Abastecimento */}
            <div className="space-y-3">
              <div className="h-[120px]">
                <EstatisticaCard
                  titulo="Valor Total Abastecido"
                  valor={`R$ ${
                    graficoData.totalValorAbastecido?.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) ?? "0,00"
                  }`}
                  valorAtual={graficoData.totalValorAbastecido ?? 0}
                  valorAnterior={
                    graficoData.historicoComparativo?.valorAbastecidoAnterior ??
                    0
                  }
                  icone={<Fuel className="h-4 w-4" />}
                  sufixo="R$"
                />
              </div>

              <div className="h-[120px]">
                <EstatisticaCard
                  titulo="Registros de Abastecimento"
                  valor={`${graficoData.totalPorTipo?.ABASTECIMENTO ?? 0}`}
                  valorAtual={graficoData.totalPorTipo?.ABASTECIMENTO ?? 0}
                  valorAnterior={
                    graficoData.historicoComparativo
                      ?.qtdAbastecimentoAnterior ?? 0
                  }
                  icone={<Users className="h-4 w-4" />}
                />
              </div>
            </div>

            {/* Coluna 2: KM */}
            <div className="space-y-3">
              <div className="h-[120px]">
                <EstatisticaCard
                  titulo="Total KM Rodados"
                  valor={`${
                    rotaMetrics?.totalKmRodados?.toLocaleString() ?? "0"
                  } km`}
                  valorAtual={rotaMetrics?.totalKmRodados ?? 0}
                  valorAnterior={0}
                  icone={<Fuel className="h-4 w-4" />}
                  sufixo="km"
                />
              </div>

              <div className="h-[120px]">
                <EstatisticaCard
                  titulo="Total de Rotas"
                  valor={`${rotaMetrics?.totalRotas ?? 0}`}
                  valorAtual={rotaMetrics?.totalRotas ?? 0}
                  valorAnterior={0}
                  icone={<Users className="h-4 w-4" />}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 ">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    KM por Usuário
                  </CardTitle>
                  {dadosPorUsuario.length === 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Demo
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[225px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      data={dadosComCores}
                      startAngle={-90}
                      endAngle={380}
                      innerRadius={40}
                      outerRadius={120}
                    >
                      <RadialBar
                        dataKey="valor"
                        background={{ fill: "#f0f0f0" }}
                        fill="black"
                      >
                        <LabelList
                          position="insideStart"
                          dataKey="usuario"
                          fill="black"
                          fontSize={10}
                        />
                      </RadialBar>
                      <Tooltip
                        formatter={(value: number) => [
                          `${value.toLocaleString()} km`,
                          "KM Rodados",
                        ]}
                        labelFormatter={(label: string) => `Usuário: ${label}`}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Grid de colunas por veículo */}
        {gruposPorVeiculo.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            Nenhum registro encontrado para os filtros selecionados.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {gruposPorVeiculo.map((grupo) => {
              const summary = getGroupSummary(grupo);
              const isCollapsed = collapsed[grupo.placa] ?? true;
              return (
                <Card key={grupo.placa} className="bg-white text-black">
                  <CardHeader className="pb-2 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Veículo {grupo.placa}
                      </CardTitle>
                      <p className="text-xs text-gray-600 mt-1">
                        Colaborador: {summary.users || "-"} • Total gasto:{" "}
                        {formatBRL(summary.total)} • {grupo.entradas.length}{" "}
                        registro
                        {grupo.entradas.length !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Fonte: {summary.fonteDados} •{summary.qtdAbastecimentos}{" "}
                        abastecimento
                        {summary.qtdAbastecimentos !== 1 ? "s" : ""} •
                        {summary.qtdRotas} rota
                        {summary.qtdRotas !== 1 ? "s" : ""} manual
                        {summary.qtdRotas !== 1 ? "is" : ""}
                      </p>

                      {/* Indicadores de Confiabilidade e Alertas */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            summary.confiabilidadeKm === "alta"
                              ? "bg-green-100 text-green-800"
                              : summary.confiabilidadeKm === "média"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {summary.confiabilidadeKm === "alta"
                            ? "✅ Alta confiabilidade"
                            : summary.confiabilidadeKm === "média"
                            ? "⚠️ Média confiabilidade"
                            : "❌ Baixa confiabilidade"}
                        </span>

                        {summary.alertaEficiencia && (
                          <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800">
                            {summary.alertaEficiencia}
                          </span>
                        )}

                        {summary.alertaGasto && (
                          <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-800">
                            {summary.alertaGasto}
                          </span>
                        )}
                      </div>
                      {summary.qtdAbastecimentos > 0 && (
                        <div className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <div className="font-semibold text-green-600 flex items-center justify-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {formatBRL(summary.total)}
                              </div>
                              <div className="text-xs">Total Gasto</div>
                            </div>
                            <div>
                              <div className="font-semibold text-blue-600 flex items-center justify-center gap-1">
                                <Droplets className="h-3 w-3" />
                                {summary.totalLitros.toFixed(2)}L
                              </div>
                              <div className="text-xs">Litros</div>
                            </div>
                            <div>
                              <div className="font-semibold text-purple-600 flex items-center justify-center gap-1">
                                <Route className="h-3 w-3" />
                                {summary.totalKmRodados.toFixed(0)}km
                              </div>
                              <div className="text-xs">KM Rodados</div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                          <Route className="h-3 w-3" />
                          {summary.totalKmRodados.toLocaleString()} km rodados
                        </span>
                        {summary.consumoMedio && (
                          <span
                            className={`px-2 py-1 rounded flex items-center gap-1 ${
                              summary.consumoValido
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            <Fuel className="h-3 w-3" />
                            {summary.consumoMedio} L/100km
                            {!summary.consumoValido && (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                          </span>
                        )}
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded flex items-center gap-1">
                          <Droplets className="h-3 w-3" />
                          {summary.totalLitros.toFixed(2)} L total
                        </span>
                        {summary.custoPorKm > 0 && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            R$ {summary.custoPorKm.toFixed(2)}/km
                          </span>
                        )}
                        {summary.qtdAbastecimentos > 0 && (
                          <>
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              R${" "}
                              {(summary.total / summary.totalKmRodados).toFixed(
                                2
                              )}
                              /km
                            </span>
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              R${" "}
                              {(summary.total / summary.totalLitros).toFixed(2)}
                              /L
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      aria-label="Alternar"
                      className="p-1 rounded hover:bg-gray-100 text-gray-700"
                      onClick={() =>
                        setCollapsed((prev) => ({
                          ...prev,
                          [grupo.placa]: !isCollapsed,
                        }))
                      }
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </CardHeader>
                  {!isCollapsed && (
                    <CardContent className="flex flex-col gap-3">
                      {grupo.entradas.map((e) => (
                        <div key={e.id} className="flex gap-3 items-start">
                          <div className="relative">
                            {e.photoUrl ? (
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
                                      : (e as AbastecimentoRecord).kmAtual) ??
                                      0,
                                    "partida" in e
                                      ? (e as RotaRecord).partida
                                      : "—",
                                    "destino" in e
                                      ? (e as RotaRecord).destino
                                      : "—",
                                    e.vehicle?.placa ?? "-",
                                    e.user?.name ?? "-"
                                  )
                                }
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">
                                sem foto
                              </div>
                            )}
                            <Badge
                              className="absolute -top-2 -right-2"
                              variant={
                                e.tipo === "ROTA" ? "secondary" : "default"
                              }
                            >
                              {e.tipo === "ROTA" ? "Rota" : "Abastecimento"}
                            </Badge>
                          </div>
                          <div className="flex-1 text-sm">
                            {e.tipo === "ROTA" ? (
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold">
                                    {(e as RotaRecord).kmSaida.toLocaleString()}{" "}
                                    km
                                  </p>
                                  <p className="text-gray-600">
                                    <strong>{(e as RotaRecord).partida}</strong>{" "}
                                    →{" "}
                                    <strong>{(e as RotaRecord).destino}</strong>
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  {(e as RotaRecord).alterouRota && (
                                    <Badge variant="destructive">
                                      Rota Alterada
                                    </Badge>
                                  )}
                                  {session?.user?.role === "ADMIN" && (
                                    <button
                                      onClick={() =>
                                        handleEditRota(e as RotaRecord)
                                      }
                                      className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                                      title="Editar quilometragem"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold">
                                    R${" "}
                                    {(e as AbastecimentoRecord).valor.toFixed(
                                      2
                                    )}
                                  </p>
                                  <p className="text-gray-600">
                                    {(e as AbastecimentoRecord).litros.toFixed(
                                      2
                                    )}{" "}
                                    L • {(e as AbastecimentoRecord).kmAtual} km
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
                                <strong>Veículo:</strong>{" "}
                                {e.vehicle?.placa ?? "-"}
                              </p>
                              <p>
                                <strong>Colaborador:</strong>{" "}
                                {e.vehicle?.placa && e.vehicle?.users?.length
                                  ? e.vehicle.users
                                      .map((u) => u?.name)
                                      .filter(Boolean)
                                      .join(", ")
                                  : e.user?.name ?? "-"}
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
                  )}
                </Card>
              );
            })}
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

      <DashboardGraficos
        graficoData={graficoData}
        abastecimentos={abastecimentosFiltrados}
        filtroDataInicio={filtroDataInicio}
        filtroDataFim={filtroDataFim}
      />

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
                        {importResult.insertedItems?.map(
                          (it: {
                            row: number;
                            placa: string;
                            data: string;
                            litros: number;
                            valor: number;
                            kmAtual: number;
                          }) => (
                            <tr key={`i-${it.row}`} className="border-t">
                              <td className="p-2">{it.row}</td>
                              <td className="p-2">{it.placa}</td>
                              <td className="p-2">
                                {new Date(it.data).toLocaleString("pt-BR")}
                              </td>
                              <td className="p-2">{it.litros}</td>
                              <td className="p-2">
                                R${" "}
                                {it.valor.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="p-2">{it.kmAtual}</td>
                            </tr>
                          )
                        )}
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
                        {importResult.details?.map(
                          (
                            d: { row: number; placa?: string; reason: string },
                            idx: number
                          ) => (
                            <tr key={`d-${idx}`} className="border-t">
                              <td className="p-2">{d.row}</td>
                              <td className="p-2">{d.placa ?? "-"}</td>
                              <td className="p-2">{d.reason}</td>
                            </tr>
                          )
                        )}
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

      {/* Dialog Registrar Manual */}
      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent className="max-w-md bg-white text-black dark:bg-neutral-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>Registrar abastecimento manual</DialogTitle>
          </DialogHeader>
          <ManualForm onClose={() => setManualOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Rota */}
      <Dialog open={editRotaOpen} onOpenChange={setEditRotaOpen}>
        <DialogContent className="max-w-md bg-white text-black dark:bg-neutral-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>Editar Quilometragem da Rota</DialogTitle>
          </DialogHeader>
          {rotaParaEditar && (
            <EditRotaForm
              rota={rotaParaEditar}
              onClose={() => {
                setEditRotaOpen(false);
                setRotaParaEditar(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Calculadora de Eficiência */}
      <Dialog open={calculadoraOpen} onOpenChange={setCalculadoraOpen}>
        <DialogContent className="max-w-lg bg-white text-black dark:bg-neutral-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>Calculadora de Eficiência de Combustível</DialogTitle>
          </DialogHeader>
          <CalculadoraEficiencia onClose={() => setCalculadoraOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="flex py-8 gap-8">
        <div className="items-start grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <ListaUsuariosCadastrados />
          <ListaVeiculosCadastrados />
        </div>
      </div>
    </main>
  );
}

function ManualForm({ onClose }: { onClose: () => void }) {
  const [vehicles, setVehicles] = useState<{ id: string; placa: string }[]>([]);
  const [vehicleId, setVehicleId] = useState<string>("");
  const [litros, setLitros] = useState<string>("");
  const [valor, setValor] = useState<string>("");
  const [kmAtual, setKmAtual] = useState<string>("");
  const [dataHora, setDataHora] = useState<string>("");
  const [observacao, setObservacao] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/veiculos");
        const list: { id: string; placa: string }[] = await res.json();
        setVehicles((list || []).map((v) => ({ id: v.id, placa: v.placa })));
      } catch {
        setVehicles([]);
      }
    })();
  }, []);

  const submit = async () => {
    if (!vehicleId || !litros || !valor || !kmAtual) {
      alert("Preencha veículo, litros, valor e km.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/registrar-abastecimento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          litros,
          valor,
          kmAtual,
          dataHora,
          observacao,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Erro: ${err.error ?? res.status}`);
        setSaving(false);
        return;
      }
      onClose();
      window.location.reload();
    } catch {
      alert("Erro ao salvar");
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm">Veículo</label>
      <select
        className="border rounded p-2 text-black"
        value={vehicleId}
        onChange={(e) => setVehicleId(e.target.value)}
      >
        <option value="">Selecione</option>
        {vehicles.map((v) => (
          <option key={v.id} value={v.id}>
            {v.placa}
          </option>
        ))}
      </select>

      <input
        className="border rounded p-2 text-black"
        placeholder="Litros"
        type="number"
        value={litros}
        onChange={(e) => setLitros(e.target.value)}
      />
      <input
        className="border rounded p-2 text-black"
        placeholder="Valor (R$)"
        type="number"
        step="0.01"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
      />
      <input
        className="border rounded p-2 text-black"
        placeholder="KM atual"
        type="number"
        value={kmAtual}
        onChange={(e) => setKmAtual(e.target.value)}
      />
      <input
        className="border rounded p-2 text-black"
        placeholder="Data/hora (opcional)"
        type="datetime-local"
        value={dataHora}
        onChange={(e) => setDataHora(e.target.value)}
      />
      <textarea
        className="border rounded p-2 text-black"
        placeholder="Observação (opcional)"
        value={observacao}
        onChange={(e) => setObservacao(e.target.value)}
      />
      <div className="flex justify-end gap-2 mt-1">
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={submit} disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}

function EditRotaForm({
  rota,
  onClose,
}: {
  rota: RotaRecord;
  onClose: () => void;
}) {
  const [kmSaida, setKmSaida] = useState<string>(rota.kmSaida.toString());
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!kmSaida || isNaN(Number(kmSaida))) {
      alert("Digite uma quilometragem válida.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/rotas/${rota.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kmSaida: Number(kmSaida),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Erro: ${err.error ?? res.status}`);
        setSaving(false);
        return;
      }

      onClose();
      window.location.reload();
    } catch {
      alert("Erro ao salvar");
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm text-gray-600">
        <p>
          <strong>Veículo:</strong> {rota.vehicle?.placa ?? "-"}
        </p>
        <p>
          <strong>Rota:</strong> {rota.partida} → {rota.destino}
        </p>
        <p>
          <strong>Data:</strong>{" "}
          {new Date(rota.createdAt).toLocaleString("pt-BR")}
        </p>
      </div>

      <label className="text-sm font-medium">Quilometragem de Saída (km)</label>
      <input
        className="border rounded p-2 text-black"
        placeholder="Ex: 138913"
        type="number"
        value={kmSaida}
        onChange={(e) => setKmSaida(e.target.value)}
      />

      <div className="flex justify-end gap-2 mt-1">
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={submit} disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
