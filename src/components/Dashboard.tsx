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
  const [showToast, setShowToast] = useState(false);
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

    // Mostrar toast informativo ao entrar no aplicativo
    setShowToast(true);
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [session]);

  return (
    <>
      {/* Toast Mobile */}
      {showToast && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg animate-in slide-in-from-top-2 duration-1400">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="text-sm">
              <p className="font-medium">Informação Importante</p>
              <p className="text-blue-100">
                Registre apenas a rota com a foto do odômetro. Os dados de
                abastecimento serão importados do Ticket Log.
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen px-4 py-6">
        <h1 className="text-xl font-bold mb-1">Bem-vindo à KL Rotas</h1>

        {vehicleInfo ? (
          <p className="text-sm text-gray-400 mb-4">
            Veículo atual: <strong>{vehicleInfo.placa}</strong> –{" "}
            {vehicleInfo.modelo}
          </p>
        ) : (
          <p className="text-sm text-red-500 mb-4">
            Nenhum veículo selecionado.
          </p>
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
                        {r.litros} L – R${" "}
                        {r.valor.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
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
    </>
  );
}
