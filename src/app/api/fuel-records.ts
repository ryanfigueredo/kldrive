import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import formidable from "formidable";
import { uploadToS3 } from "@/lib/s3";
import { NextApiRequest, NextApiResponse } from "next";

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

      const litros = parseFloat(fields.litros?.[0] ?? "0");
      const valor = parseFloat(fields.valor?.[0] ?? "0");
      const situacao = (fields.situacao?.[0] ?? "") as
        | "CHEIO"
        | "MEIO_TANQUE"
        | "QUASE_VAZIO";
      const kmAtual = parseFloat(fields.kmAtual?.[0] ?? "0");
      const observacao = fields.observacao?.[0] ?? "";
      const file = files.foto?.[0];

      if (!litros || !valor || !situacao || !kmAtual || !file) {
        return res
          .status(400)
          .json({ error: "Campos obrigatórios não preenchidos" });
      }

      try {
        const fotoUrl = await uploadToS3(file);

        await prisma.fuelRecord.create({
          data: {
            litros,
            valor,
            situacaoTanque: situacao,
            kmAtual,
            photoUrl: fotoUrl,
            observacao,
            user: { connect: { email: token.email! } },
            vehicle: { connect: { id: "ID_DO_VEICULO_TEMPORARIO" } },
          },
        });

        return res.status(200).json({ success: true });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao salvar dados" });
      }
    });
  } else {
    return res.status(405).json({ error: "Método não permitido" });
  }
}
