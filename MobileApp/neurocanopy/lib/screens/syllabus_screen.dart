import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../widgets/brutalist_widgets.dart';

class MaterialItem {
  final String id;
  final String title;
  final String type;
  final String added;
  final bool parsed;
  final int topicCount;
  final String statusText;
  final bool isUploading;

  MaterialItem({
    required this.id,
    required this.title,
    required this.type,
    required this.added,
    required this.parsed,
    required this.topicCount,
    required this.statusText,
    this.isUploading = false,
  });
}

class SyllabusScreen extends StatefulWidget {
  const SyllabusScreen({super.key});

  @override
  State<SyllabusScreen> createState() => _SyllabusScreenState();
}

class _SyllabusScreenState extends State<SyllabusScreen> {
  List<MaterialItem> _materials = [];
  bool _loading = true;
  Set<String> _selectedIds = {};
  
  String _targetCourseId = 'auto';
  String _selectedNotesCourse = '';

  bool _isAddingSubject = false;

  @override
  void initState() {
    super.initState();
    _fetchCourses();
  }

  Future<void> _fetchCourses() async {
    setState(() => _loading = true);
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      final data = await Supabase.instance.client
          .from('courses')
          .select('id, title, created_at, units(id, topics(id))')
          .eq('user_id', user.id)
          .order('created_at', ascending: false);

      List<MaterialItem> formatted = [];
      for (var c in data) {
        final units = c['units'] as List<dynamic>? ?? [];
        int topicCount = 0;
        for (var u in units) {
          final topics = u['topics'] as List<dynamic>? ?? [];
          topicCount += topics.length;
        }

        DateTime dt = DateTime.now();
        if (c['created_at'] != null) {
          dt = DateTime.parse(c['created_at']);
        }

        formatted.add(MaterialItem(
          id: c['id'] ?? '',
          title: c['title'] ?? 'Untitled Course',
          type: 'DOC',
          added: '${timeago.format(dt)} ago',
          parsed: true,
          topicCount: topicCount,
          statusText: '● Active ($topicCount Topics)',
        ));
      }

      if (mounted) {
        setState(() {
          _materials = formatted;
          _loading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching courses: $e');
      if (mounted) setState(() => _loading = false);
    }
  }

  void _toggleSelect(String id) {
    setState(() {
      if (_selectedIds.contains(id)) {
        _selectedIds.remove(id);
      } else {
        _selectedIds.add(id);
      }
    });
  }

  void _toggleAll() {
    setState(() {
      if (_selectedIds.length == _materials.length && _materials.isNotEmpty) {
        _selectedIds.clear();
      } else {
        _selectedIds = _materials.map((m) => m.id).toSet();
      }
    });
  }

  Future<void> _confirmDeleteSelected() async {
    if (_selectedIds.isEmpty) return;
    final confirm = await _showDeleteDialog('Delete ${_selectedIds.length} items?');
    if (confirm == true) {
      await _executeDelete(_selectedIds.toList());
      _selectedIds.clear();
    }
  }

  Future<void> _confirmDeleteSingle(String id) async {
    final confirm = await _showDeleteDialog('Delete this subject?');
    if (confirm == true) {
      await _executeDelete([id]);
      _selectedIds.remove(id);
    }
  }

  Future<bool?> _showDeleteDialog(String title) {
    return showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.red[500],
        shape: const RoundedRectangleBorder(
          side: BorderSide(color: Colors.black, width: 4),
          borderRadius: BorderRadius.zero,
        ),
        title: const Text('WARNING', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
        content: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          BrutalistButton(text: 'CANCEL', onPressed: () => Navigator.pop(ctx, false), backgroundColor: Colors.white),
          BrutalistButton(text: 'DELETE', onPressed: () => Navigator.pop(ctx, true), backgroundColor: Colors.black),
        ],
      ),
    );
  }

