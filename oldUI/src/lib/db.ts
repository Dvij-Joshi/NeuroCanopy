import { supabase } from "@/lib/supabase";

// --- Interfaces ---

export interface Course {
    id?: string;
    title: string;
    code: string;
    professor: string;
    credits: number;
    color: string;
    totalChapters: number;
    completedChapters: number;
    user_id?: string;
}

export interface KnowledgeNode {
    id?: string;
    courseId: string;
    parentId: string | null;
    title: string;
    status: "Mastered" | "Learning" | "Weak" | "New";
    retention: number;
    estimatedHours: number;
    depth: number;
}

export interface ScheduleEvent {
    id?: string;
    title: string;
    category: "Class" | "Study" | "Exam" | "Life" | "Gym" | "Other";
    startTime: string; // ISO string for Supabase
    endTime: string;
    completed: boolean;
    recurrence?: string;
    user_id?: string;
}


export interface VivaSession {
    id?: string;
    courseId: string;
    score: number;
    durationSeconds: number;
    createdAt: string;
}

export interface ChatMessage {
    id?: string;
    conversationId?: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
}

// --- Service Functions ---

// 1. Courses
export const getCourses = async (userId: string) => {
    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', userId);

    if (error) throw error;
    // Map snake_case DB columns → camelCase interface
    return (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        code: row.code ?? '',
        professor: row.professor ?? '',
        credits: row.credits ?? 3,
        color: row.color ?? '#3b82f6',
        totalChapters: row.total_chapters ?? 0,
        completedChapters: row.completed_chapters ?? 0,
        file_url: row.file_url,
    })) as Course[];
};

export const addCourse = async (userId: string, course: Omit<Course, "id">) => {
    const { data, error } = await supabase
        .from('courses')
        .insert([{
            user_id: userId,
            title: course.title,
            code: course.code,
            professor: course.professor,
            credits: course.credits,
            color: course.color,
            total_chapters: course.totalChapters,
            completed_chapters: course.completedChapters,
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

// 2. Knowledge Nodes
export const getNodes = async (userId: string, courseId: string) => {
    const { data, error } = await supabase
        .from('nodes')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId);

    if (error) throw error;
    // Map snake_case to camelCase
    return data.map((node: any) => ({
        id: node.id,
        courseId: node.course_id,
        parentId: node.parent_id,
        title: node.title,
        status: node.status,
        retention: node.retention,
        estimatedHours: node.estimated_hours,
        depth: node.depth
    })) as KnowledgeNode[];
};

export const getAllNodes = async (userId: string) => {
    const { data, error } = await supabase
        .from('nodes')
        .select('*')
        .eq('user_id', userId);

    if (error) throw error;
    return data.map((node: any) => ({
        id: node.id,
        courseId: node.course_id,
        parentId: node.parent_id,
        title: node.title,
        status: node.status,
        retention: node.retention,
        estimatedHours: node.estimated_hours,
        depth: node.depth
    })) as KnowledgeNode[];
};

export const updateNodeStatus = async (userId: string, nodeId: string, status: KnowledgeNode["status"], retention: number) => {
    const { error } = await supabase
        .from('nodes')
        .update({ status, retention })
        .eq('id', nodeId)
        .eq('user_id', userId);

    if (error) throw error;
};

// 3. Schedule
export const getSchedule = async (userId: string) => {
    const { data, error } = await supabase
        .from('schedule_events')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true });

    if (error) throw error;
    return data.map((event: any) => ({
        id: event.id,
        title: event.title,
        category: event.category,
        startTime: event.start_time,
        endTime: event.end_time,
        completed: event.completed,
        recurrence: event.recurrence
    })) as ScheduleEvent[];
};

export const addScheduleEvent = async (userId: string, event: Omit<ScheduleEvent, "id">) => {
    const { data, error } = await supabase
        .from('schedule_events')
        .insert([{
            user_id: userId,
            title: event.title,
            category: event.category,
            start_time: event.startTime,
            end_time: event.endTime,
            completed: event.completed,
            recurrence: event.recurrence
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const toggleScheduleCompletion = async (userId: string, eventId: string, currentStatus: boolean) => {
    const { error } = await supabase
        .from('schedule_events')
        .update({ completed: !currentStatus })
        .eq('id', eventId)
        .eq('user_id', userId);

    if (error) throw error;
};

// 4. Viva Sessions
export const getVivaSessions = async (userId: string) => {
    const { data, error } = await supabase
        .from('viva_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map((session: any) => ({
        id: session.id,
        courseId: session.course_id,
        score: session.score,
        durationSeconds: session.duration_seconds,
        createdAt: session.created_at
    })) as VivaSession[];
};


export const saveVivaSession = async (userId: string, session: Omit<VivaSession, "id">) => {
    const { data, error } = await supabase
        .from('viva_sessions')
        .insert([{
            user_id: userId,
            course_id: session.courseId,
            score: session.score,
            duration_seconds: session.durationSeconds
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

// 5. Conversations & Chat
export interface Conversation {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export const getConversations = async (userId: string): Promise<Conversation[]> => {
    const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) { console.error('Error fetching conversations:', error); return []; }
    return data.map((c: any) => ({ id: c.id, title: c.title, createdAt: c.created_at, updatedAt: c.updated_at }));
};

export const createConversation = async (userId: string, title = 'New Chat'): Promise<Conversation> => {
    const { data, error } = await supabase
        .from('conversations')
        .insert([{ user_id: userId, title }])
        .select()
        .single();
    if (error) throw error;
    return { id: data.id, title: data.title, createdAt: data.created_at, updatedAt: data.updated_at };
};

export const updateConversationTitle = async (conversationId: string, title: string) => {
    const { error } = await supabase
        .from('conversations')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    if (error) throw error;
};

export const deleteConversation = async (conversationId: string) => {
    const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);
    if (error) throw error;
};

export const getChatMessages = async (userId: string, conversationId: string) => {
    const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) { console.error('Error fetching chats:', error); return []; }
    return data.map((msg: any) => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        createdAt: msg.created_at
    })) as ChatMessage[];
};

export const saveChatMessage = async (userId: string, conversationId: string, role: 'user' | 'assistant', content: string): Promise<ChatMessage> => {
    const { data, error } = await supabase
        .from('chats')
        .insert([{ user_id: userId, conversation_id: conversationId, role, content }])
        .select()
        .single();
    if (error) throw error;
    return { id: data.id, conversationId: data.conversation_id, role: data.role, content: data.content, createdAt: data.created_at };
};


// 6. Timetable
export const getTimetable = async (userId: string) => {
    const { data, error } = await supabase
        .from('timetables')
        .select(`
            *,
            subjects (
                name,
                category
            )
        `)
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching timetable:", error);
        return [];
    }
    return data;
};
