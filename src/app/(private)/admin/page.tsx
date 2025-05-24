"use client";

import { useEffect, useState } from "react";
import { DateSelector } from "@/components/DateSelector";
import { useSession } from "next-auth/react";
import { CriarUsuarioDialog } from "@/components/CriarUsuarioDialog";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}
import { useRouter } from "next/navigation";
import Chart from "@/components/Chart";
import Image from "next/image";
import { CriarVeiculoDialog } from "@/components/CriarVeiculoDialog";

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

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "ADMIN") {
      alert("Acesso restrito ao administrador.");
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (tipo) params.set("tipo", tipo);
    if (usuario) params.set("usuario", usuario);
    if (veiculo) params.set("veiculo", veiculo);
    if (startDate) params.set("startDate", startDate.toISOString());
    if (endDate) params.set("endDate", endDate.toISOString());

    fetch(`/api/admin/registros?${params.toString()}`)
      .then((res) => res.json())
      .then((data: Registro[]) => setRegistros(data ?? []));

    fetch(`/api/admin/dashboard-metrics?${params.toString()}`)
      .then((res) => res.json())
      .then((data: GraficoData) => setGraficoData(data ?? {}));
  }, [tipo, startDate, endDate, usuario, veiculo]);

  return (
    <main className="min-h-screen px-4 py-6 bg-dark text-white">
      <h1 className="text-xl font-bold mb-6">Painel Administrativo</h1>

      <div className="flex gap-4 mb-4">
        <CriarUsuarioDialog onUserCreated={() => window.location.reload()} />
        <CriarVeiculoDialog onCreated={() => window.location.reload()} />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <DateSelector
          label="Data Inicial"
          date={startDate}
          setDate={setStartDate}
        />
        <DateSelector label="Data Final" date={endDate} setDate={setEndDate} />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="bg-dark border border-gray-600 rounded-md p-2 text-white w-full"
        >
          <option value="">Todos os tipos</option>
          <option value="KM">Quilometragem</option>
          <option value="ABASTECIMENTO">Abastecimento</option>
        </select>

        <button
          onClick={() => {
            setTipo("");
            setUsuario("");
            setVeiculo("");
            setStartDate(undefined);
            setEndDate(undefined);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold"
        >
          Limpar Filtros
        </button>
      </div>

      {/* TOTALIZADORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1f1f1f] p-4 rounded-xl text-white">
          <p className="text-sm text-gray-400">Total KM Rodado</p>
          <h3 className="text-2xl font-bold">
            {graficoData.totalKm ? graficoData.totalKm.toLocaleString() : "0"}{" "}
            km
          </h3>
        </div>
        <div className="bg-[#1f1f1f] p-4 rounded-xl text-white">
          <p className="text-sm text-gray-400">Valor Total Abastecido</p>
          <h3 className="text-2xl font-bold">
            R$ {graficoData.totalValorAbastecido?.toFixed(2) ?? "0.00"}
          </h3>
        </div>
        <div className="bg-[#1f1f1f] p-4 rounded-xl text-white">
          <p className="text-sm text-gray-400">Registros de KM</p>
          <h3 className="text-2xl font-bold">
            {graficoData.totalPorTipo?.KM ?? 0}
          </h3>
        </div>
        <div className="bg-[#1f1f1f] p-4 rounded-xl text-white">
          <p className="text-sm text-gray-400">Registros de Abastecimento</p>
          <h3 className="text-2xl font-bold">
            {graficoData.totalPorTipo?.ABASTECIMENTO ?? 0}
          </h3>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="bg-[#1f1f1f] p-4 rounded-xl text-white">
          <h3 className="text-lg font-semibold mb-2">KM por Dia</h3>
          {graficoData.kmPorData &&
          Object.keys(graficoData.kmPorData).length > 0 ? (
            <Chart
              data={Object.entries(graficoData.kmPorData).map(([dia, km]) => ({
                name: dia,
                total: Number(km),
              }))}
              colors={["lime"]}
            />
          ) : (
            <p className="text-gray-500 text-sm">Sem dados para exibir.</p>
          )}
        </div>

        <div className="bg-[#1f1f1f] p-4 rounded-xl text-white">
          <h3 className="text-lg font-semibold mb-2">Distribuição por Tipo</h3>
          {graficoData.totalPorTipo &&
          (graficoData.totalPorTipo.KM ||
            graficoData.totalPorTipo.ABASTECIMENTO) ? (
            <Chart
              data={[
                {
                  name: "KM",
                  total: graficoData.totalPorTipo.KM ?? 0,
                },
                {
                  name: "Abastecimento",
                  total: graficoData.totalPorTipo.ABASTECIMENTO ?? 0,
                },
              ]}
              colors={["lime", "violet"]}
              type="pie"
            />
          ) : (
            <p className="text-gray-500 text-sm">Sem dados para exibir.</p>
          )}
        </div>
      </div>

      {/* LISTAGEM */}
      <section className="flex flex-col gap-3">
        {registros.length > 0 ? (
          registros.map((r) => (
            <div
              key={r.id}
              className="bg-[#1f1f1f] rounded-xl shadow-md p-4 flex gap-4 items-center"
            >
              <Image
                width={80}
                height={80}
                src={r.imagem}
                alt="Registro"
                className="rounded-lg object-cover"
              />
              <div className="text-sm text-white">
                <p>
                  <strong>{r.tipo}</strong> – {r.placa}
                </p>
                <p>
                  {r.km} km – R${r.valor.toFixed(2)}
                </p>
                <p className="text-gray-400 text-xs">{r.usuario}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(r.data).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">Nenhum registro encontrado.</p>
        )}
      </section>
    </main>
  );
}
