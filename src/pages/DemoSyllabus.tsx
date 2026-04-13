import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { UploadCloud, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Groq } from 'groq-sdk';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

// Initialize Groq client
// Note: In production, API keys should be in environment variables OR called via a backend.
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

const groq = new Groq({
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Allow frontend execution for demo purposes
});

export default function DemoSyllabus() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultJson, setResultJson] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResultJson(null);
    }
  };

  const processPDF = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResultJson(null);

    try {
      // 1. Extract text from PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      const maxPages = Math.min(pdf.numPages, 10); // Limit to first 10 pages for demo speed

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      if (!fullText.trim()) {
        throw new Error("Could not extract any text from the PDF.");
      }

      // 2. Call Groq
      const prompt = `
        Analyze this syllabus syllabus and extract the full hierarchical knowledge tree.
        Think of it like a tree: the subject has branches (units/modules), sub-branches (topics), and leaves (sub-topics).
  
        Assign 'estimated_hours' to each node based on complexity:
        - High complexity/Deep topics: 3-5 hours
        - Medium complexity: 1-2 hours
        - Intro/Basics: 0.5-1 hour
  
        Return strictly valid JSON mimicking database table structure:
        {
          "subject": "Name of the subject",
          "topics": [
            {
              "title": "Unit 1: Introduction",
              "estimated_hours": 5,
              "children": [
                {
                  "title": "Basic Concepts",
                  "estimated_hours": 1,
                  "children": []
                }
              ]
            }
          ]
        }
  
        Rules:
        - Extract a DEEP tree
        - "children" array is required for every node (can be empty)
        - Max depth: 3-4 levels
  
        Syllabus Text:
        ${fullText.substring(0, 20000)}
      `;

      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are a specialized curriculum parser. Output only valid JSON." },
          { role: "user", content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });

      const jsonStr = completion.choices[0].message.content || "{}";
      const resultObj = JSON.parse(jsonStr);

      setResultJson(JSON.stringify(resultObj, null, 2));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to process syllabus.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d16] text-white p-6 pb-20 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 mt-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Syllabus Topic Extractor</h1>
          <p className="text-slate-400">PDF to JSON pipeline utilizing React PDF Parser and Groq LLaMA 3.3</p>
        </div>

        <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-xl backdrop-blur-sm relative">
          {!file ? (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-700/50 rounded-xl cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/50 transition-colors">
              <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
              <span className="text-slate-300 font-medium">Click or drag a PDF syllabus here</span>
              <span className="text-slate-500 text-sm mt-1">PDF max 10 pages for demo</span>
              <input 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="w-8 h-8 text-indigo-400 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="text-xs text-slate-400 hover:text-white uppercase tracking-wider px-3 py-1 bg-slate-900 rounded border border-slate-700"
                  disabled={isProcessing}
                >
                  Change
                </button>
              </div>

              <button
                onClick={processPDF}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Parsing PDF & Calling Groq...
                  </>
                ) : (
                  'Extract Topics'
                )}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/30 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-300 text-sm leading-relaxed">{error}</p>
          </div>
        )}

        {resultJson && (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-sm font-medium text-slate-300 uppercase tracking-widest">Groq JSON Output</h3>
              <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded">Simulation Only (Unsaved)</span>
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="text-xs text-emerald-400 font-mono">
                {resultJson}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}