import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const bucketName = process.env.AWS_BUCKET_NAME!;

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const kmString = formData.get("km");
    const observacao = formData.get("observacao")?.toString() || "";
    const veiculoId = formData.get("veiculoId")?.toString();

    const fotoFile = formData.get("foto");
    if (!(fotoFile instanceof Blob)) {
      return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
    }

    if (!kmString || !veiculoId) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes" },
        { status: 400 }
      );
    }

    const km = parseFloat(kmString.toString());
    if (isNaN(km)) {
      return NextResponse.json(
        { error: "Quilometragem inválida" },
        { status: 400 }
      );
    }

    const arrayBuffer = await fotoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = fotoFile.name?.split(".").pop() || "jpg";
    const key = `uploads/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: fotoFile.type,
    });

    await s3Client.send(command);

    const fotoUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    const registro = await prisma.kmRecord.create({
      data: {
        km,
        observacao,
        photoUrl: fotoUrl,
        user: { connect: { email: token.email! } },
        vehicle: { connect: { id: veiculoId } },
      },
    });

    return NextResponse.json(registro, { status: 201 });
  } catch (err) {
    console.error("Erro ao processar upload:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
