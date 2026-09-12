import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json());

app.post("/api/extract", upload.single("statement"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { mimetype, buffer } = req.file;
    const base64Data = buffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          inlineData: {
            mimeType: mimetype,
            data: base64Data,
          },
        },
        "Extract transactions from this bank statement. Return ONLY a JSON object with a `transactions` array. Each transaction should have `date` (DD/MM/YYYY string format), `description` (string), `amount` (number, negative for debit/withdrawal, positive for credit/deposit), `category` (from the provided list), `notes` (brief context), and `confidence` (number 0.0 to 1.0). List of categories: Salary, Food, Shopping, Bills & Utilities, Rent, Travel, Transport, Healthcare, Education, Entertainment, ATM/Cash Withdrawal, Bank Charges, Transfer, Investment, Loan/EMI, Insurance, Refund, UPI, Other. If you are unsure about a row, set confidence low (e.g. 0.5). Do NOT invent transactions.",
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transactions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  description: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  category: { type: Type.STRING },
                  notes: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                },
                required: ["date", "description", "amount", "category", "notes", "confidence"],
              },
            },
          },
          required: ["transactions"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Failed to extract text from response");
    }

    const extractedData = JSON.parse(text);
    res.json(extractedData);
  } catch (error: any) {
    console.error("Extraction error:", error);
    res.status(500).json({ error: error.message || "Something went wrong while processing your statement. Please try again." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
