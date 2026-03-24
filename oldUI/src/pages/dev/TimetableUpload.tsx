import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
    Upload, FileText, Loader2, CheckCircle2, ArrowLeft,
    CalendarDays, Plus, Trash2, PenLine, File
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const GROQ_API_KEY = "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";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TYPES = ["College", "Study", "Break", "Other"] as const;

/* ─── Shared data shape ─── */
interface TimetableRow {
    day: string;
    start_time: string;
    end_time: string;
    subject_name: string;   // human name → resolved to subject_id on save
    subject_category: string;
    type: string;
}

/* ─── Shared save logic ──────────────────────────────────────── */
async function saveTimetable(rows: TimetableRow[], addLog: (s: string) => void) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");

    addLog(`Saving ${rows.length} rows for user ${user.id}...`);

    // 1️⃣ Upsert all unique subjects → subjects table
    const uniqueSubjects = [
        ...new Map(
            rows
                .filter(r => r.subject_name.trim())
                .map(r => [r.subject_name.trim().toLowerCase(), { name: r.subject_name.trim(), category: r.subject_category || "College" }])
        ).values()
    ];

    const subjectIdMap: Record<string, string> = {};
    for (const subj of uniqueSubjects) {
        const { data, error } = await supabase
            .from("subjects")
            .upsert({ name: subj.name, category: subj.category }, { onConflict: "name" })
            .select("id, name")
            .single();
        if (!error && data) {
            subjectIdMap[subj.name.toLowerCase()] = data.id;
        } else {
            addLog(`⚠️ Subject upsert failed: ${subj.name} — ${error?.message}`);
        }
    }
    addLog(`✅ Subjects upserted: ${Object.keys(subjectIdMap).length}`);

    // 2️⃣ Delete existing timetable (fresh import)
    const { error: delErr } = await supabase.from("timetables").delete().eq("user_id", user.id);
    if (delErr) addLog(`⚠️ Could not clear old timetable: ${delErr.message}`);
    else addLog("Cleared old timetable.");

    // 3️⃣ Insert new rows
    const insertRows = rows.map(r => ({
        user_id: user.id,
        day: r.day,
        start_time: r.start_time,
        end_time: r.end_time,
        subject_id: r.subject_name.trim()
            ? (subjectIdMap[r.subject_name.trim().toLowerCase()] ?? null)
            : null,
        type: r.type,
    }));

    const { error: insertErr } = await supabase.from("timetables").insert(insertRows);
    if (insertErr) throw new Error("Insert failed: " + insertErr.message);

    addLog(`✅ Saved ${insertRows.length} timetable rows!`);
    return insertRows.length;
}

