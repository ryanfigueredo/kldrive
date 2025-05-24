import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { uploadToS3 } from "@/lib/s3";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  if (!token) return res.status(401).json({ error: "Não autenticado" });

  if (req.method === "POST") {
    const form = new formidable.IncomingForm({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err)
        return res.status(500).json({ error: "Erro ao processar formulário" });

      const km = parseFloat(fields.km?.[0] ?? "0");
      const observacao = fields.observacao?.[0] ?? "";
      const vehicleId = fields.veiculoId?.[0] ?? "";
      const file = files.foto?.[0];

      if (!km || !file || !vehicleId)
        return res.status(400).json({ error: "Campos obrigatórios" });

      const fotoUrl = await uploadToS3(file);

      await prisma.kmRecord.create({
        data: {
          km,
          photoUrl: fotoUrl,
          observacao,
          user: { connect: { email: token.email! } },
          vehicle: { connect: { id: vehicleId } }, // CORRETO AQUI ✅
        },
      });

      return res.status(200).json({ success: true });
    });
  } else {
    return res.status(405).json({ error: "Método não permitido" });
  }
}
