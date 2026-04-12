import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../widgets/brutalist_widgets.dart';

class Topic {
  final String id;
  final String title;
  final String status;

  Topic({required this.id, required this.title, required this.status});
}

class Unit {
  final String id;
  final String title;
  final int unitNumber;
  final List<Topic> topics;

  Unit({
    required this.id,
    required this.title,
    required this.unitNumber,
    required this.topics,
  });
}

class Course {
  final String id;
  final String title;
  final List<Unit> units;
  final int progress;
  final String status;

  Course({
    required this.id,
    required this.title,
    required this.units,
    required this.progress,
    required this.status,
  });
}

class KnowledgeTreeScreen extends StatefulWidget {
  const KnowledgeTreeScreen({super.key});

  @override
  State<KnowledgeTreeScreen> createState() => _KnowledgeTreeScreenState();
}

class _KnowledgeTreeScreenState extends State<KnowledgeTreeScreen> {
  bool _isLoading = true;
  List<Course> _courses = [];
  Set<String> _expandedNodes = {'root'};

  int _completedNodes = 0;
  String _nextUnlock = 'None';
  int _riskBranches = 0;

  @override
  void initState() {
    super.initState();
    _fetchTreeData();
  }

  Future<void> _fetchTreeData() async {
    setState(() => _isLoading = true);
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      final coursesData = await Supabase.instance.client
          .from('courses')
          .select(
            'id, title, units(id, title, unit_number, topics(id, title, status))',
          )
          .eq('user_id', user.id);

      int totalCompleted = 0;
      int totalInProgress = 0;
      int totalTopicsCount = 0;
      String possibleNextTopic = 'None';
      int atRisk = 0;

      List<Course> processedCourses = [];

      for (var c in coursesData) {
        int courseCompletedTopics = 0;
        int courseTotalTopics = 0;

        List<Unit> processedUnits = [];
        final units = c['units'] as List<dynamic>? ?? [];

        // Sort units by number
        units.sort(
          (a, b) => (a['unit_number'] ?? 0).compareTo(b['unit_number'] ?? 0),
        );

        for (var u in units) {
          List<Topic> processedTopics = [];
          final topics = u['topics'] as List<dynamic>? ?? [];

          for (var t in topics) {
            courseTotalTopics++;
            totalTopicsCount++;
            final status = t['status'] ?? 'locked';

            if (status == 'mastered') {
              courseCompletedTopics++;
              totalCompleted++;
            } else if (status == 'in-progress' ||
                status == 'learning' ||
                status == 'decaying') {
              totalInProgress++;
            }

            if (status == 'locked' && possibleNextTopic == 'None') {
              possibleNextTopic = t['title'] ?? 'Unknown Topic';
            }

            processedTopics.add(
              Topic(
                id: t['id'] ?? '',
                title: t['title'] ?? 'Untitled Topic',
                status: status,
              ),
            );
          }

          processedUnits.add(
            Unit(
              id: u['id'] ?? '',
              title: u['title'] ?? 'Untitled Unit',
              unitNumber: u['unit_number'] ?? 0,
              topics: processedTopics,
            ),
          );
        }

        final progress = courseTotalTopics == 0
            ? 0
            : ((courseCompletedTopics / courseTotalTopics) * 100).round();
        String status = 'healthy';
        if (progress < 40 && courseTotalTopics > 0) {
          status = 'at-risk';
          atRisk++;
        }

        processedCourses.add(
          Course(
            id: c['id'] ?? '',
            title: c['title'] ?? 'Untitled Course',
            units: processedUnits,
            progress: progress,
            status: status,
          ),
        );
      }

      if (mounted) {
        setState(() {
          _courses = processedCourses;
          _completedNodes = totalCompleted;
          _nextUnlock = possibleNextTopic;
          _riskBranches = atRisk;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching tree data: $e');
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _toggleNode(String id) {
    setState(() {
      if (_expandedNodes.contains(id)) {
        _expandedNodes.remove(id);
      } else {
        _expandedNodes.add(id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildHeader(),
            const SizedBox(height: 24),
            _buildStatGrid(),
            const SizedBox(height: 24),
            if (_isLoading)
              const Center(
                child: CircularProgressIndicator(
                  color: Colors.black,
                  strokeWidth: 4,
                ),
              )
            else ...[
              _buildSubjectsList(),
              const SizedBox(height: 24),
              _buildTreeArea(),
            ],
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
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
            children: [
              const Icon(Icons.account_tree, size: 36, color: Colors.black),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'KNOWLEDGE TREE',
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w900,
                    height: 1.1,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            'Dynamic view of your curriculum syllabus and progress.',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: Colors.black54,
            ),
          ),
          const SizedBox(height: 16),
          BrutalistButton(
            text: 'SYNC DATABASE',
            onPressed: () => _fetchTreeData(),
            backgroundColor: const Color(0xFFB4A0FF),
          ),
        ],
      ),
    );
  }

  Widget _buildStatGrid() {
    return GridView.count(
      crossAxisCount: 3,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        _buildStatCard('COMPLETED', '$_completedNodes', Colors.white),
        _buildStatCard(
          'NEXT UNLOCK',
          _nextUnlock,
          Colors.white,
          isSmallVal: true,
        ),
        _buildStatCard(
          'AT RISK',
          '$_riskBranches',
          _riskBranches > 0 ? const Color(0xFFFFD43B) : const Color(0xFF90CAF9),
        ),
      ],
    );
  }

  Widget _buildStatCard(
    String title,
    String val,
    Color bg, {
    bool isSmallVal = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: bg,
        border: Border.all(color: Colors.black, width: 4),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.w900,
              fontSize: 10,
              color: Colors.black54,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            val.toUpperCase(),
            style: TextStyle(
              fontWeight: FontWeight.w900,
              fontSize: isSmallVal ? 14 : 26,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildSubjectsList() {
    if (_courses.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.grey[200],
          border: Border.all(color: Colors.grey, width: 4),
        ),
        child: const Center(
          child: Text(
            'No subjects found in database.',
            style: TextStyle(fontWeight: FontWeight.w900),
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          color: Colors.black,
          child: const Text(
            'MY SUBJECTS',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w900,
              fontSize: 20,
            ),
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 140,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _courses.length,
            separatorBuilder: (context, index) => const SizedBox(width: 16),
            itemBuilder: (context, index) {
              final c = _courses[index];
              return Container(
                width: 200,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: c.status == 'at-risk'
                      ? const Color(0xFFFF3D00)
                      : Colors.white,
                  border: Border.all(color: Colors.black, width: 6),
                  boxShadow: const [
                    BoxShadow(color: Colors.black, offset: Offset(6, 6)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      c.title.toUpperCase(),
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 16,
                        color: c.status == 'at-risk'
                            ? Colors.white
                            : Colors.black,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const Spacer(),
                    Text(
                      '${c.progress}%',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 28,
                        color: c.status == 'at-risk'
                            ? Colors.white
                            : Colors.black,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      height: 10,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        border: Border.all(color: Colors.black, width: 2),
                      ),
                      child: FractionallySizedBox(
                        alignment: Alignment.centerLeft,
                        widthFactor: c.progress / 100.0,
                        child: Container(
                          color: c.status == 'at-risk'
                              ? Colors.black
                              : const Color(0xFFB4A0FF),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildTreeArea() {
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
          GestureDetector(
            onTap: () => _toggleNode('root'),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.black,
                border: Border.all(color: Colors.black, width: 4),
                boxShadow: const [
                  BoxShadow(color: Color(0xFFFFD43B), offset: Offset(4, 4)),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.account_tree,
                    color: Color(0xFFFFD43B),
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'SUBJECTS MATRIX',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Icon(
                    _expandedNodes.contains('root')
                        ? Icons.keyboard_arrow_down
                        : Icons.keyboard_arrow_right,
                    color: Colors.white,
                  ),
                ],
              ),
            ),
          ),
          if (_expandedNodes.contains('root') && _courses.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(left: 24.0, top: 16.0),
              child: Stack(
                children: [
                  Positioned(
                    left: -20,
                    top: 0,
                    bottom: 0,
                    child: Container(width: 4, color: Colors.black),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: _courses.map((c) => _buildCourseNode(c)).toList(),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCourseNode(Course course) {
    final isExpanded = _expandedNodes.contains(course.id);
    return Padding(
      padding: const EdgeInsets.only(bottom: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            clipBehavior: Clip.none,
            alignment: Alignment.centerLeft,
            children: [
              Positioned(
                left: -20,
                child: Container(width: 20, height: 4, color: Colors.black),
              ),
              GestureDetector(
                onTap: () => _toggleNode(course.id),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: Colors.black, width: 4),
                    boxShadow: const [
                      BoxShadow(color: Colors.black, offset: Offset(4, 4)),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.folder,
                        color: course.status == 'at-risk'
                            ? const Color(0xFFFF3D00)
                            : Colors.black,
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          course.title.toUpperCase(),
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 14,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 4,
                          vertical: 2,
                        ),
                        color: Colors.black,
                        child: Text(
                          '${course.progress}%',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            fontSize: 10,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Icon(
                        isExpanded
                            ? Icons.keyboard_arrow_down
                            : Icons.keyboard_arrow_right,
                        size: 20,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          if (isExpanded)
            Padding(
              padding: const EdgeInsets.only(left: 32.0, top: 16.0),
              child: course.units.isEmpty
                  ? Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        border: Border.all(color: Colors.black, width: 2),
                      ),
                      child: const Text(
                        'NO UNITS',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 12,
                          color: Colors.grey,
                        ),
                      ),
                    )
                  : Stack(
                      children: [
                        Positioned(
                          left: -20,
                          top: 0,
                          bottom: 0,
                          child: CustomPaint(
                            size: const Size(4, double.infinity),
                            painter: DashedLinePainter(),
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: course.units
                              .map((u) => _buildUnitNode(u))
                              .toList(),
                        ),
                      ],
                    ),
            ),
        ],
      ),
    );
  }

  Widget _buildUnitNode(Unit unit) {
    final isExpanded = _expandedNodes.contains(unit.id);
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            clipBehavior: Clip.none,
            alignment: Alignment.centerLeft,
            children: [
              Positioned(
                left: -20,
                child: CustomPaint(
                  size: const Size(20, 4),
                  painter: DashedLineHorizontalPainter(),
                ),
              ),
              GestureDetector(
                onTap: () => _toggleNode(unit.id),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF3CD),
                    border: Border.all(color: Colors.black, width: 3),
                    boxShadow: const [
                      BoxShadow(color: Colors.black, offset: Offset(3, 3)),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.menu_book, size: 18),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          'UNIT ${unit.unitNumber}: ${unit.title}'
                              .toUpperCase(),
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 12,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Icon(
                        isExpanded
                            ? Icons.keyboard_arrow_down
                            : Icons.keyboard_arrow_right,
                        size: 18,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          if (isExpanded)
            Padding(
              padding: const EdgeInsets.only(left: 32.0, top: 12.0),
              child: unit.topics.isEmpty
                  ? Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        border: Border.all(color: Colors.grey, width: 2),
                      ),
                      child: const Text(
                        'EMPTY UNIT',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 10,
                          color: Colors.grey,
                        ),
                      ),
                    )
                  : Stack(
                      children: [
                        Positioned(
                          left: -20,
                          top: 0,
                          bottom: 0,
                          child: CustomPaint(
                            size: const Size(4, double.infinity),
                            painter: DashedLinePainter(),
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: unit.topics
                              .map((t) => _buildTopicNode(t))
                              .toList(),
                        ),
                      ],
                    ),
            ),
        ],
      ),
    );
  }

  Widget _buildTopicNode(Topic topic) {
    Color bg = Colors.grey[200]!;
    IconData icon = Icons.lock;
    Color iconColor = Colors.grey[600]!;
    double opacity = 0.7;

    if (topic.status == 'mastered') {
      bg = const Color(0xFFB4A0FF);
      icon = Icons.check_circle;
      iconColor = Colors.black;
      opacity = 1.0;
    } else if (topic.status == 'in-progress' ||
        topic.status == 'learning' ||
        topic.status == 'decaying') {
      bg = const Color(0xFF90CAF9);
      icon = Icons.radio_button_unchecked;
      iconColor = Colors.black;
      opacity = 1.0;
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.centerLeft,
        children: [
          Positioned(
            left: -20,
            child: CustomPaint(
              size: const Size(20, 2),
              painter: DashedLineHorizontalPainter(),
            ),
          ),
          Opacity(
            opacity: opacity,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: bg,
                border: Border.all(color: Colors.black, width: 3),
                boxShadow: opacity == 1.0
                    ? const [
                        BoxShadow(color: Colors.black, offset: Offset(2, 2)),
                      ]
                    : null,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(icon, size: 16, color: iconColor),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      topic.title.toUpperCase(),
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 11,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class DashedLinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    double dashHeight = 5, dashSpace = 3, startY = 0;
    final paint = Paint()
      ..color = Colors.black.withOpacity(0.5)
      ..strokeWidth = 2;
    while (startY < size.height) {
      canvas.drawLine(
        Offset(size.width / 2, startY),
        Offset(size.width / 2, startY + dashHeight),
        paint,
      );
      startY += dashHeight + dashSpace;
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}

class DashedLineHorizontalPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    double dashWidth = 5, dashSpace = 3, startX = 0;
    final paint = Paint()
      ..color = Colors.black.withOpacity(0.5)
      ..strokeWidth = 2;
    while (startX < size.width) {
      canvas.drawLine(
        Offset(startX, size.height / 2),
        Offset(startX + dashWidth, size.height / 2),
        paint,
      );
      startX += dashWidth + dashSpace;
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
