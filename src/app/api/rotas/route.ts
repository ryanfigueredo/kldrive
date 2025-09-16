import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { uploadToS3Buffer } from "@/lib/s3";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const formData = await req.formData();

  const kmSaida = parseFloat(formData.get("kmSaida")?.toString() ?? "0");
  const partida = formData.get("partida")?.toString() ?? "";
  const destino = formData.get("destino")?.toString() ?? "";
  const alterouRota = formData.get("alterouRota") === "true";
  const alteracaoRota = formData.get("alteracaoRota")?.toString() ?? "";
  const realizouAbastecimento =
    formData.get("realizouAbastecimento") === "true";
  const veiculoId = formData.get("veiculoId")?.toString();
  const fotoFile = formData.get("fotoKm") as File | null;

  if (!kmSaida || !partida || !destino || !fotoFile || !veiculoId) {
    return NextResponse.json(
      { error: "Campos obrigatórios não preenchidos" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await fotoFile.arrayBuffer());
  const fotoUrl = await uploadToS3Buffer(buffer, fotoFile.name);

  await prisma.rotaRecord.create({
    data: {
      kmSaida,
      photoUrl: fotoUrl,
      partida,
      destino,
      alterouRota,
      alteracaoRota: alterouRota ? alteracaoRota : null,
      realizouAbastecimento,
      user: { connect: { email: token.email! } },
      vehicle: { connect: { id: veiculoId } },
    },
  });

  return NextResponse.json({ success: true });
}
