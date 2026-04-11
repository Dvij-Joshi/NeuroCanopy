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
    const diff = req.query.difficulty || "";
    const diffText = diff ? `${diff} difficulty ` : "";

    const chat = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an interviewer. Generate ONE clear, concise interview question about the given topic. Return ONLY the question text, nothing else.`,
        },
        { role: "user", content: `Generate a ${diffText}technical interview question about: ${topic}` },
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
      let recognizedText = "";
      let totalPron = 0, totalFluency = 0, totalComp = 0, totalAcc = 0, totalPros = 0, count = 0;

      recognizer.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech && e.result.text) {
          recognizedText += e.result.text + " ";
          const assessment = sdk.PronunciationAssessmentResult.fromResult(e.result);
          if (assessment) {
            totalPron += assessment.pronunciationScore ?? 0;
            totalFluency += assessment.fluencyScore ?? 0;
            totalComp += assessment.completenessScore ?? 0;
            totalAcc += assessment.accuracyScore ?? 0;
            totalPros += assessment.prosodyScore ?? 0;
            count++;
          }
        }
      };

      recognizer.sessionStopped = (s, e) => {
        recognizer.stopContinuousRecognitionAsync(
          () => {
            recognizer.close();
            if (count === 0) {
              if (recognizedText.trim()) {
                resolve({
                  transcript: recognizedText.trim(),
                  pronunciationScore: 0,
                  fluencyScore: 0,
                  completenessScore: 0,
                  accuracyScore: 0,
                  prosodyScore: 0,
                });
              } else {
                reject(new Error("No speech detected. Please speak closer to the mic and try again."));
              }
              return;
            }
            resolve({
              transcript: recognizedText.trim(),
              pronunciationScore: Math.round(totalPron / count),
              fluencyScore: Math.round(totalFluency / count),
              completenessScore: Math.round(totalComp / count),
              accuracyScore: Math.round(totalAcc / count),
              prosodyScore: Math.round(totalPros / count),
            });
          },
          (err) => reject(err)
        );
      };

      recognizer.canceled = (s, e) => {
        if (e.reason === sdk.CancellationReason.Error) {
          console.error("Azure Cancellation Error:", e.errorDetails);
          reject(new Error(`Azure canceled: ${e.errorDetails || "Error inside Azure."}`));
        }
      };

      recognizer.startContinuousRecognitionAsync(
        () => {},
        (err) => { recognizer.close(); reject(err); }
      );
    });

    const wordCount = azureResult.transcript.split(" ").filter(Boolean).length;
    const audioDurationSec = req.body.duration ? parseFloat(req.body.duration) : 10;
    const wpm = Math.round((wordCount / audioDurationSec) * 60);

    const groqChat = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a technical interview evaluator conducting a verbal, voice-only viva. Do NOT ask for or expect code snippets, syntax implementation, or complex formulas. Evaluate the candidate's spoken conceptual understanding.
            
Return ONLY valid JSON format strictly matching this schema:
{
  "answerScore": 8,
  "confidence": "Medium",
  "feedback": "Two or three sentences evaluating their verbal answer. DO NOT ask for code.",
  "strengths": ["<string point 1>"],
  "improvements": ["<string point 1>"]
}`,
          },
          { role: "user", content: `Question: ${question}\n\nAnswer: ${azureResult.transcript}` },
        ],
        max_tokens: 400,
      });

      let groqResult;
      try {
        let rawContent = groqChat.choices[0].message.content.trim();
        // Fallback exact regex match incase LLM puts pre-text despite json_object mode
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) rawContent = jsonMatch[0];
        
        groqResult = JSON.parse(rawContent);
      } catch (err) {
        console.error("Failed to parse Groq JSON:", err);
        groqResult = { answerScore: 5, confidence: "Medium", feedback: "Unable to parse feedback format natively.", strengths: [], improvements: [] };
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
      model: "llama-3.1-8b-instant",
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
