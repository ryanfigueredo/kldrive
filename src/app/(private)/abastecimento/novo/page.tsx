"use client";

import ImageUpload from "@/components/ImageUpload";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const [foto, setFoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!foto || !litros || !valor || !kmAtual) {
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
      formData.append("foto", foto);

      const res = await fetch("/api/fuel-records", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Erro ao salvar: ${error.error || "erro desconhecido"}`);
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
    <main className="min-h-screen px-4 py-6 ">
      <h1 className="text-xl font-bold mb-6">Registrar Abastecimento</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ImageUpload onChange={setFoto} />

        <input
          type="number"
          placeholder="Litros abastecidos"
          value={litros}
          onChange={(e) => setLitros(e.target.value)}
          className="border rounded-none-lg p-3 w-full text-black"
        />

        <input
          type="number"
          placeholder="Valor total (R$)"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="border rounded-none-lg p-3 w-full text-black"
        />

        <Select value={situacao} onValueChange={setSituacao}>
          <SelectTrigger className="">
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
          placeholder="Quilometragem atual"
          value={kmAtual}
          onChange={(e) => setKmAtual(e.target.value)}
          className="border rounded-none-lg p-3 w-full text-black"
        />

        <textarea
          placeholder="Observações (opcional)"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          className="border rounded-none-lg p-3 w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-primary  py-3 rounded-none-xl hover:bg-black/40 transition disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Registrar"}
        </button>
      </form>
    </main>
  );
}
