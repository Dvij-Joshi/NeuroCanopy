import { Groq } from "groq-sdk";
import * as pdfjsLib from "pdfjs-dist";
import { supabase } from "@/lib/supabase";

// Initialize Groq client
const GROQ_API_KEY = "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";

const groq = new Groq({
    apiKey: GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface ParserResult {
    success: boolean;
    courseId?: string;
    error?: string;
}

interface TreeNode {
    title: string;
    status: string;
    estimatedHours: number;
    children: TreeNode[];
}

// Helper to save nodes recursively
const saveNodesRecursively = async (
    nodes: TreeNode[],
    courseId: string,
    userId: string,
    parentId: string | null,
    depth: number
) => {
    for (const node of nodes) {
        if (!node.title || !node.title.trim()) continue;

        const { data, error } = await supabase
            .from("nodes")
            .insert({
                user_id: userId,
                course_id: courseId,
                parent_id: parentId,
                title: node.title.trim(),
                status: "New", // Default status
                retention: 0,
                estimated_hours: node.estimatedHours || 1,
                depth: depth,
            })
            .select("id")
            .single();

        if (error) {
            console.error(`Failed to save node: ${node.title}`, error);
            continue;
        }

        if (node.children && node.children.length > 0) {
            await saveNodesRecursively(node.children, courseId, userId, data.id, depth + 1);
        }
    }
};

const countNodes = (nodes: any[]): number =>
    nodes.reduce((acc, n) => acc + 1 + countNodes(n.children || []), 0);

export const parseAndSaveSyllabus = async (
    file: File,
    userId: string,
    subjectName: string
): Promise<ParserResult> => {
    try {
        console.log(`Starting syllabus parse for: ${subjectName}`);

        // 1. Upload File to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}_${subjectName.replace(/\s+/g, '_')}.${fileExt}`;

        // Best effort upload - don't fail parsing if upload fails (though it usually shouldn't)
        let fileUrl: string | null = null;
        const { error: uploadError } = await supabase.storage
            .from('syllabuses')
            .upload(fileName, file);

        if (!uploadError) {
            const { data } = supabase.storage.from('syllabuses').getPublicUrl(fileName);
            fileUrl = data.publicUrl;
        } else {
            console.warn("Syllabus upload failed, continuing with parsing...", uploadError);
        }

        // 2. Extract Text from PDF
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        const maxPages = Math.min(pdf.numPages, 8); // Increased page limit slightly

        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // Add a space to separate items to avoid merged words
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            fullText += pageText + "\n";
        }

        // 3. Extract Knowledge Tree using Groq
        const prompt = `
      Analyze this syllabus for "${subjectName}" and extract the full hierarchical knowledge tree.
      Think of it like a tree: the subject has branches (units/modules), sub-branches (topics), and leaves (sub-topics).
      
      Assign 'estimated_hours' to each node based on complexity:
      - High complexity/Deep topics: 3-5 hours
      - Medium complexity: 1-2 hours
      - Intro/Basics: 0.5-1 hour
      
      Return strictly valid JSON:
      {
        "tree": [
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
      - Extract a DEEP tree (don't flatten everything)
      - "children" array is required for every node (can be empty)
      - Max depth: 3-4 levels
      
      Syllabus Text:
      ${fullText.substring(0, 18000)}
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
        const result = JSON.parse(jsonStr);
        const tree: TreeNode[] = result.tree || [];

        if (tree.length === 0) {
            console.warn("Groq found no structure, creating default node");
            tree.push({ title: "General", estimatedHours: 1, status: "New", children: [] });
        }

        // 4. Save to Database (Course -> Nodes)

        // Calculate total stats
        const totalNodes = countNodes(tree);

        // Upsert Course (in case it already exists, though allow duplicates for different syllabi?)
        // Applying logic to create a new course for this specific syllabus
        const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .insert({
                user_id: userId,
                title: subjectName, // Use the enrolled subject name
                code: null, // We don't have code from registration flow easily
                file_url: fileUrl,
                total_chapters: totalNodes,
                completed_chapters: 0,
                color: "#6366f1" // Default color
            })
            .select()
            .single();

        if (courseError) throw new Error(`Course creation failed: ${courseError.message}`);
        const courseId = courseData.id;

        // Save Nodes
        await saveNodesRecursively(tree, courseId, userId, null, 0);

        return { success: true, courseId };

    } catch (error: any) {
        console.error(`Syllabus Processing Error (${subjectName}):`, error);
        return { success: false, error: error.message };
    }
};
