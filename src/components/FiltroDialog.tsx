"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { DateSelector } from "@/components/DateSelector";

interface FiltroDialogProps {
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  tipo: string;
  setTipo: (tipo: string) => void;
  startDate?: Date;
  setStartDate: (date?: Date) => void;
  endDate?: Date;
  setEndDate: (date?: Date) => void;
  usuario: string;
  setUsuario: (u: string) => void;
  veiculo: string;
  setVeiculo: (v: string) => void;
  onClearFilters: () => void;
}

export function FiltroDialog({
  filtersOpen,
  setFiltersOpen,
  tipo,
  setTipo,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  usuario,
  setUsuario,
  veiculo,
  setVeiculo,
  onClearFilters,
}: FiltroDialogProps) {
  return (
    <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
      <DialogTrigger asChild>
        <button className="bg-[#c8d22c] px-4 py-2 rounded-md font-semibold">
          Filtros
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filtros</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <DateSelector
            label="Data Inicial"
            date={startDate}
            setDate={setStartDate}
          />
          <DateSelector
            label="Data Final"
            date={endDate}
            setDate={setEndDate}
          />

          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="border border-gray-600 rounded-md p-2 w-full"
          >
            <option value="">Todos os tipos</option>
            <option value="KM">Quilometragem</option>
            <option value="ABASTECIMENTO">Abastecimento</option>
          </select>

          <input
            type="text"
            placeholder="Usuário (email)"
            className="border border-gray-600 rounded-md p-2 w-full"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />

          <input
            type="text"
            placeholder="Veículo (placa)"
            className="border border-gray-600 rounded-md p-2 w-full"
            value={veiculo}
            onChange={(e) => setVeiculo(e.target.value)}
          />
        </div>

        <DialogFooter className="flex justify-between">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClearFilters}
          >
            Limpar
          </button>

          <DialogClose asChild>
            <button className="bg-[#c8d22c] px-4 py-2 rounded-md font-semibold">
              Aplicar
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
