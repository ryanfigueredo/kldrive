import { getToken } from "next-auth/jwt";
import { NextApiRequest } from "next";

export async function getUserEmail(
  req: NextApiRequest
): Promise<string | null> {
  const token = await getToken({ req });
  return token?.email ?? null;
}
