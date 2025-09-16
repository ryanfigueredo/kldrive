"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId: string | null;
}

export default function CriarQuilometragemDialog({
  open,
  onOpenChange,
  vehicleId,
}: Props) {
  const [km, setKm] = useState("");
  const [observacao, setObservacao] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Converte a imagem para base64
  async function getBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject("Erro ao converter imagem");
      };
      reader.onerror = (error) => reject(error);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!km || !foto || !vehicleId) {
      alert("Preencha todos os campos e selecione veículo.");
      return;
    }

    setLoading(true);

    try {
      const photoBase64 = await getBase64(foto);

      const res = await fetch("/api/km-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          km,
          observacao,
          vehicleId,
          photoBase64,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao registrar quilometragem");
        setLoading(false);
        return;
      }

      alert("Quilometragem registrada com sucesso!");
      setKm("");
      setObservacao("");
      setFoto(null);
      onOpenChange(false);
    } catch {
      alert("Erro inesperado ao registrar quilometragem");
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Abastecimento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <Label htmlFor="foto">Foto do odômetro</Label>
            <input
              id="foto"
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) setFoto(e.target.files[0]);
              }}
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
