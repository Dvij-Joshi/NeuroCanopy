import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/login_screen.dart';
import 'theme/brutalist_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'https://rbeithbyebylkpuqtfdq.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWl0aGJ5ZWJ5bGtwdXF0ZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDI4ODAsImV4cCI6MjA4NzAxODg4MH0.UIxmoKiWxiU97jiu710LC9mMAHSzbyzo01JeG8Ho5l0',
  );

  runApp(const NeuroCanopyApp());
}

class NeuroCanopyApp extends StatelessWidget {
  const NeuroCanopyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NeuroCanopy',
      theme: BrutalistTheme.themeData,
      debugShowCheckedModeBanner: false,
      home: const LoginScreen(),
    );
  }
}
