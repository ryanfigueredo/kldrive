"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NovoKm() {
  const [km, setKm] = useState("");
  const [observacao, setObservacao] = useState("");
  const [veiculoId, setVeiculoId] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [veiculos, setVeiculos] = useState<{ id: string; placa: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/veiculos")
      .then((res) => res.json())
      .then((data) => setVeiculos(data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const kmValue = parseFloat(km);
    if (isNaN(kmValue) || kmValue <= 0) {
      alert("Informe uma quilometragem válida.");
      return;
    }

    if (!veiculoId || !foto) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("km", km);
      formData.append("observacao", observacao);
      formData.append("veiculoId", veiculoId);
      formData.append("foto", foto);

      const res = await fetch("/api/km-records", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Erro ao salvar quilometragem");
        setLoading(false);
        return;
      }

      alert("Quilometragem registrada com sucesso!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen  p-6">
      <h1 className="text-xl font-bold mb-6 ">Registrar Quilometragem</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <input
          type="number"
          min="0"
          step="any"
          placeholder="Quilometragem"
          value={km}
          onChange={(e) => setKm(e.target.value)}
          className="p-3 rounded-md text-black"
          required
        />

        <textarea
          placeholder="Observação (opcional)"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          className="p-3 rounded-md resize-none"
          rows={3}
        />

        <Select value={veiculoId} onValueChange={setVeiculoId}>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Selecione o veículo" />
          </SelectTrigger>
          <SelectContent>
            {veiculos.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.placa}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ImageUpload onChange={setFoto} />

        <button
          type="submit"
          disabled={loading}
          className="bg-primary py-3 rounded-xl hover:bg-violet-700 transition disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Registrar"}
        </button>
      </form>
    </main>
  );
}
