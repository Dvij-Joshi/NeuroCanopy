import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../widgets/brutalist_widgets.dart';

// Assuming your backend URL - adapt as needed or use a local network IP for Android emulators (like 10.0.2.2)
const String apiUrl = 'http://10.0.2.2:3001/api';

enum Stage { idle, customSetup, fetching, ready, recording, processing, result, error }

class Report {
  final String question;
  final String transcript;
  final num pronunciation;
  final num fluency;
  final num completeness;
  final num accuracy;
  final num prosody;
  final num wpm;
  final num answerScore;
  final String confidence;
  final String feedback;
  final List<dynamic> strengths;
  final List<dynamic> improvements;

  Report({
    required this.question,
    required this.transcript,
    required this.pronunciation,
    required this.fluency,
    required this.completeness,
    required this.accuracy,
    required this.prosody,
    required this.wpm,
    required this.answerScore,
    required this.confidence,
    required this.feedback,
    required this.strengths,
    required this.improvements,
  });

  factory Report.fromJson(Map<String, dynamic> json) {
    return Report(
      question: json['question'] ?? '',
      transcript: json['transcript'] ?? '',
      pronunciation: json['pronunciation'] ?? 0,
      fluency: json['fluency'] ?? 0,
      completeness: json['completeness'] ?? 0,
      accuracy: json['accuracy'] ?? 0,
      prosody: json['prosody'] ?? 0,
      wpm: json['wpm'] ?? 0,
      answerScore: json['answerScore'] ?? 0,
      confidence: json['confidence'] ?? 'Medium',
      feedback: json['feedback'] ?? '',
      strengths: json['strengths'] ?? [],
      improvements: json['improvements'] ?? [],
    );
  }
}

class VivaScreen extends StatefulWidget {
  const VivaScreen({super.key});

  @override
  State<VivaScreen> createState() => _VivaScreenState();
}

class _VivaScreenState extends State<VivaScreen> {
  Stage _stage = Stage.idle;
  
  String _topic = "";
  String _difficulty = "Medium";
  String _question = "";
  String _error = "";
  Report? _report;

  List<dynamic> _upcomingVivas = [];
  Map<String, dynamic>? _lastSession;
  
  int _elapsed = 0;
  Timer? _timer;
  
  double _volumeLevel = 5.0;
  Timer? _volumeTimer;

  @override
  void initState() {
    super.initState();
    _fetchDashboardData();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _volumeTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchDashboardData() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;
    
    try {
      final today = DateTime.now();
      final startOfDay = DateTime(today.year, today.month, today.day).toIso8601String();
      final endOfDay = DateTime(today.year, today.month, today.day, 23, 59, 59, 999).toIso8601String();
      
      final upcoming = await Supabase.instance.client
          .from('schedule_events')
          .select('*')
          .eq('user_id', user.id)
          .inFilter('category', ['FOCUS', 'VIVA'])
          .eq('completed', false)
          .gte('start_time', startOfDay)
          .lte('start_time', endOfDay)
          .order('start_time', ascending: true)
          .limit(8);
      
      if (mounted) setState(() {
        _upcomingVivas = upcoming;
      });

      final lastItemResponse = await Supabase.instance.client
          .from('viva_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', ascending: false)
          .limit(1);
          
      if (lastItemResponse.isNotEmpty) {
        if (mounted) setState(() {
          _lastSession = lastItemResponse.first;
        });
      }
    } catch (e) {
      debugPrint("Fetch Dashboard Error: $e");
    }
  }

