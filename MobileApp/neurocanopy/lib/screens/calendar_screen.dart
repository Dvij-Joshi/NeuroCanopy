import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';
import '../widgets/brutalist_widgets.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  DateTime _currentMonth = DateTime.now();
  DateTime _selectedDate = DateTime.now();

  List<Map<String, dynamic>> _events = [];
  Set<String> _monthlyEventDates = {};
  bool _loading = false;
  bool _generating = false;

  @override
  void initState() {
    super.initState();
    _fetchEventsForMonth(_currentMonth);
    _fetchEventsForDate(_selectedDate);
  }

  String _localDateStr(DateTime d) {
    return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
  }

  Future<void> _fetchEventsForMonth(DateTime month) async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      final startOfMonth = DateTime(
        month.year,
        month.month,
        1,
      ).toUtc().toIso8601String();
      final endOfMonth = DateTime(
        month.year,
        month.month + 1,
        0,
        23,
        59,
        59,
        999,
      ).toUtc().toIso8601String();

      final data = await Supabase.instance.client
          .from('schedule_events')
          .select('start_time')
          .eq('user_id', user.id)
          .gte('start_time', startOfMonth)
          .lte('start_time', endOfMonth);

      Set<String> dates = {};
      for (var row in data) {
        final utcTime = DateTime.parse(row['start_time']).toLocal();
        dates.add(_localDateStr(utcTime));
      }

      if (mounted) {
        setState(() {
          _monthlyEventDates = dates;
        });
      }
    } catch (e) {
      debugPrint('Error fetching month events: $e');
    }
  }

  Future<void> _fetchEventsForDate(DateTime date) async {
    setState(() => _loading = true);
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) {
        if (mounted) setState(() => _loading = false);
        return;
      }

      final startOfDay = DateTime(
        date.year,
        date.month,
        date.day,
        0,
        0,
        0,
      ).toUtc().toIso8601String();
      final endOfDay = DateTime(
        date.year,
        date.month,
        date.day,
        23,
        59,
        59,
        999,
      ).toUtc().toIso8601String();

      final data = await Supabase.instance.client
          .from('schedule_events')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_time', startOfDay)
          .lte('start_time', endOfDay)
          .order('start_time', ascending: true);

      if (mounted) {
        setState(() {
          _events = List<Map<String, dynamic>>.from(data);
          _loading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching day events: $e');
      if (mounted) setState(() => _loading = false);
    }
  }

  void _handleDateClick(int dayNumber) {
    if (!mounted) return;
    final newDate = DateTime(
      _currentMonth.year,
      _currentMonth.month,
      dayNumber,
    );
    setState(() {
      _selectedDate = newDate;
    });
    _fetchEventsForDate(newDate);
  }

  void _nextMonth() {
    setState(() {
      _currentMonth = DateTime(_currentMonth.year, _currentMonth.month + 1, 1);
    });
    _fetchEventsForMonth(_currentMonth);
  }

  void _prevMonth() {
    setState(() {
      _currentMonth = DateTime(_currentMonth.year, _currentMonth.month - 1, 1);
    });
    _fetchEventsForMonth(_currentMonth);
  }

  Future<void> _handleClear() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.red[500],
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: Colors.black, width: 4),
          borderRadius: BorderRadius.zero,
        ),
        title: const Text(
          'WIPE SCHEDULE?',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900),
        ),
        content: const Text(
          'This will destroy your entire timeline. Pure slate.',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        actions: [
          BrutalistButton(
            text: 'CANCEL',
            onPressed: () => Navigator.pop(ctx, false),
            backgroundColor: Colors.white,
          ),
          BrutalistButton(
            text: 'DESTROY',
            onPressed: () => Navigator.pop(ctx, true),
            backgroundColor: Colors.black,
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _generating = true);
    try {
      await Supabase.instance.client
          .from('schedule_events')
          .delete()
          .eq('user_id', user.id);
      if (mounted) {
        setState(() {
          _events = [];
          _monthlyEventDates.clear();
        });
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'TIMELINE OBLITERATED',
              style: TextStyle(fontWeight: FontWeight.w900),
            ),
            backgroundColor: Colors.black,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'ANOMALY DETECTED: $e',
              style: TextStyle(fontWeight: FontWeight.w900),
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _generating = false);
    }
  }

  void _handleGenerateFallback() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'GENERATOR ONLY AVAILABLE ON WEB DECK FOR NOW.',
          style: TextStyle(fontWeight: FontWeight.w900, color: Colors.black),
        ),
        backgroundColor: Color(0xFFFFD43B),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  IconData _getCategoryIcon(String? cat) {
    switch (cat) {
      case 'FOCUS':
        return Icons.menu_book;
      case 'VIVA':
        return Icons.bolt;
      case 'BREAK':
        return Icons.local_cafe;
      case 'ADMIN':
        return Icons.schedule;
      case 'ROUTINE':
        return Icons.local_cafe;
      case 'LEISURE':
        return Icons.dark_mode;
      default:
        return Icons.schedule;
    }
  }

  @override
  Widget build(BuildContext context) {
    final monthName = DateFormat(
      'MMMM yyyy',
    ).format(_currentMonth).toUpperCase();
    final selectedDateStr = DateFormat(
      'MMM d',
    ).format(_selectedDate).toUpperCase();

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildHeader(monthName),
            const SizedBox(height: 24),
            _buildCalendarGrid(),
            const SizedBox(height: 24),
            _buildEventsList(selectedDateStr),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(String monthName) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Row(
          children: [
            Icon(Icons.calendar_month, size: 36, color: Colors.black),
            SizedBox(width: 12),
            Expanded(
              child: Text(
                'QUANTUM SCHEDULER',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  height: 1.1,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          '$monthName // REAL-TIME DB SYNC',
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 12,
            color: Colors.black54,
          ),
        ),
        const SizedBox(height: 16),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              BrutalistButton(
                text: 'X',
                onPressed: _generating ? () {} : () => _handleClear(),
                backgroundColor: Colors.red[500]!,
              ),
              const SizedBox(width: 12),
              BrutalistButton(
                text: _generating ? 'MAPPING...' : 'GENERATE',
                onPressed: _generating
                    ? () {}
                    : () => _handleGenerateFallback(),
                backgroundColor: const Color(0xFFFFD43B),
              ),
              const SizedBox(width: 12),
              BrutalistButton(
                text: '<',
                onPressed: () => _prevMonth(),
                backgroundColor: Colors.white,
              ),
              const SizedBox(width: 8),
              BrutalistButton(
                text: '>',
                onPressed: () => _nextMonth(),
                backgroundColor: Colors.white,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCalendarGrid() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.black, width: 4),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8),
            decoration: const BoxDecoration(
              color: Color(0xFF90CAF9),
              border: Border(bottom: BorderSide(color: Colors.black, width: 4)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((
                day,
              ) {
                return Text(
                  day,
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 12,
                  ),
                );
              }).toList(),
            ),
          ),
          _buildDays(),
        ],
      ),
    );
  }

  Widget _buildDays() {
    final daysInMonth = DateTime(
      _currentMonth.year,
      _currentMonth.month + 1,
      0,
    ).day;
    final firstDayOfMonth = DateTime(
      _currentMonth.year,
      _currentMonth.month,
      1,
    ).weekday;
    // Dart uses 1=Mon, 7=Sun. Modifying to standard 0=Sun, 6=Sat
    final startOffset = firstDayOfMonth == 7 ? 0 : firstDayOfMonth;

    final totalCells = ((daysInMonth + startOffset) / 7).ceil() * 7;

    return Container(
      color: Colors.black, // acts as border gaps for the grid
      padding: const EdgeInsets.all(2), // thin outer border inside the box
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 7,
          mainAxisSpacing: 2,
          crossAxisSpacing: 2,
          childAspectRatio: 0.8,
        ),
        itemCount: totalCells,
        itemBuilder: (context, index) {
          final dayNumber = index - startOffset + 1;
          final isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;

          bool isSelected = false;
          if (isCurrentMonth) {
            isSelected =
                _selectedDate.day == dayNumber &&
                _selectedDate.month == _currentMonth.month &&
                _selectedDate.year == _currentMonth.year;
          }

          DateTime cellDate = DateTime(
            _currentMonth.year,
            _currentMonth.month,
            dayNumber,
          );
          final hasEvents =
              isCurrentMonth &&
              _monthlyEventDates.contains(_localDateStr(cellDate));

          Color bgColor = isCurrentMonth ? Colors.white : Colors.grey[200]!;
          if (isSelected) bgColor = const Color(0xFFFFF9C4); // light yellow

          return GestureDetector(
            onTap: isCurrentMonth ? () => _handleDateClick(dayNumber) : null,
            child: Container(
              color: bgColor,
              padding: const EdgeInsets.all(4),
              child: Stack(
                children: [
                  if (isCurrentMonth)
                    Text(
                      '$dayNumber',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 16,
                        color: isSelected
                            ? const Color(0xFFFF3D00)
                            : Colors.black,
                      ),
                    ),
                  if (hasEvents)
                    const Positioned(
                      bottom: 0,
                      left: 0,
                      child: Row(
                        children: [
                          Icon(
                            Icons.stop,
                            color: Colors.red,
                            size: 10,
                          ), // square-ish
                          Icon(
                            Icons.circle,
                            color: Color(0xFFFFD43B),
                            size: 10,
                          ), // round
                        ],
                      ),
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildEventsList(String selectedDateStr) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.black, width: 4),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Colors.black, width: 4)),
            ),
            child: Text(
              selectedDateStr,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: _loading
                ? const SizedBox(
                    height: 100,
                    child: Center(
                      child: Text(
                        'LOADING...',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                  )
                : _events.isEmpty
                ? const SizedBox(
                    height: 100,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.dark_mode, size: 36, color: Colors.grey),
                          SizedBox(height: 8),
                          Text(
                            'NO EVENTS',
                            style: TextStyle(
                              fontWeight: FontWeight.w900,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                : Column(
                    children: _events.map((e) => _buildEventItem(e)).toList(),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildEventItem(Map<String, dynamic> event) {
    final IconData icon = _getCategoryIcon(event['category']);
    final isFocus = event['category'] == 'FOCUS';
    final completed = event['completed'] == true;
    final timeStr = DateFormat(
      'hh:mm a',
    ).format(DateTime.parse(event['start_time']).toLocal());

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isFocus ? const Color(0xFFFFD43B) : Colors.white,
        border: Border.all(color: Colors.black, width: 2),
        boxShadow: completed
            ? []
            : const [BoxShadow(color: Colors.black, offset: Offset(2, 2))],
      ),
      foregroundDecoration: completed
          ? BoxDecoration(color: Colors.white.withValues(alpha: 0.5))
          : null,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            width: 70,
            child: Text(
              timeStr,
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(icon, size: 16),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        event['title'] ?? 'Unknown Event',
                        style: const TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 14,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Wrap(
                  spacing: 4,
                  children: [
                    Text(
                      event['category'] ?? '',
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        color: Colors.black54,
                      ),
                    ),
                    if (completed)
                      const Text(
                        '✓ DONE',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: Colors.green,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
          if ((isFocus || event['category'] == 'VIVA') && !completed)
            GestureDetector(
              onTap: () {
                // Navigate to viva screen
                // Wait for the UI tab flow or push named route
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black,
                  border: Border.all(color: Colors.black, width: 2),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.mic, size: 12, color: Colors.white),
                    SizedBox(width: 4),
                    Text(
                      'VIVA',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else if (completed)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.green, width: 2),
              ),
              child: const Text(
                'DONE ✓',
                style: TextStyle(
                  color: Colors.green,
                  fontWeight: FontWeight.w900,
                  fontSize: 10,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
