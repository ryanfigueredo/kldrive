import { redirect } from "next/navigation";

export default function AbastecimentoRedirectPage() {
  // Fluxo de abastecimento foi movido para importação no painel Admin
  redirect("/rota/nova");
}
