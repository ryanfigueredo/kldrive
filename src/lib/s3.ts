import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Função que recebe Buffer e nome original do arquivo
export async function uploadToS3Buffer(buffer: Buffer, originalName: string) {
  const key = `odometros/${randomUUID()}-${originalName.replace(/\s/g, "-")}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: "image/jpeg", // ou detecte conforme precisar
    ACL: undefined, // Remova ACL pois seu bucket não permite ACLs
  });

  await s3.send(command);

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
