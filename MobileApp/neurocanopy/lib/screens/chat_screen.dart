import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../widgets/brutalist_widgets.dart';

const String groqApiKey = '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';

class ChatMessage {
  final String id;
  final String role; // 'user' | 'assistant' | 'system'
  final String text;

  ChatMessage({required this.id, required this.role, required this.text});
}

class ChatSession {
  final String id;
  String title;
  List<ChatMessage> messages;

  ChatSession({required this.id, required this.title, required this.messages});
}

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  List<ChatSession> _chats = [];
  String _activeChatId = '';
  bool _loadingChats = true;
  bool _isTyping = false;
  String _systemContext = '';

  @override
  void initState() {
    super.initState();
    _fetchUserContext();
    _fetchChats();
  }

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  Future<void> _fetchChats() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) {
      if (mounted) setState(() => _loadingChats = false);
      return;
    }

    try {
      final data = await Supabase.instance.client
          .from('conversations')
          .select('*, chats(id, role, content, created_at)')
          .eq('user_id', user.id)
          .order('updated_at', ascending: false);

      if (data.isNotEmpty) {
        List<ChatSession> formatted = [];
        for (var conv in data) {
          final msgsRaw = (conv['chats'] as List<dynamic>?) ?? [];
          msgsRaw.sort((a, b) => DateTime.parse(a['created_at']).compareTo(DateTime.parse(b['created_at'])));
          final msgs = msgsRaw.map((c) => ChatMessage(
                id: c['id'].toString(),
                role: c['role'].toString(),
                text: c['content'].toString(),
              )).toList();

          formatted.add(ChatSession(
            id: conv['id'].toString(),
            title: conv['title']?.toString() ?? 'New Session',
            messages: msgs,
          ));
        }

        if (mounted) {
          setState(() {
            _chats = formatted;
            _activeChatId = formatted.first.id;
            _loadingChats = false;
          });
          WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
        }
      } else {
        await _handleStartNewChat(isInitial: true);
      }
    } catch (err) {
      debugPrint('Error fetching chats: $err');
      if (mounted) setState(() => _loadingChats = false);
    }
  }

  Future<void> _fetchUserContext() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    try {
      final courses = await Supabase.instance.client.from('courses').select('*').eq('user_id', user.id);
      final profileResp = await Supabase.instance.client.from('profiles').select('*').eq('id', user.id).limit(1);
      final profile = profileResp.isNotEmpty ? profileResp.first : null;
      final units = await Supabase.instance.client.from('units').select('id, course_id, title, unit_number, topics(id, title, status)');

      String contextContent = "You are Neuro, an advanced AI tutor inside the NeuroCanopy app. Use brutalist, direct language. Keep it punchy.\n\n";

      if (profile != null) {
        contextContent += "Student Info:\n";
        if (profile['full_name'] != null) contextContent += "- Name: ${profile['full_name']}\n";
        if (profile['major'] != null) contextContent += "- Major: ${profile['major']}\n";
        if (profile['university'] != null) contextContent += "- University: ${profile['university']}\n";
      }

      if (courses.isNotEmpty) {
        contextContent += "\nStudent's Courses & Syllabus:\n";
        for (var c in courses) {
          final courseUnits = units.where((u) => u['course_id'] == c['id']).toList();
          List<dynamic> allTopics = [];
          for (var u in courseUnits) {
            allTopics.addAll((u['topics'] as List<dynamic>?) ?? []);
          }

          final weakTopics = allTopics.where((t) => t['status'] == 'Weak').map((t) => t['title']).join(', ');
          final masteredTopics = allTopics.where((t) => t['status'] == 'Mastered').map((t) => t['title']).join(', ');

          contextContent += "- COURSE: ${c['title'] ?? ''} (${c['code'] ?? ''}). Total Chapters: ${c['total_chapters'] ?? courseUnits.length}.\n";
          
          if (weakTopics.isNotEmpty) contextContent += "  Weak Areas: $weakTopics\n";
          if (masteredTopics.isNotEmpty) contextContent += "  Mastered Areas: $masteredTopics\n";
        }
      } else {
        contextContent += "Student has no active courses.\n";
      }

      contextContent += "\nAlways answer questions directly related to their subjects, units, and topics using the syllabus data above. Be highly motivating, use short paragraphs, and help them study based on their context.";
      
      _systemContext = contextContent;
    } catch (err) {
      debugPrint("Failed to fetch user context: $err");
    }
  }

  Future<void> _handleStartNewChat({bool isInitial = false}) async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    try {
      final convData = await Supabase.instance.client.from('conversations').insert({
        'user_id': user.id,
        'title': 'New Session'
      }).select().single();

      final initialText = "Welcome to Neuro Chat! I'm synced with your coursework. What are we destroying today?";
      final msgData = await Supabase.instance.client.from('chats').insert({
        'conversation_id': convData['id'],
        'user_id': user.id,
        'role': 'assistant',
        'content': initialText,
      }).select().single();

      final newChat = ChatSession(
        id: convData['id'].toString(),
        title: convData['title'].toString(),
        messages: [
          ChatMessage(
            id: msgData['id'].toString(),
            role: msgData['role'].toString(),
            text: msgData['content'].toString(),
          )
        ],
      );

      if (mounted) {
        setState(() {
          _chats.insert(0, newChat);
          _activeChatId = newChat.id;
          _loadingChats = false;
        });
      }
    } catch (err) {
      debugPrint("Failed to start new chat: $err");
    }
  }

  Future<void> _handleSendMessage() async {
    final text = _inputController.text.trim();
    if (text.isEmpty || _activeChatId.isEmpty) return;

    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    _inputController.clear();
    
    final userMessage = ChatMessage(id: 'msg-${DateTime.now().millisecondsSinceEpoch}', role: 'user', text: text);

    final chatIndex = _chats.indexWhere((c) => c.id == _activeChatId);
    if (chatIndex == -1) return;

    String finalTitle = _chats[chatIndex].title;
    if (finalTitle == 'New Session') {
      finalTitle = text.length > 20 ? '${text.substring(0, 20)}...' : text;
    }

    setState(() {
      _chats[chatIndex].title = finalTitle;
      _chats[chatIndex].messages.add(userMessage);
      _isTyping = true;
    });

    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

    try {
      // Save User Message
      await Supabase.instance.client.from('chats').insert({
        'conversation_id': _activeChatId,
        'user_id': user.id,
        'role': 'user',
        'content': text
      });

      await Supabase.instance.client.from('conversations').update({
        'title': finalTitle,
        'updated_at': DateTime.now().toIso8601String()
      }).eq('id', _activeChatId);

      // Call Groq API
      final history = _chats[chatIndex].messages.map((m) => {
        "role": m.role,
        "content": m.text
      }).toList();

      final messagesForApi = [
        {"role": "system", "content": _systemContext.isEmpty ? "You are a helpful AI tutor." : _systemContext},
        ...history
      ];

      final response = await http.post(
        Uri.parse('https://api.groq.com/openai/v1/chat/completions'),
        headers: {
          'Authorization': 'Bearer $groqApiKey',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'model': 'llama-3.1-8b-instant',
          'messages': messagesForApi,
          'temperature': 0.7,
        }),
      );

      if (response.statusCode != 200) {
        throw Exception('Groq API Error: ${response.body}');
      }

      final data = jsonDecode(response.body);
      final aiResponseText = data['choices'][0]['message']['content'];

      // Save AI Message
      final savedAiMsg = await Supabase.instance.client.from('chats').insert({
        'conversation_id': _activeChatId,
        'user_id': user.id,
        'role': 'assistant',
        'content': aiResponseText
      }).select().single();

      final aiMessage = ChatMessage(
        id: savedAiMsg['id'].toString(),
        role: 'assistant',
        text: aiResponseText.toString(),
      );

      if (mounted && _activeChatId == _chats[chatIndex].id) {
        setState(() {
          _chats[chatIndex].messages.add(aiMessage);
        });
        WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
      }
    } catch (e) {
      debugPrint('Chat error: $e');
      if (mounted && _activeChatId == _chats[chatIndex].id) {
        setState(() {
          _chats[chatIndex].messages.add(ChatMessage(
            id: 'err-${DateTime.now().millisecondsSinceEpoch}',
            role: 'assistant',
            text: 'SYSTEM ERROR. AI core offline. Check your network or API keys: $e',
          ));
        });
        WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
      }
    } finally {
      if (mounted) setState(() => _isTyping = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    ChatSession? activeChat;
    try {
      activeChat = _chats.firstWhere((c) => c.id == _activeChatId);
    } catch (_) {}

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFFFAF9F6),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFFE600),
        toolbarHeight: 80,
        elevation: 0,
        shape: const Border(bottom: BorderSide(color: Colors.black, width: 4)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black, size: 28),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Row(
          children: [
            Transform.rotate(
              angle: -0.05,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: Colors.black, width: 4),
                ),
                child: const Icon(Icons.bolt, color: Color(0xFFFF3D00), size: 28),
              ),
            ),
            const SizedBox(width: 12),
            const Text('NEURO CHAT', style: TextStyle(color: Colors.black, fontSize: 24, fontWeight: FontWeight.w900)),
          ],
        ),
        actions: [
          GestureDetector(
            onTap: () => _scaffoldKey.currentState?.openEndDrawer(),
            child: Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.black, width: 4),
                boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
              ),
              child: const Icon(Icons.menu, color: Colors.black, size: 24),
            ),
          ),
        ],
      ),
      endDrawer: _buildDrawer(),
      body: Column(
        children: [
          Expanded(
            child: _loadingChats
                ? const Center(child: CircularProgressIndicator(color: Colors.black, strokeWidth: 6))
                : _buildMessageArea(activeChat),
          ),
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildDrawer() {
    return Drawer(
      backgroundColor: const Color(0xFFFAF9F6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(bottom: BorderSide(color: Colors.black, width: 4)),
            ),
            child: SafeArea(
              bottom: false,
              child: BrutalistButton(
                text: 'NEW SESSION',
                onPressed: () {
                  Navigator.pop(context);
                  _handleStartNewChat();
                },
                backgroundColor: const Color(0xFF00E676),
                icon: Icons.add,
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _chats.length,
              itemBuilder: (context, index) {
                final chat = _chats[index];
                final isActive = chat.id == _activeChatId;
                return GestureDetector(
                  onTap: () {
                    setState(() => _activeChatId = chat.id);
                    Navigator.pop(context);
                    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
                  },
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isActive ? Colors.black : Colors.white,
                      border: Border.all(color: Colors.black, width: 4),
                      boxShadow: [
                        BoxShadow(
                          color: isActive ? const Color(0xFFFF3D00) : Colors.black,
                          offset: const Offset(4, 4),
                        )
                      ],
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.chat_bubble_outline, color: isActive ? Colors.white : Colors.black, size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            chat.title,
                            style: TextStyle(
                              color: isActive ? Colors.white : Colors.black,
                              fontWeight: FontWeight.w900,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageArea(ChatSession? activeChat) {
    if (activeChat == null || activeChat.messages.isEmpty) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.smart_toy, size: 80, color: Colors.black12),
          const SizedBox(height: 16),
          const Text('READY TO HELP', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.black26)),
        ],
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(16),
      itemCount: activeChat.messages.length + (_isTyping ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == activeChat.messages.length) {
          // Typing indicator
          return _buildMessageBubble(
            role: 'assistant',
            content: 'Typing...',
            isTypingIndicator: true,
          );
        }

        final msg = activeChat.messages[index];
        return _buildMessageBubble(
          role: msg.role,
          content: msg.text,
        );
      },
    );
  }

  Widget _buildMessageBubble({required String role, required String content, bool isTypingIndicator = false}) {
    final isAssistant = role == 'assistant' || role == 'system';
    
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: isAssistant ? MainAxisAlignment.start : MainAxisAlignment.end,
        children: [
          if (isAssistant) ...[
            _buildAvatar(true),
            const SizedBox(width: 12),
          ],
          
          Flexible(
            child: Container(
              decoration: BoxDecoration(
                color: isAssistant ? Colors.white : const Color(0xFF00E676),
                border: Border.all(color: Colors.black, width: 4),
                boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
              ),
              padding: const EdgeInsets.all(16),
              child: isTypingIndicator
                  ? const Text('...', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18))
                  : SelectableText(
                      content,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
            ),
          ),

          if (!isAssistant) ...[
            const SizedBox(width: 12),
            _buildAvatar(false),
          ],
        ],
      ),
    );
  }

  Widget _buildAvatar(bool isAssistant) {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: isAssistant ? const Color(0xFFFFE600) : const Color(0xFFFF3D00),
        border: Border.all(color: Colors.black, width: 4),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
      ),
      child: Icon(
        isAssistant ? Icons.smart_toy : Icons.person,
        color: isAssistant ? Colors.black : Colors.white,
        size: 28,
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFFFFE600),
        border: Border(top: BorderSide(color: Colors.black, width: 4)),
      ),
      padding: const EdgeInsets.all(16),
      child: SafeArea(
        top: false,
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAF9F6),
                      border: Border.all(color: Colors.black, width: 4),
                      boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
                    ),
                    child: TextField(
                      controller: _inputController,
                      minLines: 1,
                      maxLines: 4,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                      decoration: const InputDecoration(
                        hintText: 'Type your message...',
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.all(16),
                      ),
                      onSubmitted: (_) => _handleSendMessage(),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                GestureDetector(
                  onTap: _handleSendMessage,
                  child: Container(
                    height: 56,
                    width: 56,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFF3D00),
                      border: Border.all(color: Colors.black, width: 4),
                      boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
                    ),
                    child: const Icon(Icons.send, color: Colors.white, size: 28),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              'AI MAY PRODUCE INACCURATE INFORMATION',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 10, color: Colors.black),
            ),
          ],
        ),
      ),
    );
  }
}