/* ─── Component ─────────────────────────────────────────────── */
export default function TimetableUpload() {
    const [tab, setTab] = useState<"manual" | "pdf">("manual");
    const [rows, setRows] = useState<TimetableRow[]>([
        { day: "Monday", start_time: "09:00", end_time: "10:00", subject_name: "", subject_category: "College", type: "College" }
    ]);
    const [file, setFile] = useState<File | null>(null);
    const [parsing, setParsing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [log, setLog] = useState<string[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);

    const addLog = (msg: string) => setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    /* ── Manual helpers ── */
    const updateRow = (i: number, field: keyof TimetableRow, value: string) =>
        setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
    const addRow = () => setRows(prev => [...prev, { day: "Monday", start_time: "09:00", end_time: "10:00", subject_name: "", subject_category: "College", type: "College" }]);
    const removeRow = (i: number) => setRows(prev => prev.filter((_, idx) => idx !== i));

    /* ── PDF parse ── */
    const handleParse = async () => {
        if (!file) return;
        setParsing(true);
        setLog([]);
        setSaved(false);

        try {
            addLog("Extracting text...");
            let text = "";
            if (file.name.endsWith(".txt")) {
                text = await file.text();
            } else {
                const ab = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
                for (let i = 1; i <= Math.min(pdf.numPages, 8); i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map((item: any) => item.str).join(" ") + "\n";
                }
            }
            addLog(`Extracted ${text.length} chars. Calling Groq...`);

            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    response_format: { type: "json_object" },
                    messages: [
                        { role: "system", content: "Output only valid JSON." },
                        {
                            role: "user", content: `
Extract all timetable entries from this text. Return JSON:
{
  "entries": [
    {
      "day": "Monday",
      "start_time": "09:00",
      "end_time": "10:00",
      "subject_name": "Mathematics",
      "subject_category": "College",
      "type": "College"
    }
  ]
}
Rules:
- day: Monday/Tuesday/Wednesday/Thursday/Friday/Saturday/Sunday
- times: HH:MM 24-hour
- type: one of College, Study, Break, Other
- subject_category: College or Other
- If no timetable found: {"entries": []}

Text:
${text.substring(0, 12000)}`.trim()
                        }
                    ]
                })
            });

            const json = await res.json();
            const parsed = JSON.parse(json.choices?.[0]?.message?.content || '{"entries":[]}');
            const entries: TimetableRow[] = (parsed.entries || []).map((e: any) => ({
                day: e.day || "Monday",
                start_time: e.start_time || "09:00",
                end_time: e.end_time || "10:00",
                subject_name: e.subject_name || "",
                subject_category: e.subject_category || "College",
                type: e.type || "College",
            }));

            addLog(`Groq returned ${entries.length} entries.`);
            if (entries.length === 0) {
                toast.error("No entries found — try a cleaner PDF or use manual entry.");
            } else {
                setRows(entries);
                setTab("manual"); // switch to table editor after parse
                toast.success(`Parsed ${entries.length} entries! Review then save.`);
            }
        } catch (err: any) {
            addLog(`Error: ${err.message}`);
            toast.error("Parse failed: " + err.message);
        } finally {
            setParsing(false);
        }
    };

    /* ── Save ── */
    const handleSave = async () => {
        const validRows = rows.filter(r => r.day && r.start_time && r.end_time);
        if (validRows.length === 0) { toast.error("Add at least one entry"); return; }
        setSaving(true);
        setLog([]);
        setSaved(false);

        try {
            const count = await saveTimetable(validRows, addLog);
            setSaved(true);
            toast.success(`Saved ${count} timetable entries!`);
        } catch (err: any) {
            addLog(`❌ ${err.message}`);
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/20 p-2"><CalendarDays className="h-5 w-5 text-primary" /></div>
                        <div>
                            <h1 className="font-display text-2xl font-bold">Timetable Upload</h1>
                            <p className="text-sm text-muted-foreground">Dev · Both methods save with the same structure</p>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            {rows.length} row{rows.length !== 1 ? "s" : ""}
                        </span>
                        {saved && (
                            <span className="flex items-center gap-1 text-xs text-emerald-500">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                            </span>
                        )}
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-1 bg-muted/50 rounded-xl p-1 w-fit">
                    {[
                        { key: "manual", label: "Manual Entry", icon: PenLine },
                        { key: "pdf", label: "Upload PDF", icon: File },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">

                    {/* ── PDF Tab ── */}
                    {tab === "pdf" && (
                        <motion.div key="pdf" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files[0] || null); }}
                                onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed border-border/60 rounded-2xl p-12 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
                            >
                                <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                {file ? (
                                    <div>
                                        <p className="font-medium">{file.name}</p>
                                        <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="font-medium">Drop your timetable PDF here</p>
                                        <p className="text-sm text-muted-foreground mt-1">PDF or TXT · Groq will extract all time slots</p>
                                    </div>
                                )}
                            </div>
                            <Button onClick={handleParse} disabled={!file || parsing} className="gap-2">
                                {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                                {parsing ? "Parsing with Groq..." : "Parse PDF → Fill Table"}
                            </Button>
                            <p className="text-xs text-muted-foreground">After parsing, you can edit entries in the <strong>Manual Entry</strong> tab before saving.</p>
                        </motion.div>
                    )}

                    {/* ── Manual Tab ── */}
                    {tab === "manual" && (
                        <motion.div key="manual" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

                            {/* Table */}
                            <div className="rounded-2xl border border-border/50 overflow-x-auto">
                                <table className="w-full text-sm min-w-[700px]">
                                    <thead className="bg-muted/40">
                                        <tr>
                                            {["Day", "Start", "End", "Subject Name", "Category", "Type", ""].map(h => (
                                                <th key={h} className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, i) => (
                                            <tr key={i} className="border-t border-border/30 hover:bg-muted/20 transition-colors">
                                                <td className="px-2 py-1.5">
                                                    <select value={row.day} onChange={e => updateRow(i, "day", e.target.value)}
                                                        className="bg-background border border-border/50 rounded-lg px-2 py-1 text-xs w-28 focus:border-primary outline-none">
                                                        {DAYS.map(d => <option key={d}>{d}</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-2 py-1.5">
                                                    <Input type="time" value={row.start_time} onChange={e => updateRow(i, "start_time", e.target.value)} className="h-7 text-xs w-24" />
                                                </td>
                                                <td className="px-2 py-1.5">
                                                    <Input type="time" value={row.end_time} onChange={e => updateRow(i, "end_time", e.target.value)} className="h-7 text-xs w-24" />
                                                </td>
                                                <td className="px-2 py-1.5">
                                                    <Input value={row.subject_name} onChange={e => updateRow(i, "subject_name", e.target.value)}
                                                        placeholder="e.g. Mathematics" className="h-7 text-xs min-w-[140px]" />
                                                </td>
                                                <td className="px-2 py-1.5">
                                                    <select value={row.subject_category} onChange={e => updateRow(i, "subject_category", e.target.value)}
                                                        className="bg-background border border-border/50 rounded-lg px-2 py-1 text-xs focus:border-primary outline-none">
                                                        <option>College</option>
                                                        <option>Other</option>
                                                    </select>
                                                </td>
                                                <td className="px-2 py-1.5">
                                                    <select value={row.type} onChange={e => updateRow(i, "type", e.target.value)}
                                                        className="bg-background border border-border/50 rounded-lg px-2 py-1 text-xs focus:border-primary outline-none">
                                                        {TYPES.map(t => <option key={t}>{t}</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-2 py-1.5">
                                                    <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button size="sm" variant="outline" onClick={addRow} className="gap-1.5">
                                    <Plus className="h-3.5 w-3.5" /> Add Row
                                </Button>
                                <Button onClick={handleSave} disabled={saving} className="gap-2">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                    {saving ? "Saving..." : `Save ${rows.filter(r => r.start_time && r.end_time).length} Entries`}
                                </Button>
                                {saved && <Link to="/schedule"><Button variant="outline">View Schedule →</Button></Link>}
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Log */}
                {log.length > 0 && (
                    <div className="rounded-xl bg-muted/30 border border-border/40 p-4 space-y-0.5">
                        <p className="text-xs font-semibold text-muted-foreground mb-1.5">Log</p>
                        {log.map((l, i) => <p key={i} className="text-xs font-mono text-foreground/70">{l}</p>)}
                    </div>
                )}

            </div>
        </div>
    );
}
