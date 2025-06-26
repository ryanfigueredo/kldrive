import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

/**
 * Helper para obter a sessão do usuário no lado do servidor
 */
export function getAuthSession() {
  return getServerSession(authOptions);
}
export { authOptions };
