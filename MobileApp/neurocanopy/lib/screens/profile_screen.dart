import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../widgets/brutalist_widgets.dart';
import 'login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = true;
  bool _isSaving = false;

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _majorController = TextEditingController();
  final TextEditingController _chronotypeController = TextEditingController();

  String? _avatarUrl;
  String _email = '';

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _majorController.dispose();
    _chronotypeController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) {
      if (mounted) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
      return;
    }
    _email = user.email ?? '';

    try {
      final response = await Supabase.instance.client
          .from('profiles')
          .select('full_name, major, chronotype, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

      if (response != null) {
        if (mounted) {
          _nameController.text = response['full_name'] ?? '';
          _majorController.text = response['major'] ?? '';
          _chronotypeController.text = response['chronotype'] ?? '';
          _avatarUrl = response['avatar_url'];
        }
      }
    } catch (e) {
      debugPrint('Error loading profile: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    try {
      await Supabase.instance.client.from('profiles').update({
        'full_name': _nameController.text,
        'major': _majorController.text,
        'chronotype': _chronotypeController.text,
      }).eq('id', user.id);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('PROFILE UPDATED!', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.black)),
            backgroundColor: Color(0xFF00E676),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      debugPrint('Error saving profile: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('ERROR: $e', style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.white)),
            backgroundColor: const Color(0xFFFF3D00),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _handleSignOut() async {
    await Supabase.instance.client.auth.signOut();
    if (mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFFFAF9F6),
        body: Center(child: CircularProgressIndicator(color: Colors.black, strokeWidth: 4)),
      );
    }

    final initials = _nameController.text.isNotEmpty
        ? _nameController.text.split(' ').map((e) => e.isNotEmpty ? e[0] : '').join('').toUpperCase()
        : _email.isNotEmpty ? _email.substring(0, 2).toUpperCase() : 'U';

    return Scaffold(
      backgroundColor: const Color(0xFFFAF9F6),
      appBar: AppBar(
        title: const Text('PROFILE', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.black, fontSize: 24)),
        backgroundColor: const Color(0xFFFFE600),
        elevation: 0,
        shape: const Border(bottom: BorderSide(color: Colors.black, width: 4)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black, size: 28),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Manage your student identity.', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.black, width: 4),
                boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(6, 6))],
              ),
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Avatar Area
                    Row(
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFE600),
                            border: Border.all(color: Colors.black, width: 4),
                            boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
                            image: _avatarUrl != null
                                ? DecorationImage(image: NetworkImage(_avatarUrl!), fit: BoxFit.cover)
                                : null,
                          ),
                          alignment: Alignment.center,
                          child: _avatarUrl == null
                              ? Text(initials, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 32))
                              : null,
                        ),
                        const SizedBox(width: 20),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('AVATAR', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                              const SizedBox(height: 8),
                              BrutalistButton(
                                text: 'EDIT',
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Avatar upload coming soon!')),
                                  );
                                },
                              ),
                            ],
                          ),
                        )
                      ],
                    ),
                    const SizedBox(height: 32),

                    // Forms
                    const Text('FULL NAME', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                    const SizedBox(height: 8),
                    BrutalistTextField(
                      controller: _nameController,
                      hintText: 'John Doe',
                    ),
                    const SizedBox(height: 24),

                    const Text('MAJOR', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                    const SizedBox(height: 8),
                    BrutalistTextField(
                      controller: _majorController,
                      hintText: 'Computer Science',
                    ),
                    const SizedBox(height: 24),

                    const Text('CHRONOTYPE', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                    const SizedBox(height: 8),
                    BrutalistTextField(
                      controller: _chronotypeController,
                      hintText: 'Night Owl / Early Bird',
                    ),
                    const SizedBox(height: 32),

                    SizedBox(
                      width: double.infinity,
                      child: BrutalistButton(
                        text: _isSaving ? 'SAVING...' : 'SAVE PROFILE',
                        backgroundColor: const Color(0xFF00E676),
                        onPressed: _isSaving ? () {} : _saveProfile,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: BrutalistButton(
                text: 'SIGN OUT',
                backgroundColor: const Color(0xFFFF3D00),
                onPressed: _handleSignOut,
                icon: Icons.logout,
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

class BrutalistTextField extends StatelessWidget {
  final TextEditingController controller;
  final String hintText;

  const BrutalistTextField({
    super.key,
    required this.controller,
    required this.hintText,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.black, width: 4),
        boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
      ),
      child: TextFormField(
        controller: controller,
        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        decoration: InputDecoration(
          hintText: hintText,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          border: InputBorder.none,
        ),
      ),
    );
  }
}
