import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FiltroRotasProps {
  onFiltroChange: (filtros: {
    dataInicio?: Date;
    dataFim?: Date;
    periodo?: string;
    tipo?: "ALL" | "ROTA" | "ABASTECIMENTO";
  }) => void;
}

export function FiltroRotas({ onFiltroChange }: FiltroRotasProps) {
  const [dataInicio, setDataInicio] = useState<Date>();
  const [dataFim, setDataFim] = useState<Date>();
  const [periodo, setPeriodo] = useState<string>("");
  const [tipo, setTipo] = useState<"ALL" | "ROTA" | "ABASTECIMENTO">("ALL");

  const limparFiltros = () => {
    setDataInicio(undefined);
    setDataFim(undefined);
    setPeriodo("");
    setTipo("ALL");
    onFiltroChange({});
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 rounded-lg">
      <Select
        value={tipo}
        onValueChange={(v) => {
          const novo = v as typeof tipo;
          setTipo(novo);
          onFiltroChange({ dataInicio, dataFim, periodo, tipo: novo });
        }}
      >
        <SelectTrigger className="w-56 ">
          <SelectValue placeholder="Tipo de Registro" />
        </SelectTrigger>
        <SelectContent className="bg-gray-50 text-black">
          <SelectItem value="ALL">Todos os tipos</SelectItem>
          <SelectItem value="ROTA">Apenas Rotas</SelectItem>
          <SelectItem value="ABASTECIMENTO">Apenas Abastecimentos</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-40 bg-gray-50 ">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dataInicio
              ? format(dataInicio, "dd/MM/yyyy", { locale: ptBR })
              : "Data início"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-gray-50 text-black">
          <Calendar
            mode="single"
            selected={dataInicio}
            onSelect={(date) => {
              setDataInicio(date);
              onFiltroChange({ dataInicio: date, dataFim, periodo, tipo });
            }}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-40 bg-gray-50">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dataFim
              ? format(dataFim, "dd/MM/yyyy", { locale: ptBR })
              : "Data fim"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-gray-50 text-black">
          <Calendar
            mode="single"
            selected={dataFim}
            onSelect={(date) => {
              setDataFim(date);
              onFiltroChange({ dataInicio, dataFim: date, periodo, tipo });
            }}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      <Button variant="outline" className="bg-gray-50" onClick={limparFiltros}>
        <Filter className="mr-2 h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
}
