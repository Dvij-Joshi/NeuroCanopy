require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
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

// ─── Util: convert audio to WAV ───────────────────────────────────────────────
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
          content: "You are an interviewer. Generate ONE clear, concise interview question about the given topic. Return ONLY the question text, nothing else.",
        },
        { role: "user", content: `Generate a technical interview question about: ${topic}` },
      ],
      max_tokens: 100,
    });
    res.json({ question: chat.choices[0].message.content.trim() });
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

  if (!audioPath || !question)
    return res.status(400).json({ error: "Audio file and question are required" });

  try {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    speechConfig.speechRecognitionLanguage = "en-US";

    wavPath = await convertToWav(audioPath);
    const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(wavPath));

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
            reject(new Error(`Azure canceled: ${details.errorDetails || "Check AZURE_SPEECH_KEY and AZURE_SPEECH_REGION."}`));
          } else {
            reject(new Error(`Azure recognition failed: ${result.reason}`));
          }
        },
        (err) => { recognizer.close(); reject(err); }
      );
    });

    const wordCount = azureResult.transcript.split(" ").filter(Boolean).length;
    const audioDurationSec = req.body.duration ? parseFloat(req.body.duration) : 10;
    const wpm = Math.round((wordCount / audioDurationSec) * 60);

    const groqChat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a technical interview evaluator. Return ONLY valid JSON with these exact fields:
{
  "answerScore": <1-10>,
  "confidence": <"Low"|"Medium"|"High">,
  "feedback": "<2-3 sentences>",
  "strengths": ["<s1>", "<s2>"],
  "improvements": ["<i1>", "<i2>"]
}`,
        },
        { role: "user", content: `Question: ${question}\n\nAnswer: ${azureResult.transcript}` },
      ],
      max_tokens: 400,
    });

    let groqResult;
    try {
      groqResult = JSON.parse(groqChat.choices[0].message.content.trim());
    } catch {
      groqResult = { answerScore: 5, confidence: "Medium", feedback: groqChat.choices[0].message.content.trim(), strengths: [], improvements: [] };
    }

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

// ─── Parse Syllabus PDF ───────────────────────────────────────────────────────
app.post("/api/syllabus/upload", upload.single("syllabus"), async (req, res) => {
  const filePath = req.file?.path;
  if (!filePath) return res.status(400).json({ error: "Syllabus PDF required" });

  try {
    const pdfData = await pdfParse(fs.readFileSync(filePath));

    const chat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Extract the syllabus structure. Return ONLY valid JSON, no markdown:
{
  "units": [
    { "unit_number": 1, "title": "<Unit Title>", "topics": [ {"title": "<Topic>"} ] }
  ]
}`,
        },
        { role: "user", content: `Syllabus text:\n${pdfData.text.substring(0, 15000)}` },
      ],
      max_tokens: 1500,
    });

    let resultJson = chat.choices[0].message.content.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

    fs.unlinkSync(filePath);
    res.json(JSON.parse(resultJson));
  } catch (err) {
    console.error("Syllabus parse error:", err.message);
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: "Failed to parse syllabus PDF." });
  }
});

// ─── Schedule Generation ──────────────────────────────────────────────────────
// NOTE: Timing is now 100% handled by scheduleGenerator.ts on the frontend.
// This endpoint is a thin passthrough — it just validates what was already computed.
// Groq is NOT called here for timing anymore.
app.post("/api/schedule/generate", async (req, res) => {
  try {
    const { events } = req.body;

    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: "Expected { events: [...] } in request body" });
    }

    // Validate each event has required fields
    const valid = events.filter(e =>
      e.title &&
      e.category &&
      e.start_time &&
      e.end_time &&
      e.user_id
    );

    console.log(`[Schedule API] Received ${events.length} events, ${valid.length} passed validation`);

    if (valid.length === 0) {
      return res.status(400).json({ error: "No valid events to save" });
    }

    res.json({ success: true, accepted: valid.length });
  } catch (err) {
    console.error("Schedule endpoint error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ NeuroCanopy Backend running on http://localhost:${PORT}`);
  console.log(`   Azure Region : ${process.env.AZURE_SPEECH_REGION}`);
  console.log(`   Groq API     : ${process.env.GROQ_API_KEY ? "Configured ✓" : "Missing ✗"}`);
});