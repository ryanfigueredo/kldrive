import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token)
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
  }

  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  // Nome único para o arquivo no bucket, pode mudar conforme sua estrutura
  const fileName = `profile-photos/${token.sub}-${Date.now()}-${file.name}`;

  // Transformar ArrayBuffer em Uint8Array para compatibilidade
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
    Body: uint8Array,
    ContentType: file.type,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // Atualiza avatarUrl no banco
    await prisma.user.update({
      where: { email: token.email! },
      data: { avatarUrl: imageUrl },
    });

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Erro upload:", error);
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 });
  }
}
