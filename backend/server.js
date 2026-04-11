require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const Groq = require("groq-sdk");
const pdfParse = require("pdf-parse");

const app = express();
const upload = multer({ dest: "uploads/" });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

ffmpeg.setFfmpegPath(ffmpegPath);

app.use(cors());
app.use(express.json());

function convertToWav(inputPath) {
  return new Promise((resolve, reject) => {
    const outputPath = `${inputPath}.wav`;
    ffmpeg(inputPath)
      .audioChannels(1)
      .audioFrequency(16000)
      .audioCodec("pcm_s16le")
      .format("wav")
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .save(outputPath);
  });
}

// ─── Generate Question ────────────────────────────────────────────────────────
app.get("/api/question", async (req, res) => {
  try {
    const topic = req.query.topic || "computer science and data structures";
    const chat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an interviewer. Generate ONE clear, concise interview question about the given topic. Return ONLY the question text, nothing else.",
        },
        {
          role: "user",
          content: `Generate a technical interview question about: ${topic}`,
        },
      ],
      max_tokens: 100,
    });

    const question = chat.choices[0].message.content.trim();
    res.json({ question });
  } catch (err) {
    console.error("Groq question error:", err.message);
    res.status(500).json({ error: "Failed to generate question" });
  }
});

// ─── Assess Speech ────────────────────────────────────────────────────────────
app.post("/api/assess", upload.single("audio"), async (req, res) => {
  const audioPath = req.file?.path;
  let wavPath = null;
  const question = req.body.question;

  if (!audioPath || !question) {
    return res.status(400).json({ error: "Audio file and question are required" });
  }

  try {
    // Step 1: Azure Pronunciation Assessment
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    speechConfig.speechRecognitionLanguage = "en-US";

    wavPath = await convertToWav(audioPath);
    const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(wavPath));

    // Use unscripted assessment for open-ended viva answers.
    // Passing the interview question as reference text can cause recognition failures
    // because the candidate's spoken answer will not match that text.
    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      "",
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Word,
      false
    );
    pronunciationConfig.enableProsodyAssessment = true;

    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    pronunciationConfig.applyTo(recognizer);

    const azureResult = await new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        (result) => {
          recognizer.close();
          if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            const assessment = sdk.PronunciationAssessmentResult.fromResult(result);
            resolve({
              transcript: result.text,
              pronunciationScore: Math.round(assessment.pronunciationScore ?? 0),
              fluencyScore: Math.round(assessment.fluencyScore ?? 0),
              completenessScore: Math.round(assessment.completenessScore ?? 0),
              accuracyScore: Math.round(assessment.accuracyScore ?? 0),
              prosodyScore: Math.round(assessment.prosodyScore ?? 0),
            });
          } else if (result.reason === sdk.ResultReason.NoMatch) {
            reject(new Error("No clear speech detected. Please speak closer to the mic and try again."));
          } else if (result.reason === sdk.ResultReason.Canceled) {
            const details = sdk.CancellationDetails.fromResult(result);
            reject(
              new Error(
                `Azure canceled recognition (${details.reason}). ${details.errorDetails || "Check AZURE_SPEECH_KEY and AZURE_SPEECH_REGION."}`
              )
            );
          } else {
            reject(new Error(`Azure recognition failed: ${result.reason}`));
          }
        },
        (err) => {
          recognizer.close();
          reject(err);
        }
      );
    });

    // Step 2: Calculate WPM
    const wordCount = azureResult.transcript.split(" ").filter(Boolean).length;
    const audioDurationSec = req.body.duration ? parseFloat(req.body.duration) : 10;
    const wpm = Math.round((wordCount / audioDurationSec) * 60);

    // Step 3: Groq Answer Quality Review
    const groqChat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a technical interview evaluator. Evaluate the candidate's answer and return a JSON object with exactly these fields:
{
  "answerScore": <number 1-10>,
  "confidence": <"Low" | "Medium" | "High">,
  "feedback": "<2-3 sentences of constructive feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}
Return ONLY valid JSON, no markdown, no extra text.`,
        },
        {
          role: "user",
          content: `Question: ${question}\n\nCandidate's Answer: ${azureResult.transcript}`,
        },
      ],
      max_tokens: 400,
    });

    let groqResult;
    try {
      groqResult = JSON.parse(groqChat.choices[0].message.content.trim());
    } catch {
      groqResult = {
        answerScore: 5,
        confidence: "Medium",
        feedback: groqChat.choices[0].message.content.trim(),
        strengths: [],
        improvements: [],
      };
    }

    // Clean up temp file
    if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    if (wavPath && fs.existsSync(wavPath)) fs.unlinkSync(wavPath);

    res.json({
      question,
      transcript: azureResult.transcript,
      pronunciation: azureResult.pronunciationScore,
      fluency: azureResult.fluencyScore,
      completeness: azureResult.completenessScore,
      accuracy: azureResult.accuracyScore,
      prosody: azureResult.prosodyScore,
      wpm,
      ...groqResult,
    });
  } catch (err) {
    console.error("Assessment error:", err);
    if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    if (wavPath && fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
    res.status(500).json({ error: err.message || "Assessment failed" });
  }
});

// ─── Parse Syllabus PDF ──────────────────────────────────────────────────
app.post("/api/syllabus/upload", upload.single("syllabus"), async (req, res) => {
  const filePath = req.file?.path;

  if (!filePath) {
    return res.status(400).json({ error: "Syllabus pdf file is required" });
  }

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    const chat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You extracts course structured syllabus from text. Return exactly this JSON format:
{
  "units": [
    { "unit_number": 1, "title": "<Unit Title>", "topics": [ {"title": "<Topic 1>"}, {"title": "<Topic 2>"} ] }
  ]
}
Return ONLY valid JSON. Do not include markdown \`\`\`json wrappers.`,
        },
        {
          role: "user",
          content: `Here is the syllabus text:\n${pdfData.text.substring(0, 15000)}`,
        },
      ],
      max_tokens: 1500,
    });

    let resultJson = chat.choices[0].message.content.trim();
    if (resultJson.startsWith('```json')) {
        resultJson = resultJson.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    const unitsData = JSON.parse(resultJson);

    fs.unlinkSync(filePath);
    res.json(unitsData);
  } catch (err) {
    console.error("PDF Parsing or Groq error:", err.message);
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: "Failed to parse syllabus. Make sure you provided a valid PDF." });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Veda Demo Backend running on http://localhost:${PORT}`);
  console.log(`   Azure Region: ${process.env.AZURE_SPEECH_REGION}`);
  console.log(`   Groq API: ${process.env.GROQ_API_KEY ? "Configured ✓" : "Missing ✗"}`);
});
