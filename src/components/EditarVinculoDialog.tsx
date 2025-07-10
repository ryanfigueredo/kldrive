"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

interface Props {
  userId: string;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface Veiculo {
  id: string;
  placa: string;
}

export function EditarVinculoDialog({ userId, open, onClose, onSaved }: Props) {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<string>("");

  useEffect(() => {
    if (open) {
      fetch("/api/admin/veiculos")
        .then((res) => res.json())
        .then(setVeiculos);
    }
  }, [open]);

  const salvar = async () => {
    await fetch("/api/admin/vincular-veiculo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, vehicleId: veiculoSelecionado }),
    });

    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="dark:bg-black bg-white">
        <DialogHeader>
          <DialogTitle>Vincular Veículo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label>Selecionar veículo:</Label>
          <Select
            value={veiculoSelecionado}
            onValueChange={setVeiculoSelecionado}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um veículo" />
            </SelectTrigger>
            <SelectContent>
              {veiculos.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.placa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={salvar} disabled={!veiculoSelecionado}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
