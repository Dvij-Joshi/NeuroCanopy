import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Plus, MessageSquare, Zap, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
};

type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
};

export default function Chat() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [systemContext, setSystemContext] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChat = chats.find(c => c.id === activeChatId);

  // Load Chats from Supabase
  useEffect(() => {
    const fetchChats = async () => {
      if (!user) {
        setLoadingChats(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*, chats(id, role, content, created_at)')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const formatted = data.map(conv => {
            const msgs = Array.isArray(conv.chats) ? conv.chats : [];
            return {
              id: conv.id,
              title: conv.title || 'New Session',
              messages: msgs
                .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((c: any) => ({
                  id: c.id,
                  role: c.role,
                  text: c.content
                }))
            };
          });
          setChats(formatted);
          setActiveChatId(formatted[0].id);
        } else {
          // If no conversations exist, create one
          handleStartNewChat(true);
        }
      } catch (err) {
        console.error('Error fetching chats:', err);
      } finally {
        setLoadingChats(false);
      }
    };

    fetchChats();
  }, [user]);

  // Load User Context from Supabase
  useEffect(() => {
    const fetchUserContext = async () => {
      if (!user) return;

      try {
        // Fetch Courses
        const { data: courses } = await supabase
          .from('courses')
          .select('*')
          .eq('user_id', user.id);

        // Fetch Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // Fetch Units and Topics
        const { data: units } = await supabase
          .from('units')
          .select('id, course_id, title, unit_number, topics(id, title, status)');

        // Fetch Materials
        const { data: materials } = await supabase
          .from('materials')
          .select('title, file_type, content_summary') // Hypothetical columns
          .eq('user_id', user.id);

        // Build System Prompt
        let contextContent = `You are Neuro, an advanced AI tutor inside the NeuroCanopy app. Use brutalist, direct language. Keep it punchy.\n\n`;
        
        if (profile) {
          contextContent += `Student Info:\n`;
          if (profile.full_name) contextContent += `- Name: ${profile.full_name}\n`;
          if (profile.major) contextContent += `- Major: ${profile.major}\n`;
          if (profile.university) contextContent += `- University: ${profile.university}\n`;
          if (profile.academic_year) contextContent += `- Academic Year: ${profile.academic_year}\n`;
          contextContent += `\n`;
        }

        if (courses && courses.length > 0) {
          contextContent += `Student's Courses & Syllabus:\n`;
          courses.forEach(c => {
            const courseUnits = units?.filter(u => u.course_id === c.id) || [];
            
            // Collect weak and mastered topics from the units
            const allTopics = courseUnits.flatMap(u => Array.isArray(u.topics) ? u.topics : []);
            const weakTopics = allTopics.filter(t => t.status === 'Weak').map(t => t.title).join(', ');
            const masteredTopics = allTopics.filter(t => t.status === 'Mastered').map(t => t.title).join(', ');
            
            contextContent += `- COURSE: ${c.title || c.name || ''} (${c.code || ''}). Total Chapters: ${c.total_chapters || c.totalChapters || courseUnits.length || 0}.\n`;
            
            if (courseUnits.length > 0) {
                 contextContent += `  Units/Modules: ${courseUnits.map(u => u.title || `Unit ${u.unit_number}`).join(', ')}\n`;
            }
            if (allTopics.length > 0) {
                 contextContent += `  Topics: ${allTopics.map(t => t.title).join(', ')}\n`;
            }
            
            if (weakTopics) contextContent += `  Weak Areas: ${weakTopics}\n`;
            if (masteredTopics) contextContent += `  Mastered Areas: ${masteredTopics}\n`;
          });
        } else {
          contextContent += `Student has no active courses.\n`;
        }

        if (materials && materials.length > 0) {
          contextContent += `\nUploaded Materials:\n`;
          materials.forEach(m => {
            if (m.title) contextContent += `- ${m.title} (${m.file_type})\n`;
            if (m.content_summary) contextContent += `  Summary: ${m.content_summary}\n`;
          });
        }

        contextContent += `\nAlways answer questions directly related to their subjects, units, and topics using the syllabus data above. Be highly motivating, use short paragraphs, and help them study based on their context.`;
        setSystemContext(contextContent);

      } catch (err) {
        console.error("Failed to fetch context", err);
      }
    };

    fetchUserContext();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, isTyping]);

  const handleStartNewChat = async (isInitial = false) => {
    if (!user) return;
    
    try {
      // Create new conversation
      const { data: convData, error: convErr } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, title: 'New Session' })
        .select()
        .single();
        
      if (convErr || !convData) throw convErr;

      // Create initial message
      const initialText = "Welcome to Neuro Chat! I'm synced with your coursework. What are we destroying today?";
      const { data: msgData, error: msgErr } = await supabase
        .from('chats')
        .insert({
          conversation_id: convData.id,
          user_id: user.id,
          role: 'assistant',
          content: initialText,
        })
        .select()
        .single();

      if (msgErr) console.error("Could not save initial msg:", msgErr);

      const newChat: ChatSession = {
        id: convData.id,
        title: convData.title,
        messages: msgData ? [{ id: msgData.id, role: msgData.role, text: msgData.content }] : []
      };
      
      setChats(prev => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      setIsSidebarOpen(false);
    } catch (err) {
      console.error("Failed to start new chat:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeChatId || !user) return;

    const userText = inputValue;
    setInputValue('');
    setIsTyping(true);

    const userMessage: ChatMessage = { id: `msg-${Date.now()}`, role: 'user', text: userText };
    let finalTitle = activeChat?.title;
    
    // Determine new title if needed
    if (activeChat?.title === 'New Session') {
      finalTitle = userText.length > 20 ? userText.slice(0, 20) + '...' : userText;
    }
    
    // Optimistically update UI
    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          title: finalTitle!,
          messages: [...c.messages, userMessage]
        };
      }
      return c;
    }));

    try {
      // Save User Message to Supabase
      const { data: savedUserMsg, error: userErr } = await supabase
        .from('chats')
        .insert({
          conversation_id: activeChatId,
          user_id: user.id,
          role: 'user',
          content: userText
        })
        .select()
        .single();
        
      if (userErr) console.error("Error saving user msg:", userErr);
      
      // Update Title & Updated_at of conversation
      await supabase
        .from('conversations')
        .update({ title: finalTitle, updated_at: new Date().toISOString() })
        .eq('id', activeChatId);

      // Prepare message history for Groq
      const currentChat = chats.find(c => c.id === activeChatId);
      const history = (currentChat?.messages || []).map(m => ({
        role: m.role,
        content: m.text
      }));

      // Append the new message
      history.push({ role: 'user', content: userText });

      // Prepend System context
      const messagesForApi = [
        { role: 'system', content: systemContext || 'You are a helpful AI tutor.' },
        ...history
      ];

      // @ts-ignore
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: messagesForApi,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from Groq');
      }

      const data = await response.json();
      const aiResponseText = data.choices[0].message.content;

      // Save AI response to DB
      const { data: savedAiMsg, error: aiErr } = await supabase
        .from('chats')
        .insert({
          conversation_id: activeChatId,
          user_id: user.id,
          role: 'assistant',
          content: aiResponseText
        })
        .select()
        .single();

      if (aiErr) console.error("Error saving ai msg", aiErr);

      const aiMessage: ChatMessage = { 
        id: savedAiMsg ? savedAiMsg.id : `msg-${Date.now() + 1}`, 
        role: 'assistant', 
        text: aiResponseText 
      };
      
      setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
          return { ...c, messages: [...c.messages, aiMessage] };
        }
        return c;
      }));
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = { id: `msg-${Date.now() + 1}`, role: 'assistant', text: 'SYSTEM ERROR. AI core offline. Check your network or API keys.' };
      setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
          return { ...c, messages: [...c.messages, errorMessage] };
        }
        return c;
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] overflow-hidden bg-[#FAF9F6] text-black font-sans">
      <header className="relative z-20 flex justify-between items-center px-4 py-4 border-b-4 border-black shadow-[0_4px_0_0_#000] bg-[#FFE600] shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white border-4 border-black p-1.5 transform -rotate-3">
            <Zap strokeWidth={3} className="text-black fill-[#FF3D00] h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Neuro Chat</h1>
        </div>
        
        <button 
          className="lg:hidden p-2 border-4 border-black bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000] active:translate-y-0 active:shadow-none transition-all"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" strokeWidth={3} />
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 absolute lg:static top-0 left-0 z-30 lg:z-auto
          h-full w-[300px] shrink-0 flex flex-col bg-[#FAF9F6] border-r-4 border-black
          transition-transform duration-300 ease-in-out
        `}>
          <div className="lg:hidden flex justify-end p-4 border-b-4 border-black bg-white">
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="p-2 border-4 border-black hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000] bg-[#FF3D00] text-white transition-all"
            >
              <X className="h-6 w-6" strokeWidth={3} />
            </button>
          </div>
          
          <div className="p-4 border-b-4 border-black bg-white">
            <button 
              onClick={() => handleStartNewChat(false)}
              className="w-full bg-[#00E676] border-4 border-black px-4 py-3 font-black uppercase text-lg hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000] active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Plus strokeWidth={3} className="h-6 w-6" /> New Session
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 p-4" style={{ scrollbarWidth: 'thin' }}>
            {chats.map((chat) => (
              <button 
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-left p-3 font-bold border-4 border-black transition-all flex items-center gap-3 ${
                  activeChatId === chat.id
                    ? 'bg-black text-white shadow-[4px_4px_0_0_#FF3D00] -translate-y-1'
                    : 'bg-white text-black hover:bg-[#FFE600] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000]'
                }`}
              >
                <MessageSquare className="h-5 w-5 shrink-0" strokeWidth={2.5} />
                <span className="truncate">{chat.title}</span>
              </button>
            ))}
          </div>
        </aside>

        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        <div className="relative flex flex-1 flex-col overflow-hidden bg-white min-w-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#FAF9F6]" style={{ scrollbarWidth: 'thin' }}>
            <div className="max-w-4xl mx-auto w-full pb-8 pt-4">
              {activeChat?.messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 opacity-50 text-center">
                  <Bot strokeWidth={2} className="h-24 w-24 mx-auto mb-4" />
                  <h2 className="text-2xl font-black uppercase tracking-tight">Ready to Help</h2>
                </div>
              )}
              
              <div className="space-y-6">
                {activeChat?.messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex items-start gap-3 sm:gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`mt-1 flex shrink-0 h-10 w-10 sm:h-12 sm:w-12 items-center justify-center border-4 border-black bg-white shadow-[4px_4px_0_0_#000] ${
                      msg.role === 'assistant' ? 'text-black bg-[#FFE600]' : 'bg-[#FF3D00] text-white'
                    }`}>
                      {msg.role === 'assistant' 
                        ? <Bot strokeWidth={2.5} className="h-6 w-6" /> 
                        : <User strokeWidth={2.5} className="h-6 w-6" />
                      }
                    </div>

                    <div className={`relative px-5 py-4 text-base font-medium border-4 border-black shadow-[4px_4px_0_0_#000] max-w-[85%] whitespace-pre-wrap ${
                      msg.role === 'assistant' 
                        ? 'bg-white' 
                        : 'bg-[#00E676]'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-start gap-3 sm:gap-5">
                    <div className="mt-1 flex shrink-0 h-10 w-10 sm:h-12 sm:w-12 items-center justify-center border-4 border-black bg-[#FFE600] shadow-[4px_4px_0_0_#000]">
                      <Bot strokeWidth={2.5} className="h-6 w-6 text-black" />
                    </div>
                    <div className="relative px-5 py-4 border-4 border-black shadow-[4px_4px_0_0_#000] bg-white flex items-center justify-center gap-1">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2.5 h-2.5 bg-black"></motion.div>
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2.5 h-2.5 bg-black"></motion.div>
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2.5 h-2.5 bg-black"></motion.div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-2" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#FFE600] border-t-4 border-black relative z-10 shrink-0">
            <div className="max-w-4xl mx-auto w-full">
              <div className="flex items-end gap-2 sm:gap-4 w-full">
                <textarea 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 w-full resize-none border-4 border-black bg-[#FAF9F6] p-3 sm:p-4 text-base sm:text-lg font-bold outline-none focus:bg-white focus:shadow-[4px_4px_0_0_#00E676] transition-all min-h-[60px] max-h-[200px] text-black placeholder-gray-500"
                  placeholder="Type your message..."
                  style={{ scrollbarWidth: 'none' }}
                />
                <button 
                  onClick={handleSendMessage}
                  className="shrink-0 p-3 sm:p-4 bg-[#FF3D00] text-white hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000] active:translate-y-0 active:shadow-none transition-all border-4 border-black h-[60px] sm:h-[64px] flex items-center justify-center"
                >
                  <Send className="h-6 w-6" strokeWidth={3} />
                </button>
              </div>
              <div className="mt-2 text-center text-xs font-bold text-black uppercase">
                 AI MAY PRODUCE INACCURATE INFORMATION
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}