  Future<void> _executeDelete(List<String> ids) async {
    try {
      // Manual deep delete for Supabase (matching React hook)
      for (var courseId in ids) {
        final units = await Supabase.instance.client.from('units').select('id').eq('course_id', courseId);
        if (units.isNotEmpty) {
          final unitIds = units.map((u) => u['id']).toList();
          await Supabase.instance.client.from('topics').delete().inFilter('unit_id', unitIds);
        }
        await Supabase.instance.client.from('units').delete().eq('course_id', courseId);
        await Supabase.instance.client.from('courses').delete().eq('id', courseId);
      }
      if (!mounted) return;
      await _fetchCourses();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Failed to delete: $e', style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.red,
      ));
    }
  }

  void _showAddSubjectModal() {
    final TextEditingController ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setDialogState) {
            return AlertDialog(
              backgroundColor: Colors.white,
              contentPadding: EdgeInsets.zero,
              shape: const RoundedRectangleBorder(
                side: BorderSide(color: Colors.black, width: 4),
                borderRadius: BorderRadius.zero,
              ),
              titlePadding: EdgeInsets.zero,
              title: Container(
                color: const Color(0xFF9B87F5),
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  border: Border(bottom: BorderSide(color: Colors.black, width: 4)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.menu_book, color: Colors.white, size: 28),
                    SizedBox(width: 12),
                    Text('ADD SUBJECT', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
                  ],
                ),
              ),
              content: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('SUBJECT TITLE', style: TextStyle(fontWeight: FontWeight.w900)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: ctrl,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(
                          borderSide: BorderSide(color: Colors.black, width: 3),
                          borderRadius: BorderRadius.zero,
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderSide: BorderSide(color: Colors.black, width: 3),
                          borderRadius: BorderRadius.zero,
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderSide: BorderSide(color: Colors.black, width: 3),
                          borderRadius: BorderRadius.zero,
                        ),
                        hintText: 'e.g. Quantum Physics 101',
                      ),
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
              actionsPadding: const EdgeInsets.all(16),
              actions: [
                BrutalistButton(
                  text: 'CANCEL', 
                  onPressed: () => Navigator.pop(ctx), 
                  backgroundColor: Colors.white
                ),
                BrutalistButton(
                  text: _isAddingSubject ? 'ADDING...' : 'ADD NOW', 
                  onPressed: _isAddingSubject ? () {} : () async {
                    if (ctrl.text.trim().isEmpty) return;
                    setDialogState(() => _isAddingSubject = true);
                    
                    try {
                      final user = Supabase.instance.client.auth.currentUser;
                      if (user != null) {
                        await Supabase.instance.client.from('courses').insert({
                          'user_id': user.id,
                          'title': ctrl.text.trim(),
                          'code': ctrl.text.trim().substring(0, ctrl.text.trim().length < 5 ? ctrl.text.trim().length : 5).toUpperCase(),
                          'total_chapters': 0,
                          'completed_chapters': 0,
                          'professor': 'Manual Entry',
                          'credits': 3,
                          'color': '#3b82f6'
                        });
                        await _fetchCourses();
                      }
                      if (mounted) Navigator.pop(ctx);
                    } catch (e) {
                      debugPrint('Add subject error: $e');
                    } finally {
                      setDialogState(() => _isAddingSubject = false);
                    }
                  }, 
                  backgroundColor: const Color(0xFFFFD43B)
                ),
              ],
            );
          }
        );
      }
    );
  }

  void _unsupportedUploadMessage() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('File uploading and automated AI parsing is optimized for the web dashboard. Please login on a PC to upload PDFs.', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.black)),
        backgroundColor: Color(0xFFFFD43B),
        behavior: SnackBarBehavior.floating,
      ),
    );
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
            _buildMaterialsList(),
            const SizedBox(height: 32),
            _buildNotesHeader(),
            const SizedBox(height: 16),
            _buildNotesList(),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Row(
          children: [
            Icon(Icons.menu_book, size: 36, color: Colors.black),
            SizedBox(width: 12),
            Expanded(
              child: Text(
                'SYLLABUS MANAGER',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, height: 1.1),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        const Text(
          'Upload materials, auto-extract and merge topics.',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black54),
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.black, width: 3),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _targetCourseId,
                  icon: const Icon(Icons.arrow_drop_down, color: Colors.black, size: 28),
                  style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                  dropdownColor: Colors.white,
                  items: [
                    const DropdownMenuItem(value: 'auto', child: Text('Auto-Detect / New Subject', style: TextStyle(fontWeight: FontWeight.w900))),
                    ..._materials.map((m) => DropdownMenuItem(value: m.id, child: Text(m.title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)))),
                  ],
                  onChanged: (v) {
                    if (v != null) setState(() => _targetCourseId = v);
                  },
                ),
              ),
            ),
            BrutalistButton(
              text: 'ADD SUBJECT',
              onPressed: _showAddSubjectModal,
              backgroundColor: Colors.white,
            ),
            BrutalistButton(
              text: 'UPLOAD FILE',
              onPressed: _unsupportedUploadMessage,
              backgroundColor: Colors.black,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildMaterialsList() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.black, width: 4),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(6, 6))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFFF3F4F6), // gray-100
              border: Border(bottom: BorderSide(color: Colors.black, width: 4)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                GestureDetector(
                  onTap: _toggleAll,
                  child: Row(
                    children: [
                      Icon(
                        _selectedIds.length == _materials.length && _materials.isNotEmpty ? Icons.check_box : Icons.check_box_outline_blank,
                        color: _selectedIds.length == _materials.length && _materials.isNotEmpty ? Colors.black : Colors.grey,
                      ),
                      const SizedBox(width: 8),
                      const Text('SELECT ALL', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                    ],
                  ),
                ),
                Row(
                  children: [
                    GestureDetector(
                      onTap: () {
                         ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Edit feature coming soon!'), backgroundColor: Colors.black));
                      },
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        color: Colors.black,
                        child: const Icon(Icons.edit, color: Colors.white, size: 20),
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: _selectedIds.isEmpty ? null : _confirmDeleteSelected,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.red[500],
                          border: Border.all(color: Colors.black, width: 2),
                          boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(2, 2))],
                        ),
                        child: Icon(Icons.delete, color: Colors.white, size: 20),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (_loading)
            const Padding(
              padding: EdgeInsets.all(32.0),
              child: Center(child: Text('LOADING...', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.grey))),
            )
          else if (_materials.isEmpty)
            const Padding(
              padding: EdgeInsets.all(32.0),
              child: Center(child: Text('NO MATERIALS FOUND', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.grey))),
            )
          else
            ..._materials.map((m) => _buildMaterialItem(m)),
          
          GestureDetector(
            onTap: _unsupportedUploadMessage,
            child: Container(
              margin: const EdgeInsets.all(20),
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: const Color(0xFFF9FAFB),
                border: Border.all(color: Colors.grey[400]!, width: 4),
              ),
              child: Column(
                children: [
                  Icon(Icons.upload_file, size: 48, color: Colors.grey[400]),
                  const SizedBox(height: 12),
                  const Text('DRAG & DROP FILES HERE', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                  const SizedBox(height: 4),
                  const Text('Supports only PDF processing over web.', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMaterialItem(MaterialItem mat) {
    final isSelected = _selectedIds.contains(mat.id);
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.black, width: 4)),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GestureDetector(
            onTap: () => _toggleSelect(mat.id),
            child: Padding(
              padding: const EdgeInsets.only(top: 4.0),
              child: Icon(
                isSelected ? Icons.check_box : Icons.check_box_outline_blank,
                color: isSelected ? Colors.black : Colors.grey,
                size: 28,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFFFFD43B),
              border: Border.all(color: Colors.black, width: 3),
            ),
            alignment: Alignment.center,
            child: Text(mat.type, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  mat.title,
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 4,
                  children: [
                    Text('ADDED ${mat.added}'.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Colors.black54)),
                    const Text('●', style: TextStyle(fontSize: 10)),
                    Text(
                      mat.statusText.toUpperCase(),
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 10, color: Colors.black),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              BrutalistButton(text: 'VIEW DATA', onPressed: () {}, backgroundColor: Colors.white),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: () => _confirmDeleteSingle(mat.id),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: Colors.black, width: 2),
                  ),
                  child: const Icon(Icons.delete, color: Colors.red, size: 20),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNotesHeader() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(
          bottom: BorderSide(color: Colors.black, width: 4),
          right: BorderSide(color: Colors.black, width: 4),
        ),
        borderRadius: BorderRadius.circular(8),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.layers, size: 36, color: Color(0xFF90CAF9)),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'RELEVANT NOTES MANAGEMENT',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, height: 1.1),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            'Upload notes to automatically extract and map to existing topics.',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black54),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: Colors.black, width: 3),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedNotesCourse.isEmpty ? null : _selectedNotesCourse,
                    hint: const Text('Select Target Subject', style: TextStyle(fontWeight: FontWeight.w900)),
                    icon: const Icon(Icons.arrow_drop_down, color: Colors.black, size: 28),
                    style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                    dropdownColor: Colors.white,
                    items: [
                      ..._materials.map((m) => DropdownMenuItem(value: m.id, child: Text(m.title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)))),
                    ],
                    onChanged: (v) {
                      if (v != null) setState(() => _selectedNotesCourse = v);
                    },
                  ),
                ),
              ),
              BrutalistButton(
                text: 'PROCESS NOTES',
                onPressed: _unsupportedUploadMessage,
                backgroundColor: const Color(0xFF9B87F5),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNotesList() {
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
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFFF3F4F6), 
              border: Border(bottom: BorderSide(color: Colors.black, width: 4)),
            ),
            child: const Text('MAPPED NOTE SEGMENTS', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
          ),
          const Padding(
            padding: EdgeInsets.all(32.0),
            child: Center(
              child: Text(
                'Select a subject and process some notes to see automated mappings here.',
                style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
