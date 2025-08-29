import 'dotenv/config';
import express from 'express';
// import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// const upload = multer();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = "gemini-2.5-flash";
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const port = 3002;

app.listen(port, () => console.log(`Server is running and ready on http://localhost:${port}`));

function extractText(resp) {
  try {
      const text =
      resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
      resp?.candidates?.[0]?.content?.parts?.[0]?.text ??
      resp?.response?.candidates?.[0]?.content?.text;

      return text ?? JSON.stringify(resp, null, 2);
  } catch (err) {
      console.error("Error extracting text:", err);
      return JSON.stringify(resp, null, 2);
  }
}

//generate chat
app.post('/api/chat', async (req, res) => {

  try {
    const { message } = req.body;
    if (!Array.isArray(message)) throw new Error("message must be an array");
    const contents = message.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    
    }));
    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents
    });
    res.json({ result: extractText(resp) });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});
