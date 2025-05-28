"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface KmRecord {
  id: string;
  km: number;
  photoUrl: string;
  observacao: string | null;
  createdAt: string;
}

interface FuelRecord {
  id: string;
  litros: number;
  valor: number;
  situacaoTanque: string;
  kmAtual: number;
  photoUrl: string;
  observacao: string | null;
  createdAt: string;
}

interface Vehicle {
  id: string;
  placa: string;
  modelo: string | null;
}

export default function Dashboard() {
  const [kmRecords, setKmRecords] = useState<KmRecord[]>([]);
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);

  const { data: session } = useSession();
  const [vehicleInfo, setVehicleInfo] = useState<Vehicle | null>(null);

  // Dialog e formulário de quilometragem
  const [openKmDialog, setOpenKmDialog] = useState(false);
  const [km, setKm] = useState("");
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(false);

  // Buscar dados iniciais e veículo vinculado do usuário
  useEffect(() => {
    fetch("/api/historico")
      .then((res) => res.json())
      .then((data) => {
        setKmRecords(data.kmRecords ?? []);
        setFuelRecords(data.fuelRecords ?? []);
      })
      .catch(() => {
        setKmRecords([]);
        setFuelRecords([]);
      });

    // Pega veículo do usuário logado da sessão (veículos vem pelo next-auth)
    if (session?.user?.vehicles && session.user.vehicles.length > 0) {
      const v = session.user.vehicles[0];
      setVehicleInfo({
        id: v.id,
        placa: v.placa,
        modelo: v.modelo ?? "",
      });
    } else {
      setVehicleInfo(null);
    }
  }, [session]);

  async function handleSubmitKm(e: React.FormEvent) {
    e.preventDefault();

    if (!km || !vehicleInfo) {
      alert("Preencha a quilometragem e tenha um veículo selecionado.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("km", km);
      formData.append("observacao", observacao);
      formData.append("veiculoId", vehicleInfo.id);

      // Se for foto, pode adicionar aqui, ex:
      // formData.append("foto", file);

      const res = await fetch("/api/km-records", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Erro ao registrar quilometragem.");
      } else {
        alert("Quilometragem registrada com sucesso!");
        setKm("");
        setObservacao("");
        setOpenKmDialog(false);
        // Atualize a lista de registros aqui para refletir a nova quilometragem
        const updated = await fetch("/api/historico").then((r) => r.json());
        setKmRecords(updated.kmRecords ?? []);
      }
    } catch (error) {
      console.error(error);
      alert("Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6  ">
      <h1 className="text-xl font-bold mb-1">Bem-vindo à KL Drive</h1>

      {vehicleInfo ? (
        <p className="text-sm text-gray-400 mb-4">
          Veículo atual: <strong>{vehicleInfo.placa}</strong> –{" "}
          {vehicleInfo.modelo}
        </p>
      ) : (
        <p className="text-sm text-red-500 mb-4">Nenhum veículo selecionado.</p>
      )}

      {/* Botão para abrir o Dialog de Registrar Quilometragem */}
      <Dialog open={openKmDialog} onOpenChange={setOpenKmDialog}>
        <DialogTrigger asChild>
          <Button className="mb-6">Registrar Quilometragem</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Quilometragem</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitKm} className="space-y-4">
            <div>
              <Label htmlFor="km">Quilometragem</Label>
              <Input
                id="km"
                type="number"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="observacao">Observação</Label>
              <Input
                id="observacao"
                type="text"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AQUI pode colocar outro Dialog para registrar abastecimento (se quiser) */}

      {/* Últimas quilometragens */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Últimas Quilometragens</h2>
        <div className="flex flex-col gap-3">
          {Array.isArray(kmRecords) && kmRecords.length > 0 ? (
            kmRecords.map((r) => (
              <div
                key={r.id}
                className="bg-white p-3 rounded-none-xl shadow-md flex gap-4 items-center"
              >
                <img
                  src={r.photoUrl}
                  alt="Odômetro"
                  className="w-20 h-20 object-cover rounded-none-lg"
                />
                <div className="text-sm text-gray-800">
                  <p>
                    <strong>{r.km} km</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                  {r.observacao && <p className="text-xs">{r.observacao}</p>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              Nenhuma quilometragem registrada ainda.
            </p>
          )}
        </div>
      </section>

      {/* Últimos abastecimentos */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Últimos Abastecimentos</h2>
        <div className="flex flex-col gap-3">
          {Array.isArray(fuelRecords) && fuelRecords.length > 0 ? (
            fuelRecords.map((r) => (
              <div
                key={r.id}
                className="bg-white p-3 rounded-none-xl shadow-md flex gap-4 items-center"
              >
                <Image
                  src={r.photoUrl}
                  alt="Cupom"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-none-lg"
                />
                <div className="text-sm text-gray-800">
                  <p>
                    <strong>
                      {r.litros} L – R${r.valor.toFixed(2)}
                    </strong>
                  </p>
                  <p className="text-xs">
                    Tanque: {r.situacaoTanque.replace("_", " ")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs">KM: {r.kmAtual}</p>
                  {r.observacao && <p className="text-xs">{r.observacao}</p>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              Nenhum abastecimento registrado ainda.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
