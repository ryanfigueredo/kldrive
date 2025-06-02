"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { CriarUsuarioDialog } from "@/components/CriarUsuarioDialog";
import { CriarVeiculoDialog } from "@/components/CriarVeiculoDialog";
import { RegistroItem } from "@/components/RegistroItem";
import { FiltroDialog } from "@/components/FiltroDialog";

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

export default function AdminDashboard() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [tipo, setTipo] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [graficoData, setGraficoData] = useState<GraficoData>({});
  const [usuario, setUsuario] = useState("");
  const [veiculo, setVeiculo] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: session, status } = useSession();
  const router = useRouter();

  // Debounce para evitar chamadas em excesso
  const debouncedTipo = useDebounce(tipo, 500);
  const debouncedStartDate = useDebounce(startDate, 500);
  const debouncedEndDate = useDebounce(endDate, 500);
  const debouncedUsuario = useDebounce(usuario, 500);
  const debouncedVeiculo = useDebounce(veiculo, 500);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "ADMIN") {
      alert("Acesso restrito ao administrador.");
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (debouncedTipo) params.set("tipo", debouncedTipo);
        if (debouncedUsuario) params.set("usuario", debouncedUsuario);
        if (debouncedVeiculo) params.set("veiculo", debouncedVeiculo);
        if (debouncedStartDate)
          params.set("startDate", debouncedStartDate.toISOString());
        if (debouncedEndDate)
          params.set("endDate", debouncedEndDate.toISOString());

        const [registrosRes, dashboardRes] = await Promise.all([
          fetch(`/api/admin/registros?${params.toString()}`),
          fetch(`/api/admin/dashboard-metrics?${params.toString()}`),
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
  }, [
    debouncedTipo,
    debouncedStartDate,
    debouncedEndDate,
    debouncedUsuario,
    debouncedVeiculo,
  ]);

  const limparFiltros = () => {
    setTipo("");
    setUsuario("");
    setVeiculo("");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <main className="min-h-screen px-4 py-6">
      <h1 className="text-xl font-bold mb-6">Painel Administrativo</h1>

      <div className="flex gap-4 mb-4 text-white">
        <CriarUsuarioDialog onUserCreated={() => window.location.reload()} />
        <CriarVeiculoDialog onCreated={() => window.location.reload()} />
        <FiltroDialog
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          tipo={tipo}
          setTipo={setTipo}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          usuario={usuario}
          setUsuario={setUsuario}
          veiculo={veiculo}
          setVeiculo={setVeiculo}
          onClearFilters={limparFiltros}
        />
      </div>

      {loading && <p>Carregando dados...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* TOTALIZADORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl">
          <p className="text-sm text-gray-400">Total KM Rodado</p>
          <h3 className="text-2xl font-bold">
            {graficoData.totalKm ? graficoData.totalKm.toLocaleString() : "0"}{" "}
            km
          </h3>
        </div>
        <div className="p-4 rounded-xl">
          <p className="text-sm text-gray-400">Valor Total Abastecido</p>
          <h3 className="text-2xl font-bold">
            R$ {graficoData.totalValorAbastecido?.toFixed(2) ?? "0.00"}
          </h3>
        </div>
        <div className="p-4 rounded-xl">
          <p className="text-sm text-gray-400">Registros de KM</p>
          <h3 className="text-2xl font-bold">
            {graficoData.totalPorTipo?.KM ?? 0}
          </h3>
        </div>
        <div className="p-4 rounded-xl">
          <p className="text-sm text-gray-400">Registros de Abastecimento</p>
          <h3 className="text-2xl font-bold">
            {graficoData.totalPorTipo?.ABASTECIMENTO ?? 0}
          </h3>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        {registros.length > 0 ? (
          registros.map((r) => <RegistroItem key={r.id} r={r} />)
        ) : !loading ? (
          <p className="text-gray-400">Nenhum registro encontrado.</p>
        ) : null}
      </section>
    </main>
  );
}
