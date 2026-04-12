import 'package:flutter/material.dart';
import '../widgets/brutalist_widgets.dart';
import '../theme/brutalist_theme.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isLoading = false;
  String? _error;

  void _handleLogin() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    // TODO: Connect Supabase
    await Future.delayed(const Duration(seconds: 2));

    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      setState(() {
        _error = "Login failed. Please check your credentials.";
        _isLoading = false;
      });
      return;
    }

    setState(() => _isLoading = false);
    // Navigate to dashboard Route
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BrutalistTheme.background,
      body: SafeArea(
        child: Stack(
          children: [
            // Ambient dotted background simulation
            Positioned.fill(
              child: Opacity(
                opacity: 0.05,
                child: CustomPaint(
                  painter: GridPainter(),
                ),
              ),
            ),
            Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Header Area
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: BrutalistTheme.primary,
                        border: Border.all(color: Colors.black, width: 4),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(Icons.hub_outlined, color: Colors.black, size: 28),
                          SizedBox(width: 12),
                          Text(
                            "NEUROCANOPY",
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -1,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 48),

                    // Login Card
                    BrutalistCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Container(
                            decoration: const BoxDecoration(
                              border: Border(bottom: BorderSide(color: Colors.black, width: 4)),
                            ),
                            padding: const EdgeInsets.only(bottom: 20),
                            margin: const EdgeInsets.only(bottom: 24),
                            child: const Text(
                              "LOG IN",
                              style: TextStyle(
                                fontSize: 36,
                                fontWeight: FontWeight.w900,
                                letterSpacing: -1,
                              ),
                            ),
                          ),
                          if (_error != null)
                            Container(
                              padding: const EdgeInsets.all(16),
                              margin: const EdgeInsets.only(bottom: 24),
                              decoration: BoxDecoration(
                                color: Colors.red[100],
                                border: const Border(left: BorderSide(color: Colors.red, width: 6)),
                              ),
                              child: Text(
                                _error!,
                                style: TextStyle(color: Colors.red[900], fontWeight: FontWeight.bold),
                              ),
                            ),
                          BrutalistTextField(
                            label: "Authorized Email",
                            hintText: "student@university.edu",
                            controller: _emailController,
                          ),
                          const SizedBox(height: 24),
                          BrutalistTextField(
                            label: "Passphrase",
                            hintText: "••••••••",
                            obscureText: true,
                            controller: _passwordController,
                          ),
                          const SizedBox(height: 32),
                          BrutalistButton(
                            text: _isLoading ? "AUTHENTICATING..." : "AUTHORIZE ACCESS",
                            onPressed: _isLoading ? () {} : _handleLogin,
                            icon: _isLoading ? Icons.hourglass_top : Icons.vpn_key_sharp,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          "NEW IN CANOPY?",
                          style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1),
                        ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () => Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(builder: (context) => const RegisterScreen()),
                          ),
                          child: const Text(
                            "INITIATE RECORD",
                            style: TextStyle(
                              decoration: TextDecoration.underline,
                              fontWeight: FontWeight.w900,
                              color: BrutalistTheme.accent,
                              fontSize: 16,
                            ),
                          ),
                        )
                      ],
                    )
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Background painter to mimic the manga dotted grain
class GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()
      ..color = Colors.black
      ..strokeWidth = 2;

    const double spacing = 24.0;
    for (double i = 0; i < size.width; i += spacing) {
      for (double j = 0; j < size.height; j += spacing) {
        canvas.drawCircle(Offset(i, j), 1.5, paint);
      }
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
