"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CalculadoraEficiencia({ onClose }: { onClose: () => void }) {
  const [valorGasto, setValorGasto] = useState<string>("");
  const [consumoVeiculo, setConsumoVeiculo] = useState<string>("");
  const [precoCombustivel, setPrecoCombustivel] = useState<string>("");
  const [modoCalculo, setModoCalculo] = useState<"valor" | "litros">("valor");
  const [resultado, setResultado] = useState<{
    litrosComprados: number;
    distanciaEsperada: number;
    custoPorKm: number;
    eficiencia: number;
    statusEficiencia: "excelente" | "bom" | "regular" | "ruim";
    analise: string;
  } | null>(null);

  const calcular = () => {
    const valor = parseFloat(valorGasto.replace(",", "."));
    const consumo = parseFloat(consumoVeiculo.replace(",", "."));
    const preco = parseFloat(precoCombustivel.replace(",", "."));

    if (!valor || !consumo) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    if (modoCalculo === "valor" && !preco) {
      alert("Preencha o preço do combustível!");
      return;
    }

    let litrosComprados: number;
    let valorTotal: number;

    if (modoCalculo === "valor") {
      // Modo por valor gasto
      litrosComprados = valor / preco;
      valorTotal = valor;
    } else {
      // Modo por litros
      litrosComprados = valor; // valor agora representa litros
      valorTotal = litrosComprados * (preco || 0); // se não tiver preço, não calcula valor total
    }

    const distanciaEsperada = litrosComprados * consumo;
    const custoPorKm = valorTotal > 0 ? valorTotal / distanciaEsperada : 0;
    const eficiencia = consumo; // km/l

    // Análise de eficiência baseada em padrões da indústria
    let statusEficiencia: "excelente" | "bom" | "regular" | "ruim";
    let analise: string;

    if (eficiencia >= 15) {
      statusEficiencia = "excelente";
      analise = "Excelente eficiência! O veículo está consumindo muito bem.";
    } else if (eficiencia >= 12) {
      statusEficiencia = "bom";
      analise = "Boa eficiência. O consumo está dentro do esperado.";
    } else if (eficiencia >= 8) {
      statusEficiencia = "regular";
      analise =
        "Eficiência regular. Considere verificar manutenção do veículo.";
    } else {
      statusEficiencia = "ruim";
      analise = "Eficiência baixa. Verifique pneus, filtros e motor.";
    }

    setResultado({
      litrosComprados,
      distanciaEsperada,
      custoPorKm,
      eficiencia,
      statusEficiencia,
      analise,
    });
  };

  const limpar = () => {
    setValorGasto("");
    setConsumoVeiculo("");
    setPrecoCombustivel("");
    setResultado(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-gray-600 mb-4">
        <p>
          Calcule a distância que deveria ser percorrida com o valor gasto em
          combustível.
        </p>
      </div>

      {/* Seletor de Modo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <h4 className="font-semibold text-blue-800 mb-2">Modo de Cálculo:</h4>
        <div className="flex gap-2">
          <button
            onClick={() => setModoCalculo("valor")}
            className={`px-3 py-1 rounded text-sm font-medium ${
              modoCalculo === "valor"
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600 border border-blue-300"
            }`}
          >
            Por Valor Gasto
          </button>
          <button
            onClick={() => setModoCalculo("litros")}
            className={`px-3 py-1 rounded text-sm font-medium ${
              modoCalculo === "litros"
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600 border border-blue-300"
            }`}
          >
            Por Litros
          </button>
        </div>
        <p className="text-xs text-blue-700 mt-2">
          {modoCalculo === "valor"
            ? "Digite o valor gasto e o preço do combustível"
            : "Digite a quantidade de litros comprados"}
        </p>
      </div>

      {/* Padrões de Referência */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">
          Padrões de Eficiência:
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-green-600">Excelente:</span>
            <span className="font-semibold">≥ 15 km/l</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-600">Bom:</span>
            <span className="font-semibold">12-15 km/l</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-600">Regular:</span>
            <span className="font-semibold">8-12 km/l</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-600">Ruim:</span>
            <span className="font-semibold">&lt; 8 km/l</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {modoCalculo === "valor" ? (
          <>
            <div>
              <label className="text-sm font-medium">Valor Gasto (R$)</label>
              <input
                className="w-full border rounded p-2 text-black"
                placeholder="Ex: 748,99"
                value={valorGasto}
                onChange={(e) => setValorGasto(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Preço do Combustível (R$/l)
              </label>
              <input
                className="w-full border rounded p-2 text-black"
                placeholder="Ex: 5,50"
                value={precoCombustivel}
                onChange={(e) => setPrecoCombustivel(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div>
            <label className="text-sm font-medium">Litros Comprados (L)</label>
            <input
              className="w-full border rounded p-2 text-black"
              placeholder="Ex: 389,53"
              value={valorGasto}
              onChange={(e) => setValorGasto(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="text-sm font-medium">
            Consumo do Veículo (km/l)
          </label>
          <input
            className="w-full border rounded p-2 text-black"
            placeholder="Ex: 10,2"
            value={consumoVeiculo}
            onChange={(e) => setConsumoVeiculo(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={calcular} className="flex-1">
          Calcular
        </Button>
        <Button variant="outline" onClick={limpar}>
          Limpar
        </Button>
      </div>

      {resultado && (
        <div className="space-y-4">
          {/* Resultados Principais */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3"> Resultados:</h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Litros:</span>
                <span className="font-semibold text-blue-700">
                  {resultado.litrosComprados.toFixed(2)} L
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distância esperada:</span>
                <span className="font-semibold text-green-700">
                  {resultado.distanciaEsperada.toFixed(0)} km
                </span>
              </div>
              {resultado.custoPorKm > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Custo por km:</span>
                  <span className="font-semibold text-purple-700">
                    R$ {resultado.custoPorKm.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Eficiência do veículo:</span>
                <span className="font-semibold text-orange-700">
                  {resultado.eficiencia.toFixed(1)} km/l
                </span>
              </div>
            </div>
          </div>

          {/* Análise de Eficiência */}
          <div
            className={`border rounded-lg p-4 ${
              resultado.statusEficiencia === "excelente"
                ? "bg-green-50 border-green-200"
                : resultado.statusEficiencia === "bom"
                ? "bg-blue-50 border-blue-200"
                : resultado.statusEficiencia === "regular"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <h3
              className={`font-semibold mb-3 ${
                resultado.statusEficiencia === "excelente"
                  ? "text-green-800"
                  : resultado.statusEficiencia === "bom"
                  ? "text-blue-800"
                  : resultado.statusEficiencia === "regular"
                  ? "text-yellow-800"
                  : "text-red-800"
              }`}
            >
              Análise de Eficiência:
            </h3>
            <p
              className={`text-sm ${
                resultado.statusEficiencia === "excelente"
                  ? "text-green-700"
                  : resultado.statusEficiencia === "bom"
                  ? "text-blue-700"
                  : resultado.statusEficiencia === "regular"
                  ? "text-yellow-700"
                  : "text-red-700"
              }`}
            >
              {resultado.analise}
            </p>
          </div>

          {/* Dica Personalizada */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <p className="text-xs text-gray-800">
              <strong>Dica:</strong>{" "}
              {modoCalculo === "valor" ? (
                <>
                  Com R$ {valorGasto} gastos, o funcionário deveria percorrer
                  aproximadamente{" "}
                  <strong>{resultado.distanciaEsperada.toFixed(0)} km</strong>{" "}
                  se o veículo consumir <strong>{consumoVeiculo} km/l</strong>.
                </>
              ) : (
                <>
                  Com {valorGasto} litros, o funcionário deveria percorrer
                  aproximadamente{" "}
                  <strong>{resultado.distanciaEsperada.toFixed(0)} km</strong>{" "}
                  se o veículo consumir <strong>{consumoVeiculo} km/l</strong>.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
}
