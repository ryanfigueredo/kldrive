"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type Session } from "next-auth";

export default function NovoRotaClient({ session }: { session: Session }) {
  const router = useRouter();
  const [vehicleInfo, setVehicleInfo] = useState<{
    id: string;
    placa: string;
    modelo: string | null;
  } | null>(null);

  const [kmSaida, setKmSaida] = useState("");
  const [fotoKm, setFotoKm] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [partida, setPartida] = useState("");
  const [destino, setDestino] = useState("");
  const [alterouRota, setAlterouRota] = useState(false);
  const [alteracaoRota, setAlteracaoRota] = useState("");
  const [realizouAbastecimento, setRealizouAbastecimento] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    fotoKm: false,
    kmSaida: false,
    partida: false,
    destino: false,
  });

  useEffect(() => {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors = {
      fotoKm: !fotoKm,
      kmSaida: !kmSaida,
      partida: !partida,
      destino: !destino,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!vehicleInfo?.id) {
      alert("Nenhum veículo selecionado.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("kmSaida", kmSaida);
      formData.append("fotoKm", fotoKm as File);
      formData.append("partida", partida);
      formData.append("destino", destino);
      formData.append("alterouRota", String(alterouRota));
      if (alterouRota) formData.append("alteracaoRota", alteracaoRota);
      formData.append("realizouAbastecimento", String(realizouAbastecimento));
      formData.append("veiculoId", vehicleInfo.id);

      const res = await fetch("/api/rotas", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Erro ao salvar: ${error.error || "Erro desconhecido"}`);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 pb-24">
      <h1 className="text-xl font-bold mb-6">Registrar Rota</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Foto do KM Atual *</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFotoKm(file);
                setPreview(URL.createObjectURL(file));
              }
            }}
            className={`border rounded-lg p-3 w-full ${
              errors.fotoKm ? "border-red-500" : ""
            }`}
          />
          {preview && (
            <Image
              src={preview}
              alt="Preview"
              className="rounded-lg max-w-xs mt-2"
              width={320}
              height={240}
            />
          )}
        </div>

        <input
          type="number"
          placeholder="KM de Saída*"
          value={kmSaida}
          onChange={(e) => setKmSaida(e.target.value)}
          className={`border rounded-lg p-3 w-full text-black ${
            errors.kmSaida ? "border-red-500" : ""
          }`}
        />

        <input
          type="text"
          placeholder="Local de Partida*"
          value={partida}
          onChange={(e) => setPartida(e.target.value)}
          className={`border rounded-lg p-3 w-full text-black ${
            errors.partida ? "border-red-500" : ""
          }`}
        />

        <input
          type="text"
          placeholder="Local de Destino*"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
          className={`border rounded-lg p-3 w-full text-black ${
            errors.destino ? "border-red-500" : ""
          }`}
        />

        <div>
          <label className="font-semibold">Alterou a Rota?</label>
          <div className="flex gap-4 mt-1">
            <button
              type="button"
              className={
                alterouRota
                  ? "bg-primary text-black py-2 px-4 rounded-xl"
                  : "bg-white text-black border py-2 px-4 rounded-xl"
              }
              onClick={() => setAlterouRota(true)}
            >
              Sim
            </button>
            <button
              type="button"
              className={
                !alterouRota
                  ? "bg-primary text-black py-2 px-4 rounded-xl"
                  : "bg-white text-black border py-2 px-4 rounded-xl"
              }
              onClick={() => setAlterouRota(false)}
            >
              Não
            </button>
          </div>
        </div>
        {alterouRota && (
          <input
            type="text"
            required
            placeholder="Descreva a alteração*"
            value={alteracaoRota}
            onChange={(e) => setAlteracaoRota(e.target.value)}
            className="border rounded-lg p-3 w-full text-black"
          />
        )}

        <div>
          <label className="font-semibold">Realizou Abastecimento?</label>
          <div className="flex gap-4 mt-1">
            <button
              type="button"
              className={
                realizouAbastecimento
                  ? "bg-primary text-black py-2 px-4 rounded-xl"
                  : "bg-white text-black border py-2 px-4 rounded-xl"
              }
              onClick={() => setRealizouAbastecimento(true)}
            >
              Sim
            </button>
            <button
              type="button"
              className={
                !realizouAbastecimento
                  ? "bg-primary text-black py-2 px-4 rounded-xl"
                  : "bg-white text-black border py-2 px-4 rounded-xl"
              }
              onClick={() => setRealizouAbastecimento(false)}
            >
              Não
            </button>
          </div>
          {realizouAbastecimento && (
            <div className="text-yellow-700 text-sm mt-2">
              ⛽ Não esqueça de registrar também o Abastecimento.
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary py-3 px-4 rounded-xl hover:bg-black/40 transition disabled:opacity-50 flex-1 font-bold"
          >
            {loading ? "Registrando..." : "Registrar"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="bg-gray-300 py-3 px-4 rounded-xl hover:bg-gray-400 transition"
          >
            Voltar
          </button>
        </div>
      </form>
    </main>
  );
}
