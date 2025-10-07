import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um valor monetário para o padrão brasileiro (R$ x,xx)
 * @param valor - O valor numérico a ser formatado
 * @param casasDecimais - Número de casas decimais (padrão: 2)
 * @returns String formatada no padrão brasileiro
 */
export function formatarMoeda(
  valor: number,
  casasDecimais: number = 2
): string {
  return `R$ ${valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  })}`;
}
