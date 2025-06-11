import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import PerfilClient from "@/components/PerfilClient";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);

  return <PerfilClient session={session!} />;
}
