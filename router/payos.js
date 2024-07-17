import express from "express";
import dotenv from "dotenv";
import PayOS from "@payos/node";
import crypto from "crypto";

dotenv.config();

const routerPayOs = express.Router();

const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

const RECRUITER_JOB_LIMITS = {
  package_1: {recruiterLevel: 1, jobPostingLimit: 5},
  package_2: {recruiterLevel: 2, jobPostingLimit: 10},
  package_3: {recruiterLevel: 3, jobPostingLimit: 15},
};

const updateLevel = async (recruiterId, pack) => {
  // Check payment package from https://api-merchant.payos.vn/v2/payment-requests/:id
  // If payment status is successful, update recruiter level
}

routerPayOs.post("/create", async (req, res) => {
  const { buyerName, description, returnUrl, cancelUrl, amount, price } =
    req.body;

  // Validate input
  if (!description || !returnUrl || !cancelUrl || !amount || !price) {
    return res.json({
      error: -2,
      message: "Missing required parameters",
      data: null,
    });
  }

  const body = {
    orderCode: Number(String(new Date().getTime()).slice(-6)),
    buyerName,
    amount: price * amount,
    description,
    cancelUrl,
    returnUrl,
  };

  try {
    const signature = createSignature(body);

    console.log("Generated Signature:", signature);

    const paymentLinkRes = await payOS.createPaymentLink(body);

    console.log("paymentLinkRes:", paymentLinkRes);

    if (!paymentLinkRes || !signature) {
      console.log("Error: Signature not found in the response");
    }

    return res.status(200).json({
      error: 0,
      message: "Success",
      data: paymentLinkRes,
      signature: signature,
    });
  } catch (error) {
    console.error("Payment Link Error:", error);
    return res.json({
      error: -1,
      message: "Failed to create payment link",
      data: null,
    });
  }
});

function createSignature(data) {
  const sortedData = sortObjDataByKey(data);
  const dataQueryStr = convertObjToQueryStr(sortedData);
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

  return crypto
    .createHmac("sha256", checksumKey)
    .update(dataQueryStr)
    .digest("hex");
}

function sortObjDataByKey(object) {
  const orderedObject = Object.keys(object)
    .sort()
    .reduce((obj, key) => {
      obj[key] = object[key];
      return obj;
    }, {});
  return orderedObject;
}

function convertObjToQueryStr(object) {
  return Object.keys(object)
    .filter((key) => object[key] !== undefined)
    .map((key) => {
      let value = object[key];
      if (value && Array.isArray(value)) {
        value = JSON.stringify(value.map((val) => sortObjDataByKey(val)));
      }
      if ([null, undefined, "undefined", "null"].includes(value)) {
        value = "";
      }
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join("&");
}

routerPayOs.post("/confirm-webhook", async (req, res) => {
  const { webhookUrl } = req.body;
  try {
    console.log(webhookUrl);
    await payOS.confirmWebhook(webhookUrl, {
      headers: {
        "x-client-id": process.env.PAYOS_CLIENT_ID,
        "x-api-key": process.env.PAYOS_API_KEY,
      },
    });

    return res.json({
      error: 0,
      message: "ok",
      data: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: -1,
      message: "failed",
      data: null,
    });
  }
});

routerPayOs.get("/:orderId", async function (req, res) {
  try {
    const order = await payOS.getPaymentLinkInformation(req.params.orderId);
    if (!order) {
      return res.json({
        error: -1,
        message: "Mã thanh toán không tồn tại",
        data: null,
      });
    }
    return res.json({
      error: 0,
      message: "ok",
      data: order,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      error: -1,
      message: "failed",
      data: null,
    });
  }
});

routerPayOs.put("/:orderId", async function (req, res) {
  try {
    const { orderId } = req.params;
    const body = req.body;

    const order = await payOS.cancelPaymentLink(
      orderId,
      body.cancellationReason
    );
    if (!order) {
      return res.json({
        error: -1,
        message: "failed",
        data: null,
      });
    }
    return res.json({
      error: 0,
      message: "ok",
      data: order,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      error: -1,
      message: "failed",
      data: null,
    });
  }
});

const getAllTransactions = async () => {
  const url = "https://api-merchant.payos.vn/v2/transactions"; // Replace with the correct endpoint
  const headers = {
    "x-client-id": process.env.PAYOS_CLIENT_ID,
    "x-api-key": process.env.PAYOS_API_KEY,
  };

  try {
    const response = await fetch(url, { headers: headers });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

routerPayOs.get("/t/transactions", async (req, res) => {
  try {
    const transactions = await getAllTransactions(); // Assuming this method exists in payOS library
    if (!transactions) {
      return res.json({
        error: -1,
        message: "No transactions found",
        data: null,
      });
    }
    return res.json({
      error: 0,
      message: "Success",
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      error: -1,
      message: "Failed to fetch transactions",
      data: null,
    });
  }
});

export default routerPayOs;
