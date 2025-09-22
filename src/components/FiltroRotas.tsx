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

  const handlePeriodoChange = (value: string) => {
    setPeriodo(value);
    const hoje = new Date();
    let inicio: Date | undefined;
    let fim: Date | undefined = hoje;

    switch (value) {
      case "hoje":
        inicio = hoje;
        break;
      case "semana":
        inicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "mes":
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        break;
      case "trimestre":
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
        break;
      case "ano":
        inicio = new Date(hoje.getFullYear(), 0, 1);
        break;
      default:
        inicio = dataInicio;
        fim = dataFim;
    }

    setDataInicio(inicio);
    setDataFim(fim);
    onFiltroChange({ dataInicio: inicio, dataFim: fim, periodo: value, tipo });
  };

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
      <Select value={periodo} onValueChange={handlePeriodoChange}>
        <SelectTrigger className="w-40 ">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent className="bg-gray-50 text-black">
          <SelectItem value="hoje">Hoje</SelectItem>
          <SelectItem value="semana">Última semana</SelectItem>
          <SelectItem value="mes">Este mês</SelectItem>
          <SelectItem value="trimestre">Último trimestre</SelectItem>
          <SelectItem value="ano">Este ano</SelectItem>
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
