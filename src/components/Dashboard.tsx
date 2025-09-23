"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { type Session } from "next-auth";

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

export function Dashboard({ session }: { session: Session }) {
  const [kmRecords, setKmRecords] = useState<KmRecord[]>([]);
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
  const [vehicleInfo, setVehicleInfo] = useState<Vehicle | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/historico");
        const data = await res.json();
        setKmRecords(data.kmRecords ?? []);
        setFuelRecords(data.fuelRecords ?? []);
      } catch {
        setKmRecords([]);
        setFuelRecords([]);
      }
    };

    fetchData();

    if (session?.user?.vehicle) {
      const v = session.user.vehicle;
      setVehicleInfo({
        id: v.id,
        placa: v.placa,
        modelo: v.modelo ?? "",
      });
    } else {
      setVehicleInfo(null);
    }
  }, [session]);

  return (
    <main className="min-h-screen px-4 py-6">
      <h1 className="text-xl font-bold mb-1">Bem-vindo à KL Rotas</h1>

      {vehicleInfo ? (
        <p className="text-sm text-gray-400 mb-4">
          Veículo atual: <strong>{vehicleInfo.placa}</strong> –{" "}
          {vehicleInfo.modelo}
        </p>
      ) : (
        <p className="text-sm text-red-500 mb-4">Nenhum veículo selecionado.</p>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Button className="mb-6" onClick={() => router.push("/rota/nova")}>
          Registrar Rota
        </Button>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Últimas Quilometragens</h2>
        <div className="flex flex-col gap-3">
          {kmRecords.length > 0 ? (
            kmRecords.map((r) => (
              <div
                key={r.id}
                className="bg-white p-3 rounded-xl shadow-md flex gap-4 items-center"
              >
                <Image
                  src={r.photoUrl}
                  alt="Odômetro"
                  className="w-20 h-20 object-cover rounded-lg"
                  width={80}
                  height={80}
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

      <section>
        <h2 className="text-lg font-semibold mb-2">Últimos Abastecimentos</h2>
        <div className="flex flex-col gap-3">
          {fuelRecords.length > 0 ? (
            fuelRecords.map((r) => (
              <div
                key={r.id}
                className="bg-white p-3 rounded-xl shadow-md flex gap-4 items-center"
              >
                <Image
                  src={r.photoUrl}
                  alt="Cupom"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-lg"
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
