"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CurrencyInput from "react-currency-input-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NovoAbastecimento() {
  const [litros, setLitros] = useState("");
  const [valor, setValor] = useState("");
  const [situacao, setSituacao] = useState("CHEIO");
  const [kmAtual, setKmAtual] = useState("");
  const [observacao, setObservacao] = useState("");
  const [foto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview] = useState<string | null>(null);

  const [errors, setErrors] = useState({
    foto: false,
    litros: false,
    valor: false,
    kmAtual: false,
  });

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors = {
      foto: !foto,
      litros: !litros,
      valor: !valor,
      kmAtual: !kmAtual,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("litros", litros);
      formData.append("valor", valor);
      formData.append("situacao", situacao);
      formData.append("kmAtual", kmAtual);
      formData.append("observacao", observacao);
      formData.append("foto", foto as File);

      const res = await fetch("/api/fuel-records", {
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
    <main className="min-h-screen px-4 py-6">
      <h1 className="text-xl font-bold mb-6">Registrar Abastecimento</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Foto do Odômetro *</label>
          {preview && (
            <Image
              src={preview}
              alt="Preview"
              className="rounded-lg max-w-xs"
              width={320}
              height={240}
            />
          )}
        </div>

        <input
          type="number"
          placeholder="Litros abastecidos (ex.: 45)*"
          value={litros}
          onChange={(e) => setLitros(e.target.value)}
          className={`border rounded-lg p-3 w-full text-black ${
            errors.litros ? "border-red-500" : ""
          }`}
        />

        <CurrencyInput
          placeholder="Valor total (R$) *"
          decimalsLimit={2}
          prefix="R$ "
          value={valor}
          onValueChange={(value) => setValor(value || "")}
          className={`border rounded-lg p-3 w-full text-black ${
            errors.valor ? "border-red-500" : ""
          }`}
        />

        <Select value={situacao} onValueChange={setSituacao}>
          <SelectTrigger>
            <SelectValue placeholder="Situação do tanque" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CHEIO">Tanque cheio</SelectItem>
            <SelectItem value="MEIO_TANQUE">Meio tanque</SelectItem>
            <SelectItem value="QUASE_VAZIO">Quase vazio</SelectItem>
          </SelectContent>
        </Select>

        <input
          type="number"
          placeholder="Quilometragem atual (ex.: 123456)*"
          value={kmAtual}
          onChange={(e) => setKmAtual(e.target.value)}
          className={`border rounded-lg p-3 w-full text-black ${
            errors.kmAtual ? "border-red-500" : ""
          }`}
        />

        <textarea
          placeholder="Observações (opcional)"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          className="border rounded-lg p-3 w-full"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary py-3 px-4 rounded-xl hover:bg-black/40 transition disabled:opacity-50 flex-1"
          >
            {loading ? "Enviando..." : "Registrar"}
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
