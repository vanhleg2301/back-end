import express from "express";
import dotenv from "dotenv";
import PayOS from "@payos/node";

dotenv.config();

const routerPayOsPay = express.Router();

const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

routerPayOsPay.post("/payos", async function (req, res) {
  console.log("payment handler", req.body);
  const webhookData = payOS.verifyPaymentWebhookData(req.body, {
    headers: {
      "x-client-id": process.env.PAYOS_CLIENT_ID,
      "x-api-key": process.env.PAYOS_API_KEY,
    },
  });
  console.log(webhookData);

  if (webhookData) {
    return res.json({
      error: 0,
      message: "Ok",
      data: webhookData,
    });
  }

  return res.json({
    error: 0,
    message: "Ok",
    data: webhookData,
  });
});

export default routerPayOsPay;
