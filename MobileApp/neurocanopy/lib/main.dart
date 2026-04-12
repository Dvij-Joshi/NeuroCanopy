import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'theme/brutalist_theme.dart';

void main() {
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
