import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import NovoAbastecimentoClient from "@/components/NovoAbastecimentoClient";

export default async function AbastecimentoPage() {
  const session = await getServerSession(authOptions);

  return <NovoAbastecimentoClient session={session!} />;
}
