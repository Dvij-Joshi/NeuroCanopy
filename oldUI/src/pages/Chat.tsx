import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Send, Bot, User, Plus, Trash2, MessageSquare, Loader2, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  getChatMessages, saveChatMessage, ChatMessage,
  getConversations, createConversation, deleteConversation,
  updateConversationTitle, Conversation
} from "@/lib/db";
import { toast } from "sonner";

const GROQ_API_KEY = "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";

/* ─── helpers ──────────────────────────────────────────────── */
const deriveTitle = (firstUserMsg: string) =>
  firstUserMsg.length > 40 ? firstUserMsg.slice(0, 40) + "…" : firstUserMsg;

/* ─── Chat Component ─────────────────────────────────────────── */
const Chat = () => {
  const { user } = useAuth();

  // Conversation list
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── boot: load conversations ── */
  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  /* ── auto scroll ── */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const loadConversations = async () => {
    if (!user) return;
    const convs = await getConversations(user.id);
    setConversations(convs);
    // Auto-select most recent, or create new if empty
    if (convs.length > 0 && !activeConvId) {
      selectConversation(convs[0].id);
    }
  };

  const selectConversation = async (convId: string) => {
    if (activeConvId === convId) return;
    setActiveConvId(convId);
    setMessages([]);
    setIsLoadingMsgs(true);
    try {
      const msgs = await getChatMessages(user!.id, convId);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load messages");
    } finally {
      setIsLoadingMsgs(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleNewChat = async () => {
    let uid = user?.id;
    if (!uid) {
      const { data } = await supabase.auth.getUser();
      uid = data?.user?.id;
    }
    if (!uid) { toast.error("Not signed in"); return; }

    try {
      const conv = await createConversation(uid, "New Chat");
      setConversations(prev => [conv, ...prev]);
      setActiveConvId(conv.id);
      setMessages([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      toast.error("Could not create new chat");
    }
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation(convId);
      const updated = conversations.filter(c => c.id !== convId);
      setConversations(updated);
      if (activeConvId === convId) {
        if (updated.length > 0) {
          selectConversation(updated[0].id);
        } else {
          setActiveConvId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      toast.error("Failed to delete conversation");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    let uid = user?.id;
    if (!uid) {
      const { data } = await supabase.auth.getUser();
      uid = data?.user?.id;
    }
    if (!uid) { toast.error("Not signed in"); return; }

    // Create conversation if none active
    let convId = activeConvId;
    if (!convId) {
      try {
        const conv = await createConversation(uid, "New Chat");
        setConversations(prev => [conv, ...prev]);
        setActiveConvId(conv.id);
        convId = conv.id;
      } catch (err) {
        toast.error("Could not create conversation");
        return;
      }
    }

    const content = input.trim();
    setInput("");

    // Optimistic user message
    const tempId = "temp-" + Date.now();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      conversationId: convId,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setIsTyping(true);

    try {
      // Save user message to DB
      const savedUserMsg = await saveChatMessage(uid, convId, "user", content);

      // Replace optimistic msg with real one
      setMessages(prev => prev.map(m => m.id === tempId ? savedUserMsg : m));

      // Auto-title conversation after first message
      const isTitleDefault = conversations.find(c => c.id === convId)?.title === "New Chat";
      if (isTitleDefault && messages.length === 0) {
        const newTitle = deriveTitle(content);
        await updateConversationTitle(convId, newTitle);
        setConversations(prev =>
          prev.map(c => c.id === convId ? { ...c, title: newTitle } : c)
        );
      }

      // Build message history (last 12 messages for context)
      const history = [...messages.filter(m => m.id !== tempId), savedUserMsg]
        .slice(-12)
        .map(m => ({ role: m.role, content: m.content }));

      // Call Groq
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are Veda, an intelligent AI study assistant. Help students understand concepts, plan study sessions, prepare for exams, and stay motivated. Be concise, clear, and academically rigorous. Format responses with markdown when helpful.",
            },
            ...history,
          ],
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson?.error?.message || "Groq API error");
      }

      const json = await response.json();
      const aiContent =
        json.choices?.[0]?.message?.content ||
        "I'm having trouble connecting right now. Please try again.";

      // Save AI message
      const savedAiMsg = await saveChatMessage(uid, convId, "assistant", aiContent);
      setMessages(prev => [...prev, savedAiMsg]);

      // Bump conversation to top
      setConversations(prev => {
        const conv = prev.find(c => c.id === convId);
        if (!conv) return prev;
        return [{ ...conv }, ...prev.filter(c => c.id !== convId)];
      });
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error("Failed to send: " + (error?.message || "Unknown error"));
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const activeConv = conversations.find(c => c.id === activeConvId);

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-5rem)] overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm mx-4 md:mx-8 mb-4">

        {/* ── Left Sidebar: conversation list ── */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col border-r border-border/50 bg-background/40 shrink-0 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <span className="font-display font-semibold text-sm">Chats</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 rounded-lg"
                  onClick={handleNewChat}
                  title="New chat"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>No chats yet</p>
                    <p className="text-xs mt-1">Start a new conversation</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv.id)}
                      className={cn(
                        "group w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all",
                        activeConvId === conv.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                      <span className="flex-1 truncate text-xs font-medium">{conv.title}</span>
                      <button
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Chat Area ── */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 shrink-0">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/20 p-1.5">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm leading-none">{activeConv?.title || "Veda AI"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">AI Study Assistant</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
          >
            {isLoadingMsgs ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="rounded-2xl bg-primary/10 p-6 border border-primary/20">
                  <Bot className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-display font-semibold text-lg mb-1">Veda AI</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Your intelligent study assistant. Ask me anything — concepts, exam prep, study plans, or just a quick explanation.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 max-w-sm w-full">
                  {[
                    "Explain Bernoulli's theorem",
                    "Create a study plan for finals",
                    "Quiz me on photosynthesis",
                    "Summarize today's lecture notes",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                      className="text-xs text-left rounded-lg border border-border/50 bg-card/50 px-3 py-2 hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, i) => (
                <motion.div
                  key={message.id || i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}
                >
                  <div className={cn(
                    "rounded-full p-2 h-8 w-8 shrink-0 flex items-center justify-center",
                    message.role === "user" ? "bg-primary" : "bg-muted"
                  )}>
                    {message.role === "user"
                      ? <User className="h-4 w-4 text-primary-foreground" />
                      : <Bot className="h-4 w-4" />
                    }
                  </div>
                  <div className={cn(
                    "rounded-2xl px-4 py-2.5 max-w-[78%] text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted rounded-tl-sm"
                  )}>
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                </motion.div>
              ))
            )}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="rounded-full bg-muted p-2 h-8 w-8 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl bg-muted px-4 py-2.5 flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.span
                      key={i}
                      className="block h-2 w-2 rounded-full bg-muted-foreground/60"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Bar */}
          <div className="border-t border-border/50 p-4 shrink-0">
            <div className="flex gap-2 items-center">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask Veda anything..."
                className="flex-1 bg-background/50"
                disabled={isTyping}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="shrink-0"
              >
                {isTyping
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Send className="h-4 w-4" />
                }
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Powered by LLaMA 3.3 · Press <kbd className="px-1 py-0.5 rounded bg-muted text-xs">↵ Enter</kbd> to send
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
