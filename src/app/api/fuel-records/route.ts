import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { uploadToS3Buffer } from "@/lib/s3";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Criação de registro de abastecimento
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const litrosStr = formData.get("litros")?.toString();
    const valorStr = formData.get("valor")?.toString();
    const kmAtualStr = formData.get("kmAtual")?.toString();
    const situacaoTanqueFromForm = formData.get("situacaoTanque")?.toString();
    const observacao = formData.get("observacao")?.toString() ?? "";
    const veiculoId = formData.get("veiculoId")?.toString();
    const fotoFile = formData.get("foto");

    if (!(fotoFile instanceof Blob)) {
      return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
    }

    if (!litrosStr || !valorStr || !kmAtualStr || !veiculoId) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      );
    }

    // Normaliza números (suporta vírgula/pt-BR)
    const litros = parseFloat(litrosStr.replace(",", "."));
    const valor = parseFloat(valorStr.replace(",", "."));
    const kmAtual = parseFloat(kmAtualStr.replace(",", "."));

    if ([litros, valor, kmAtual].some((n) => Number.isNaN(n))) {
      return NextResponse.json(
        { error: "Valores numéricos inválidos" },
        { status: 400 }
      );
    }

    const allowedSituacoes = ["CHEIO", "MEIO_TANQUE", "QUASE_VAZIO"] as const;
    type SituacaoTanqueType = (typeof allowedSituacoes)[number];

    const isSituacaoTanque = (value: string): value is SituacaoTanqueType =>
      (allowedSituacoes as readonly string[]).includes(value);

    let situacaoTanque: SituacaoTanqueType = "CHEIO";
    if (situacaoTanqueFromForm && isSituacaoTanque(situacaoTanqueFromForm)) {
      situacaoTanque = situacaoTanqueFromForm;
    }

    if (!allowedSituacoes.includes(situacaoTanque)) {
      return NextResponse.json(
        { error: "Situação do tanque inválida" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await (fotoFile as Blob).arrayBuffer());
    const fotoUrl = await uploadToS3Buffer(
      buffer,
      (fotoFile as { name?: string }).name ?? "abastecimento.jpg"
    );

    const registro = await prisma.fuelRecord.create({
      data: {
        litros,
        valor,
        kmAtual,
        situacaoTanque,
        photoUrl: fotoUrl,
        observacao,
        user: { connect: { email: token.email! } },
        vehicle: { connect: { id: veiculoId } },
      },
    });

    return NextResponse.json(registro, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar abastecimento:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
