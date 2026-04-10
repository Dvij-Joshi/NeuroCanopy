import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { Groq } from 'groq-sdk';
import * as dotenv from 'dotenv';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Set up Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "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", // Fallback to demo key if env missing
});

// Configure multer for in-memory uploads
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/syllabus/upload', upload.single('syllabus'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // 1. Extract text using pdf-parse
    const pdfData = await pdfParse(req.file.buffer);
    const fullText = pdfData.text;

    if (!fullText || fullText.trim() === '') {
      return res.status(400).json({ error: 'Failed to extract text from PDF.' });
    }

    // 2. Call Groq API
    const systemPrompt = `You are a syllabus parser. Extract the syllabus structure and return ONLY a valid JSON object in this exact format, no markdown, no extra text:
{
  "subject_name": "string",
  "units": [
    {
      "unit_number": 1,
      "title": "string",
      "topics": [
        {
          "title": "string"
        }
      ]
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Syllabus Text: \n${fullText.substring(0, 25000)}` }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const jsonStr = completion.choices[0].message.content;
    const syllabusObj = JSON.parse(jsonStr || "{}");

    return res.json(syllabusObj);

  } catch (error) {
    console.error('Syllabus parsing error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during PDF parsing.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Syllabus extraction API running on port ${PORT}`));