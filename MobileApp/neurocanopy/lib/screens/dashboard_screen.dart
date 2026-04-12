import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../widgets/brutalist_widgets.dart';
import 'profile_screen.dart';
import 'settings_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _profile;
  List<dynamic> _courses = [];
  List<Map<String, dynamic>> _recentLogs = [];

  int _streak = 0;
  int _syllabusProgress = 0;
  String _avgScore = 'N/A';
  int _focusHours = 0;
  int _daysToExam = -1;
  String _examTitle = 'No Exam Set';
  int _focusBlocksToday = 0;
  int _vivasToday = 0;

  @override
  void initState() {
    super.initState();
    _fetchDashboardData();
  }

  Future<void> _fetchDashboardData() async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      final prof = await Supabase.instance.client
          .from('profiles')
          .select()
          .eq('id', user.id)
          .maybeSingle();

      int streak = 0;
      int focusHours = 0;
      String avgScore = 'N/A';
      int daysToExam = -1;
      String examTitle = 'No Exam Set';

      if (prof != null) {
        streak = prof['current_streak'] ?? 0;
        focusHours = prof['total_study_hours'] ?? 0;
        final avg = prof['average_viva_score'];
        if (avg != null) {
          avgScore = avg > 90 ? 'A' : (avg > 80 ? 'B+' : 'C');
        }
        final nextExam = prof['next_exam_date'];
        if (nextExam != null) {
          final examDate = DateTime.parse(nextExam);
          daysToExam = examDate.difference(DateTime.now()).inDays;
          examTitle = 'Next Exam';
        }
      }

      final cData = await Supabase.instance.client
          .from('courses')
          .select('id, title, color_hex, total_chapters, completed_chapters')
          .eq('user_id', user.id);

      int totalChap = 0;
      int compChap = 0;
      for (var c in cData) {
        totalChap += (c['total_chapters'] as int? ?? 10);
        compChap += (c['completed_chapters'] as int? ?? 0);
      }
      final syllabusProgress = totalChap > 0
          ? ((compChap / totalChap) * 100).round()
          : 0;

      final vData = await Supabase.instance.client
          .from('viva_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', ascending: false)
          .limit(5);
      final sData = await Supabase.instance.client
          .from('schedule_events')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', ascending: false)
          .limit(5);

      List<Map<String, dynamic>> logs = [];
      int fbToday = 0;
      int vToday = 0;
      final today = DateTime.now();

      for (var v in vData) {
        final t = DateTime.parse(v['created_at']);
        logs.add({
          'action_type': '🎙️ Viva Completed',
          'desc': 'Score: ${v['score'] ?? 0}%',
          't': t,
        });
        if (t.year == today.year &&
            t.month == today.month &&
            t.day == today.day)
          vToday++;
      }

      for (var s in sData) {
        final t = DateTime.parse(s['start_time']);
        logs.add({
          'action_type':
              '📅 ${s['completed'] == true ? 'Finished' : 'Started'}: ${s['title']}',
          'desc': '${s['category'] ?? 'Study'}',
          't': t,
        });
        if (s['completed'] == true &&
            t.year == today.year &&
            t.month == today.month &&
            t.day == today.day)
          fbToday++;
      }

      logs.sort((a, b) => (b['t'] as DateTime).compareTo(a['t'] as DateTime));
      final recentLogs = logs.take(3).toList();

      if (mounted) {
        setState(() {
          _profile = prof;
          _courses = cData;
          _recentLogs = recentLogs;
          _streak = streak;
          _syllabusProgress = syllabusProgress;
          _avgScore = avgScore;
          _focusHours = focusHours;
          _daysToExam = daysToExam;
          _examTitle = examTitle;
          _focusBlocksToday = fbToday;
          _vivasToday = vToday;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Colors.black, strokeWidth: 4),
      );
    }
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildHeader(),
            const SizedBox(height: 24),
            _buildStatsGrid(),
            const SizedBox(height: 24),
            _buildDecayRadar(),
            const SizedBox(height: 24),
            _buildNextExam(),
            const SizedBox(height: 24),
            _buildActivityLog(),
            const SizedBox(height: 24),
            _buildBounties(),
            const SizedBox(height: 24),
            _buildTrainingCamp(),
            const SizedBox(height: 32),
            _buildArsenal(),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    final level = _profile?['level'] ?? 1;
    final name = _profile?['full_name'] ?? 'The';
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.black, width: 8),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(8, 8))],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    color: const Color(0xFFFFD43B),
                    child: Text(
                      'CHAPTER $level: $name\'S PARTY'.toUpperCase(),
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        color: Colors.black,
                      ),
                    ),
                  ),
                ),
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const ProfileScreen())),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: Colors.black, width: 3),
                        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(3, 3))],
                      ),
                      child: const Icon(Icons.person, color: Colors.black, size: 24),
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const SettingsScreen())),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFF3D00),
                        border: Border.all(color: Colors.black, width: 3),
                        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(3, 3))],
                      ),
                      child: const Icon(Icons.settings, color: Colors.white, size: 24),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            'OVERVIEW',
            style: TextStyle(
              fontSize: 48,
              fontWeight: FontWeight.w900,
              height: 1.0,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF9C4),
              border: Border.all(color: Colors.black, width: 4),
            ),
            child: const Text(
              '"Welcome back to the battlefield. The situation is dire, you are currently in PANIC MODE."',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontStyle: FontStyle.italic,
                fontSize: 16,
              ),
            ),
          ),
          const SizedBox(height: 16),
          BrutalistButton(text: 'START FOCUS BLOCK', onPressed: () {}),
        ],
      ),
    );
  }

  Widget _buildStatsGrid() {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        _buildStatCard(
          'STUDY STREAK',
          '$_streak DAYS',
          Icons.local_fire_department,
          const Color(0xFF90CAF9),
        ),
        _buildStatCard(
          'SYLLABUS',
          '$_syllabusProgress%',
          Icons.my_location,
          Colors.white,
        ),
        _buildStatCard(
          'AVG SCORE',
          _avgScore,
          Icons.psychology,
          const Color(0xFFFFFAAB1),
        ),
        _buildStatCard(
          'FOCUS HRS',
          '$_focusHours H',
          Icons.schedule,
          Colors.white,
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String val, IconData icon, Color bg) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bg,
        border: Border.all(color: Colors.black, width: 4),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 14,
                  ),
                ),
              ),
              Icon(icon, size: 24, color: Colors.black),
            ],
          ),
          const Spacer(),
          Text(
            val,
            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 26),
          ),
        ],
      ),
    );
  }

  Widget _buildDecayRadar() {
    final atRisk = _courses.take(2).toList();
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.black, width: 8),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(8, 8))],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'DECAY RADAR',
                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 24),
              ),
              Container(
                color: Colors.black,
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                child: Text(
                  '${atRisk.length} AT RISK!',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
          const Divider(color: Colors.black, thickness: 4, height: 24),
          if (atRisk.isEmpty)
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Center(
                child: Text(
                  'No topics decaying. Safe!',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            )
          else
            ...atRisk.map(
              (c) => Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: Colors.black, width: 4),
                  boxShadow: const [
                    BoxShadow(color: Colors.black, offset: Offset(4, 4)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      c['title'].toString().toUpperCase(),
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: 8),
                    BrutalistButton(
                      text: "REVIEW NOW!",
                      onPressed: () {},
                      backgroundColor: Colors.grey,
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildNextExam() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFFFFD43B),
        border: Border.all(color: Colors.black, width: 4),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(8, 8))],
      ),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: Colors.black, width: 4),
        ),
        child: Column(
          children: [
            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.bolt, color: Colors.orange, size: 36),
                Text(
                  'NEXT EXAM',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 24),
                ),
              ],
            ),
            const Divider(color: Colors.black, thickness: 4, height: 24),
            Text(
              _daysToExam >= 0 ? '$_daysToExam' : 'NO',
              style: const TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 64,
                height: 1.0,
              ),
            ),
            Text(
              _daysToExam >= 0 ? 'DAYS' : 'EXAM',
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 24),
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              color: Colors.black,
              padding: const EdgeInsets.all(8),
              child: Text(
                _examTitle.toUpperCase(),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityLog() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFB4A0FF),
        border: Border.all(color: Colors.black, width: 8),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(6, 6))],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(
                left: BorderSide(color: Colors.black, width: 4),
                top: BorderSide(color: Colors.black, width: 4),
              ),
            ),
            child: const Text(
              'ACTIVITY LOG',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20),
            ),
          ),
          const SizedBox(height: 16),
          Container(
            decoration: BoxDecoration(
              border: Border.all(color: Colors.black, width: 4),
              color: Colors.white,
            ),
            padding: const EdgeInsets.all(12),
            child: _recentLogs.isEmpty
                ? const Text(
                    'No recent activity.',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontStyle: FontStyle.italic,
                    ),
                  )
                : Column(
                    children: _recentLogs
                        .map(
                          (log) => Padding(
                            padding: const EdgeInsets.only(bottom: 12.0),
                            child: Row(
                              children: [
                                Container(
                                  width: 32,
                                  height: 32,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFFD43B),
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: Colors.black,
                                      width: 3,
                                    ),
                                  ),
                                  alignment: Alignment.center,
                                  child: const Text(
                                    'V',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w900,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        log['action_type'],
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w900,
                                          fontSize: 14,
                                        ),
                                      ),
                                      Text(
                                        '${log['desc']} • ${timeago.format(log['t'])}',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12,
                                          color: Colors.black54,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                        .toList(),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildBounties() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF90CAF9),
        border: Border.all(color: Colors.black, width: 8),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(8, 8))],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(8),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.sports_martial_arts, size: 28),
                SizedBox(width: 8),
                Text(
                  'DAILY BOUNTIES',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20),
                ),
              ],
            ),
          ),
          const Divider(color: Colors.black, thickness: 4, height: 24),
          _buildBountyTile(
            _focusBlocksToday >= 2
                ? 'Completed 2 Focus Blocks'
                : 'Complete 2 Focus Blocks ($_focusBlocksToday/2)',
            '50 EXP',
            _focusBlocksToday >= 2,
          ),
          const SizedBox(height: 12),
          _buildBountyTile(
            _vivasToday >= 1 ? 'Cleared 1 Oral Viva' : 'Clear 1 Oral Viva',
            'UNLOCK CH.5',
            _vivasToday >= 1,
          ),
          const SizedBox(height: 16),
          BrutalistButton(text: "CLAIM REWARDS!", onPressed: () {}),
        ],
      ),
    );
  }

  Widget _buildBountyTile(String title, String reward, bool done) {
    return Container(
      decoration: BoxDecoration(
        color: done ? Colors.grey[300] : Colors.white,
        border: Border.all(color: Colors.black, width: 4),
        boxShadow: done
            ? []
            : const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
      ),
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: done ? const Color(0xFFFFD43B) : Colors.white,
              border: Border.all(color: Colors.black, width: 3),
            ),
            child: done
                ? const Icon(Icons.check, size: 16, color: Colors.black)
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title.toUpperCase(),
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 14,
                decoration: done ? TextDecoration.lineThrough : null,
              ),
            ),
          ),
          Container(
            color: Colors.black,
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            child: Text(
              reward,
              style: const TextStyle(
                color: const Color(0xFFFFD43B),
                fontWeight: FontWeight.w900,
                fontSize: 10,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrainingCamp() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFFAF9F6),
        border: Border.all(color: Colors.black, width: 8),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(8, 8))],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.emoji_events, size: 28),
                  SizedBox(width: 8),
                  Text(
                    'TRAINING CAMP',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20),
                  ),
                ],
              ),
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF90CAF9),
                  border: Border.all(color: Colors.black, width: 3),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                child: const Text(
                  'ACTIVE',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12),
                ),
              ),
            ],
          ),
          const Divider(color: Colors.black, thickness: 4, height: 24),
          Row(
            children: [
              Expanded(
                child: _buildTrainingTile(
                  'AI MOCK VIVA',
                  'Interrogation',
                  Icons.mic,
                  const Color(0xFFFFD43B),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildTrainingTile(
                  'ADD GRIMOIRE',
                  'Upload PDF',
                  Icons.cloud_upload,
                  const Color(0xFFB4A0FF),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.black,
              border: Border.all(color: Colors.black, width: 4),
              boxShadow: const [
                BoxShadow(color: Color(0xFFFFD43B), offset: Offset(4, 4)),
              ],
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.play_circle_filled, color: Colors.white, size: 28),
                SizedBox(width: 12),
                Text(
                  'ENTER HYPERBOLIC',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrainingTile(
    String title,
    String sub,
    IconData icon,
    Color iconColor,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.black, width: 4),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
      ),
      child: Column(
        children: [
          Icon(icon, size: 36, color: iconColor),
          const SizedBox(height: 8),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
          ),
          const SizedBox(height: 4),
          const Divider(color: Colors.black, thickness: 2),
          Text(
            sub,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 10,
              color: Colors.black54,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildArsenal() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          color: Colors.black,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          child: const Text(
            'CURRENT ARSENAL',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w900,
              fontSize: 24,
            ),
          ),
        ),
        const SizedBox(height: 16),
        if (_courses.isEmpty)
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.grey[200],
              border: Border.all(color: Colors.grey, width: 4),
            ),
            child: const Center(
              child: Text(
                'No Courses Added Yet. Upload in Training Camp!',
                textAlign: TextAlign.center,
                style: TextStyle(fontWeight: FontWeight.w900),
              ),
            ),
          )
        else
          ..._courses.map((c) {
            final total = c['total_chapters'] ?? 10;
            final comp = c['completed_chapters'] ?? 0;
            final pct = total > 0 ? ((comp / total) * 100).round() : 0;
            final lvl = (pct / 10).floor() > 0 ? (pct / 10).floor() : 1;

            return Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.black, width: 8),
                boxShadow: const [
                  BoxShadow(color: Colors.black, offset: Offset(6, 6)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          c['title'].toString().toUpperCase(),
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 20,
                          ),
                        ),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFD43B),
                          border: Border.all(color: Colors.black, width: 2),
                        ),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        child: Text(
                          'LVL $lvl',
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Container(
                    height: 20,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      border: Border.all(color: Colors.black, width: 4),
                    ),
                    alignment: Alignment.centerLeft,
                    child: FractionallySizedBox(
                      widthFactor: pct / 100.0,
                      child: Container(color: Colors.black),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'TRAINING EQT:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 10,
                        ),
                      ),
                      Text(
                        '$pct%',
                        style: const TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }),
      ],
    );
  }
}
