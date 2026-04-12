import 'package:flutter/material.dart';

class BrutalistTheme {
  static const Color background = Color(0xFFFAF9F6);
  static const Color foreground = Color(0xFF1A1A1A);
  static const Color primary = Color(0xFFFFD43B);
  static const Color accent = Color(0xFFFF3D00); // Red-offset from manga
  static const Color green = Color(0xFF00E676);

  static ThemeData get themeData {
    return ThemeData(
      scaffoldBackgroundColor: background,
      primaryColor: primary,
      fontFamily: 'ProximaNova', // Fallback, will use google_fonts ideally
      textTheme: const TextTheme(
        displayLarge: TextStyle(color: foreground, fontWeight: FontWeight.w900, fontSize: 32, letterSpacing: -0.5),
        bodyLarge: TextStyle(color: foreground, fontWeight: FontWeight.bold, fontSize: 16),
      ),
    );
  }
}
