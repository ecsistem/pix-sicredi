// Carregar variáveis de ambiente do arquivo .env
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const qrcode = require("qrcode");
import { Request, Response } from "express";
import { PixSicredi } from "./service/PixSicredi";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para processar JSON no body
app.use(express.json());

// Configuração do PIX Sicredi
const initPix = {
  producao: process.env.NODE_ENV === "production" ? 1 : 0,
  client_id: process.env.CLIENT_ID || "",
  client_secret: process.env.CLIENT_SECRET || "",
  crt_file: process.env.CRT_FILE || "./config/01907521000190.cer",
  key_file: process.env.KEY_FILE || "./config/key.key",
  pass: process.env.PASS || "",
};

// Validar se as variáveis de ambiente obrigatórias estão definidas
if (!initPix.client_id || !initPix.client_secret) {
  console.error(
    "Erro: CLIENT_ID e/ou CLIENT_SECRET não definidos no arquivo .env"
  );
  process.exit(1);
}

const pix = new PixSicredi(initPix);

// Definindo o router para o prefixo /api
const apiRouter = express.Router();

// Rota para health check
apiRouter.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
    service: "PIX Sicredi API",
    environment: process.env.NODE_ENV || "development",
  });
});

// Rota para gerar o PIX
apiRouter.post("/pix/gerar", function (req: Request, res: Response) {
  (async () => {
    try {
      // Validar se o valor foi enviado no body
      const { valor } = req.body;

      if (!valor || isNaN(parseFloat(valor))) {
        return res
          .status(400)
          .json({ error: "Valor inválido. Envie um valor numérico no body." });
      }

      // Obter token de acesso
      const accessToken = await pix.accessToken();

      // Criar a cobrança PIX
      const resultadoCobranca = await pix.criarCobranca({
        chave: "01907521000190",
        valor: {
          original: parseFloat(valor),
          modalidadeAlteracao: 1,
        },
        calendario: {
          expiracao: 3600, // 1 hora
          validadeAposVencimento: 0,
        },
        solicitacaoPagador: "Cliente Biasi Supermercado",
        infoAdicionais: [
          {
            nome: "Estabelecimento Biasi Supermercado",
            valor: "CNPJ 01907521000190",
          },
        ],
      });
      // Garantir que o resultado seja um objeto
      const cobrancaData =
        typeof resultadoCobranca === "string"
          ? JSON.parse(resultadoCobranca)
          : resultadoCobranca;

      // Criar variável qrcode antes do if
      let qrCodeDataURL = null;

      if (cobrancaData.pixCopiaECola) {
        qrCodeDataURL = await qrcode.toDataURL(cobrancaData.pixCopiaECola);
        console.log("QR Code gerado:", qrCodeDataURL);
      } else {
        console.error("Erro: pixCopiaECola não encontrado na resposta.");
      }

      // Retornar o resultado da cobrança
      res.status(200).json({
        message: "PIX gerado com sucesso",
        dados: cobrancaData,
        qrcode: qrCodeDataURL, // Retorna null se não houver qrCode
      });
    } catch (error) {
      console.error("Erro ao gerar PIX:", error);
      res.status(500).json({ error: "Erro ao gerar o PIX" });
    }
  })();
});

// Rota para verificar o status de uma cobrança PIX
apiRouter.get("/pix/status/:id", (req: Request, res: Response) => {
  (async () => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "ID da cobrança não fornecido" });
      }

      // Obter token de acesso caso não exista
      await pix.accessToken();

      // Consultar dados da cobrança
      const dadosCobranca = await pix.dadosDeCobranca(id);

      res.status(200).json({
        message: "Consulta realizada com sucesso",
        dados: dadosCobranca,
      });
    } catch (error) {
      console.error("Erro ao consultar PIX:", error);
      res.status(500).json({ error: "Erro ao consultar o status do PIX" });
    }
  })();
});

// Registrando o router com o prefixo /api
app.use("/api", apiRouter);

// Manter a rota original para compatibilidade
app.post("/gerar/pix", function (req: Request, res: Response) {
  res.redirect(307, "/api/pix/gerar");
});

// Adicionar redirecionamento para consulta de status
app.get("/pix/status/:id", function (req: Request, res: Response) {
  res.redirect(307, `/api/pix/status/${req.params.id}`);
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(
    `Health check disponível em: http://localhost:${PORT}/api/health`
  );
  console.log(`API PIX disponível em: http://localhost:${PORT}/api/pix/gerar`);
});