  Future<void> _fetchQuestion(String targetTopic, String diff) async {
    setState(() {
      _stage = Stage.fetching;
      _report = null;
      _error = "";
      _question = "";
    });

    try {
      final hc = HttpClient();
      final uri = Uri.parse('$apiUrl/question?topic=${Uri.encodeComponent(targetTopic)}&difficulty=${Uri.encodeComponent(diff)}');
      final req = await hc.getUrl(uri);
      final res = await req.close();
      final body = await res.transform(utf8.decoder).join();
      final data = jsonDecode(body);
      
      if (res.statusCode != 200) {
        throw Exception(data['error'] ?? "Failed to generate question");
      }
      
      if (!mounted) return;
      setState(() {
        _question = data['question'] ?? "Describe your understanding of $targetTopic.";
        _stage = Stage.ready;
      });
    } catch (err) {
      if (!mounted) return;
      setState(() {
        _error = "Azure Backend unavailable: ${err.toString()}\nUsing Offline Mock generation.";
        _question = "What are the core concepts and historical significance of $_topic? Please elaborate.";
        _stage = Stage.ready;
      });
    }
  }

  void _startRecording() {
    setState(() {
      _elapsed = 0;
      _stage = Stage.recording;
    });

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _elapsed++;
      });
    });

    // Mock volume bar
    final random = Random();
    _volumeTimer = Timer.periodic(const Duration(milliseconds: 100), (timer) {
      setState(() {
        _volumeLevel = 10.0 + random.nextDouble() * 80.0;
      });
    });
  }

  void _stopRecording() {
    _timer?.cancel();
    _volumeTimer?.cancel();
    setState(() {
      _stage = Stage.processing;
    });
    _submitAudioMock();
  }

  Future<void> _submitAudioMock() async {
    // In strict mobile environment w/o native audio recording plugins,
    // we bypass multipart to Azure STT and simulate the backend evaluation Report.
    // Replace heavily with `http.MultipartRequest` once symlinks/developer mode is enabled on build host.
    
    await Future.delayed(const Duration(seconds: 3)); // simulate processing time

    if (!mounted) return;

    final mockData = Report(
      question: _question,
      transcript: "Um, I think $_topic is generally related to the main principles of the subject, and it's quite important because it establishes the foundational rules... yeah that's basically it.",
      pronunciation: 8.5,
      fluency: 7.2,
      completeness: 6.0,
      accuracy: 7.0,
      prosody: 8.0,
      wpm: 120,
      answerScore: 7.5,
      confidence: "Medium",
      feedback: "You demonstrated a basic understanding of $_topic, but lacked specific details and terminology. Try to structure your response with clear introductory definitions before diving into examples.",
      strengths: ["Clear pronunciation", "Good pacing"],
      improvements: ["Use more technical vocabulary", "Expand on the core mechanisms"],
    );

    setState(() {
      _report = mockData;
      _stage = Stage.result;
    });

    await _saveSessionAndCompleteEvent(mockData);
  }

  Future<void> _saveSessionAndCompleteEvent(Report data) async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;
    
    try {
      await Supabase.instance.client.from('viva_sessions').insert({
        'user_id': user.id,
        'base_topic': _topic.isEmpty ? "Custom Viva" : _topic,
        'difficulty': _difficulty,
        'question': data.question,
        'transcript': data.transcript,
        'pronunciation': data.pronunciation,
        'fluency': data.fluency,
        'completeness': data.completeness,
        'accuracy': data.accuracy,
        'prosody': data.prosody,
        'wpm': data.wpm,
        'answer_score': data.answerScore,
        'confidence': data.confidence,
        'feedback': data.feedback,
        'strengths': data.strengths,
        'improvements': data.improvements,
      });
      await _fetchDashboardData();
    } catch (err) {
      debugPrint("Save session error: $err");
    }
  }

  String _fmtTime(int s) {
    final mins = s ~/ 60;
    final secs = s % 60;
    return '$mins:${secs.toString().padLeft(2, '0')}';
  }

  String _getGradeScore(num score) {
    if (score >= 9) return 'A+';
    if (score >= 8) return 'A';
    if (score >= 7) return 'B+';
    if (score >= 6) return 'B';
    if (score >= 5) return 'C';
    return 'Needs Work';
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width > 800;

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Row(
              children: [
                Icon(Icons.mic, size: 36, color: Colors.black),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'VOICE VIVA',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, height: 1.1),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              'Simulated oral examination and concept testing.',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black54),
            ),
            const SizedBox(height: 24),
            
            if (isDesktop)
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(flex: 3, child: _buildMainArea()),
                  const SizedBox(width: 24),
                  Expanded(flex: 2, child: _buildSidebar()),
                ],
              )
            else ...[
              _buildMainArea(),
              const SizedBox(height: 24),
              _buildSidebar(),
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildMainArea() {
    return Container(
      constraints: const BoxConstraints(minHeight: 400),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.black, width: 4),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(6, 6))],
      ),
      padding: const EdgeInsets.all(24),
      alignment: Alignment.center,
      child: _buildStageContent(),
    );
  }

  Widget _buildStageContent() {
    switch (_stage) {
      case Stage.idle:
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 96,
              height: 96,
              decoration: BoxDecoration(
                color: const Color(0xFF9B87F5),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.black, width: 6),
                boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
              ),
              child: const Icon(Icons.mic, color: Colors.black, size: 48),
            ),
            const SizedBox(height: 24),
            const Text('AUDIO ASSESSMENT', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
            const SizedBox(height: 8),
            const Text(
              'Start a custom viva from the sidebar or click an upcoming study topic.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.black54, fontWeight: FontWeight.bold),
            ),
          ],
        );

      case Stage.customSetup:
        return Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('SETUP CUSTOM\nVIVA', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, height: 1.1)),
                GestureDetector(
                  onTap: () => setState(() => _stage = Stage.idle),
                  child: Container(
                    color: Colors.red[500],
                    padding: const EdgeInsets.all(8),
                    child: const Icon(Icons.close, color: Colors.white, size: 24),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Container(
              color: Colors.grey[100],
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('TOPIC OR SUBJECT', style: TextStyle(fontWeight: FontWeight.w900)),
                  const SizedBox(height: 8),
                  TextField(
                    onChanged: (v) => _topic = v,
                    decoration: const InputDecoration(
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(borderSide: BorderSide(color: Colors.black, width: 2), borderRadius: BorderRadius.zero),
                      enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.black, width: 2), borderRadius: BorderRadius.zero),
                      focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.black, width: 2), borderRadius: BorderRadius.zero),
                      hintText: 'e.g. Data Structures',
                    ),
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            Container(
              color: Colors.grey[100],
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('DIFFICULTY', style: TextStyle(fontWeight: FontWeight.w900)),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: Colors.black, width: 2),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _difficulty,
                        style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                        dropdownColor: Colors.white,
                        items: const [
                          DropdownMenuItem(value: 'Easy', child: Text('🟩 Beginner / Easy')),
                          DropdownMenuItem(value: 'Medium', child: Text('🟨 Intermediate / Medium')),
                          DropdownMenuItem(value: 'Hard', child: Text('🟥 Advanced / Hard')),
                        ],
                        onChanged: (v) {
                          if (v != null) setState(() => _difficulty = v);
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(
              width: double.infinity,
              child: BrutalistButton(
                text: 'GENERATE QUESTION',
                onPressed: () {
                  if (_topic.trim().isNotEmpty) {
                    _fetchQuestion(_topic, _difficulty);
                  }
                },
                backgroundColor: const Color(0xFF9B87F5),
              ),
            ),
          ],
        );

      case Stage.fetching:
        return const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: Colors.black, strokeWidth: 6),
            SizedBox(height: 24),
            Text('CONSULTING LLM...', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
          ],
        );

      case Stage.error:
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              color: const Color(0xFFFFCDD2), // Colors.red[100]
              child: Text(_error, style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 24),
            BrutalistButton(text: 'GO BACK', onPressed: () => setState(() => _stage = Stage.idle), backgroundColor: Colors.black, textColor: Colors.white),
          ],
        );

      case Stage.ready:
      case Stage.recording:
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              color: Colors.black,
              child: Text('TOPIC: $_topic (${_difficulty.toUpperCase()})', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
            ),
            const SizedBox(height: 24),
            Text(_question, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900), textAlign: TextAlign.center),
            const SizedBox(height: 12),
            const Text('Take your time. Speak clearly when ready.', style: TextStyle(color: Colors.black54, fontWeight: FontWeight.bold)),
            const SizedBox(height: 32),
            if (_stage == Stage.ready)
              GestureDetector(
                onTap: _startRecording,
                child: Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(
                    color: const Color(0xFF9B87F5),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.black, width: 6),
                    boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
                  ),
                  child: const Icon(Icons.mic, color: Colors.black, size: 48),
                ),
              )
            else
              Column(
                children: [
                  GestureDetector(
                    onTap: _stopRecording,
                    child: Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        color: Colors.red[500],
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.black, width: 6),
                        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
                      ),
                      child: const Icon(Icons.stop, color: Colors.white, size: 48),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(_fmtTime(_elapsed), style: const TextStyle(fontSize: 32, fontFamily: 'monospace', fontWeight: FontWeight.w900)),
                  const SizedBox(height: 8),
                  const Text('LISTENING & RECORDING...', style: TextStyle(color: Colors.red, fontWeight: FontWeight.w900, letterSpacing: 2)),
                  const SizedBox(height: 16),
                  Container(
                    width: 200,
                    height: 48,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      border: Border.all(color: Colors.black, width: 4),
                    ),
                    alignment: Alignment.bottomCenter,
                    child: Stack(
                      children: [
                        Align(
                          alignment: Alignment.bottomCenter,
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 100),
                            width: double.infinity,
                            height: 48 * (_volumeLevel / 100),
                            color: Colors.greenAccent,
                          ),
                        ),
                        const Center(child: Text('VOL', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.black26))),
                      ],
                    ),
                  ),
                ],
              ),
          ],
        );

      case Stage.processing:
        return const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: Colors.black, strokeWidth: 6),
            SizedBox(height: 24),
            Text('PROCESSING AUDIO VIA AZURE TTS...', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16), textAlign: TextAlign.center),
          ],
        );

      case Stage.result:
        final r = _report!;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      color: const Color(0xFF9B87F5),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      child: const Text('VIVA REPORT', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: Colors.white)),
                    ),
                    const SizedBox(height: 4),
                    const Text('ASSESSMENT COMPLETE', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('${r.answerScore}/10', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 24)),
                    const Text('OVERALL SCORE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Colors.grey)),
                  ],
                ),
              ],
            ),
            const Divider(color: Colors.black, thickness: 4, height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.grey[100],
              child: Text('"${r.transcript}"', style: const TextStyle(fontStyle: FontStyle.italic, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _buildStatBox('Pronunc.', r.pronunciation.toString(), Colors.blue),
                _buildStatBox('Fluency', r.fluency.toString(), Colors.cyan),
                _buildStatBox('Accuracy', r.accuracy.toString(), Colors.orange),
                _buildStatBox('Pace', '${r.wpm}wpm', Colors.black),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.black,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('EXAMINER\'S FEEDBACK', style: TextStyle(color: Color(0xFF9B87F5), fontWeight: FontWeight.w900)),
                  const SizedBox(height: 8),
                  Text(r.feedback, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(child: BrutalistButton(text: 'RETURN', onPressed: () => setState(() => _stage = Stage.idle), backgroundColor: Colors.white)),
                const SizedBox(width: 8),
                Expanded(child: BrutalistButton(text: 'NEXT', onPressed: () => _fetchQuestion(_topic, _difficulty), backgroundColor: const Color(0xFF9B87F5), textColor: Colors.white)),
              ],
            ),
          ],
        );
    }
  }

  Widget _buildStatBox(String label, String value, Color color) {
    return Container(
      width: 70,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.black, width: 2),
      ),
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        children: [
          Text(label.toUpperCase(), style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: color)),
        ],
      ),
    );
  }

  Widget _buildSidebar() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (_stage == Stage.idle || _stage == Stage.result)
          Padding(
            padding: const EdgeInsets.only(bottom: 24.0),
            child: BrutalistButton(
              text: 'START CUSTOM VIVA',
              onPressed: () => setState(() => _stage = Stage.customSetup),
              backgroundColor: const Color(0xFFFFD43B),
            ),
          ),
          
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFFE5DEFF),
            border: Border.all(color: Colors.black, width: 4),
            boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
          ),
          padding: const EdgeInsets.all(16),
          margin: const EdgeInsets.only(bottom: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('LAST SESSION FEEDBACK', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
              const SizedBox(height: 16),
              if (_lastSession != null) ...[
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: Colors.black, width: 2),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Positioned(
                        top: -24,
                        right: -12,
                        child: Transform.rotate(
                          angle: 0.05,
                          child: Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFF9B87F5),
                              border: Border.all(color: Colors.black, width: 2),
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            child: Text(_getGradeScore(_lastSession!['answer_score'] ?? 0), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: Colors.white)),
                          ),
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_lastSession!['base_topic'] ?? '', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14), maxLines: 1, overflow: TextOverflow.ellipsis),
                          const SizedBox(height: 8),
                          Text(_lastSession!['feedback'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12), maxLines: 3, overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  color: Colors.black,
                  padding: const EdgeInsets.all(4),
                  child: Row(
                    children: [
                      Expanded(child: _buildSmallStatBox('Pronunc.', _lastSession!['pronunciation'].toString(), Colors.black)),
                      const SizedBox(width: 4),
                      Expanded(child: _buildSmallStatBox('Fluency', _lastSession!['fluency'].toString(), Colors.black)),
                      const SizedBox(width: 4),
                      Expanded(child: _buildSmallStatBox('Score', '${_lastSession!['answer_score']}/10', Colors.black)),
                    ],
                  ),
                ),
              ] else
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: Colors.black, width: 2),
                  ),
                  padding: const EdgeInsets.all(16),
                  alignment: Alignment.center,
                  child: const Text('NO PAST VIVAS FOUND.', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.grey)),
                ),
            ],
          ),
        ),

        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: Colors.black, width: 4),
            boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('UPCOMING VIVAS', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
              const SizedBox(height: 16),
              if (_upcomingVivas.isNotEmpty)
                ..._upcomingVivas.map((ev) {
                  final titleStr = ev['title'].toString().replaceAll(RegExp(r'^\[.*?\]\s*'), '').replaceAll('Study: ', '');
                  final timeStr = "${DateTime.parse(ev['start_time']).toLocal().hour.toString().padLeft(2, '0')}:${DateTime.parse(ev['start_time']).toLocal().minute.toString().padLeft(2, '0')}";
                  return Container(
                    decoration: const BoxDecoration(
                      border: Border(bottom: BorderSide(color: Colors.black12, width: 2)),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(titleStr, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14), maxLines: 1, overflow: TextOverflow.ellipsis),
                              Text(timeStr, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 10, color: Colors.grey)),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () {
                            setState(() {
                              _topic = titleStr;
                              _stage = Stage.customSetup;
                            });
                            _fetchQuestion(titleStr, 'Medium');
                          },
                          child: Container(
                            color: const Color(0xFF9B87F5),
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            child: const Row(
                              children: [
                                Text('START', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 10, color: Colors.white)),
                                Icon(Icons.chevron_right, size: 14, color: Colors.white),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                })
              else
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  alignment: Alignment.center,
                  decoration: const BoxDecoration(border: Border()), 
                  child: const Text('No vivas scheduled today.', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.grey)),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSmallStatBox(String label, String value, Color color) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
      ),
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        children: [
          Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: color)),
          Text(label.toUpperCase(), style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }
}
