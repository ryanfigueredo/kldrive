import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { File } from "formidable";
import fs from "fs";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: File) {
  if (!file.filepath) throw new Error("Caminho do arquivo inválido");

  const fileStream = fs.createReadStream(file.filepath);

  const filename = `odometros/${randomUUID()}-${file.originalFilename?.replace(
    /\s/g,
    "-"
  )}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: filename,
    Body: fileStream,
    ContentType: file.mimetype || "image/jpeg",
  });

  await s3.send(command);

  return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${filename}`;
}
