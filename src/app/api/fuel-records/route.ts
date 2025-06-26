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

  const litros = parseFloat(formData.get("litros")?.toString() ?? "0");
  const valor = parseFloat(formData.get("valor")?.toString() ?? "0");
  const situacao = formData.get("situacao")?.toString() as
    | "CHEIO"
    | "MEIO_TANQUE"
    | "QUASE_VAZIO"
    | undefined;
  const kmAtual = parseFloat(formData.get("kmAtual")?.toString() ?? "0");
  const observacao = formData.get("observacao")?.toString() ?? "";
  const veiculoId = formData.get("veiculoId")?.toString();

  const fotoFile = formData.get("foto") as File | null;

  if (!litros || !valor || !situacao || !kmAtual || !fotoFile || !veiculoId) {
    return NextResponse.json(
      { error: "Campos obrigatórios não preenchidos" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await fotoFile.arrayBuffer());

  // Passa buffer e nome original para a função de upload
  const fotoUrl = await uploadToS3Buffer(buffer, fotoFile.name);

  await prisma.fuelRecord.create({
    data: {
      litros,
      valor,
      situacaoTanque: situacao,
      kmAtual,
      photoUrl: fotoUrl,
      observacao,
      user: { connect: { email: token.email! } },
      vehicle: { connect: { id: veiculoId } },
    },
  });

  return NextResponse.json({ success: true });
}
