import 'package:flutter/material.dart';
import '../widgets/brutalist_widgets.dart';
import '../theme/brutalist_theme.dart';
import 'login_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  int _currentStep = 1;
  final int _totalSteps = 6;

  // Controllers for Step 1
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();

  // Controllers for Step 2
  final TextEditingController _fullNameController = TextEditingController();
  final TextEditingController _universityController = TextEditingController();
  final TextEditingController _majorController = TextEditingController();
  String _academicYear = 'Year 1';

  bool _isLoading = false;
  String? _error;

  void _nextStep() {
    setState(() => _error = null);

    if (_currentStep == 1) {
      if (_emailController.text.isEmpty || !_emailController.text.contains('@')) {
        setState(() => _error = "Please enter a valid university or personal email format.");
        return;
      }
      if (_passwordController.text != _confirmPasswordController.text) {
        setState(() => _error = "Passwords do not match");
        return;
      }
      if (_passwordController.text.length < 8) {
        setState(() => _error = "Password must be at least 8 characters for security");
        return;
      }
    }

    if (_currentStep < _totalSteps) {
      setState(() => _currentStep++);
    } else {
      _handleSubmit();
    }
  }

  void _prevStep() {
    if (_currentStep > 1) {
      setState(() {
        _currentStep--;
        _error = null;
      });
    }
  }

  void _handleSubmit() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    // TODO: Connect Supabase for final submission
    await Future.delayed(const Duration(seconds: 2));
    
    setState(() => _isLoading = false);
    // Navigate to Dashboard
  }

  String _getStepTitle() {
    switch (_currentStep) {
      case 1: return 'Account\nLogin Details';
      case 2: return 'Identity & Cognitive\nWho are you?';
      case 3: return 'Bio-Rhythms\nDaily energy cycles';
      case 4: return 'Academics\nSchedule & Exams';
      case 5: return 'Logistics\nLiving & overhead';
      case 6: return 'Materials & Lifestyle\nSyllabus & anchors';
      default: return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    // Splitting title and subtitle
    final titleParts = _getStepTitle().split('\n');
    final title = titleParts[0];
    final subtitle = titleParts.length > 1 ? titleParts[1] : '';

    return Scaffold(
      backgroundColor: BrutalistTheme.background,
      body: SafeArea(
        child: Stack(
          children: [
            Positioned.fill(
              child: Opacity(
                opacity: 0.05,
                child: CustomPaint(
                  painter: GridPainter(),
                ),
              ),
            ),
            Column(
              children: [
                // Top Progress Bar area
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  decoration: const BoxDecoration(
                    border: Border(bottom: BorderSide(color: Colors.black, width: 4)),
                    color: Colors.white,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      if (_currentStep > 1)
                        GestureDetector(
                          onTap: _prevStep,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.transparent, width: 2),
                            ),
                            child: Row(
                              children: const [
                                Icon(Icons.arrow_back, size: 20),
                                SizedBox(width: 8),
                                Text("Back", style: TextStyle(fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        )
                      else
                        const SizedBox(width: 80),
                      
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        color: Colors.black,
                        child: Text(
                          "Step 0$_currentStep / 0$_totalSteps",
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 2,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Form Area
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24.0),
                    child: BrutalistCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            title.toUpperCase(),
                            style: const TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -1,
                            ),
                          ),
                          Container(
                            margin: const EdgeInsets.only(bottom: 24, top: 8),
                            padding: const EdgeInsets.only(bottom: 16),
                            decoration: const BoxDecoration(
                              border: Border(bottom: BorderSide(color: Colors.black, width: 4)),
                            ),
                            child: Text(
                              subtitle,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey,
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

                          // Dynamic Step Content
                          _buildStepContent(),

                          const SizedBox(height: 32),

                          BrutalistButton(
                            text: _currentStep == _totalSteps && _isLoading
                                ? "INITIALIZING..."
                                : _currentStep == _totalSteps
                                    ? "COMPLETE REGISTRATION"
                                    : "CONTINUE TO NEXT PHASE",
                            onPressed: _isLoading ? () {} : _nextStep,
                            icon: _currentStep == _totalSteps ? Icons.check_circle : Icons.arrow_forward,
                          ),

                          if (_currentStep == 1) ...[
                            const SizedBox(height: 24),
                            Center(
                              child: GestureDetector(
                                onTap: () => Navigator.pushReplacement(
                                  context,
                                  MaterialPageRoute(builder: (context) => const LoginScreen()),
                                ),
                                child: const Text.rich(
                                  TextSpan(
                                    text: 'Already synced? ',
                                    style: TextStyle(fontWeight: FontWeight.bold),
                                    children: [
                                      TextSpan(
                                        text: 'Sign in',
                                        style: TextStyle(
                                          color: BrutalistTheme.accent,
                                          decoration: TextDecoration.underline,
                                          fontWeight: FontWeight.w900,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ]
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 1:
        return Column(
          children: [
            BrutalistTextField(
              label: "University Email",
              hintText: "you@university.edu",
              controller: _emailController,
            ),
            const SizedBox(height: 24),
            BrutalistTextField(
              label: "Password",
              hintText: "••••••••",
              obscureText: true,
              controller: _passwordController,
            ),
            const SizedBox(height: 24),
            BrutalistTextField(
              label: "Confirm Password",
              hintText: "••••••••",
              obscureText: true,
              controller: _confirmPasswordController,
            ),
          ],
        );
      case 2:
        return Column(
          children: [
            BrutalistTextField(
              label: "Full Name",
              hintText: "John Doe",
              controller: _fullNameController,
            ),
            const SizedBox(height: 24),
            BrutalistTextField(
              label: "University / Institution",
              hintText: "MIT",
              controller: _universityController,
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: BrutalistTextField(
                    label: "Major / Course",
                    hintText: "Computer Science",
                    controller: _majorController,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 1,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "YEAR",
                        style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 1.5),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          border: Border.all(color: Colors.black, width: 3),
                          boxShadow: const [
                            BoxShadow(color: Colors.black, offset: Offset(4, 4)),
                          ],
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _academicYear,
                            isExpanded: true,
                            style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 16),
                            items: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Masters'].map((String value) {
                              return DropdownMenuItem<String>(
                                value: value,
                                child: Text(value),
                              );
                            }).toList(),
                            onChanged: (newValue) {
                              setState(() {
                                _academicYear = newValue!;
                              });
                            },
                          ),
                        ),
                      ),
                    ],
                  ),
                )
              ],
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: BrutalistTheme.primary,
                border: Border.all(color: Colors.black, width: 3),
                boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
              ),
              child: const Text(
                "NOTE: Focus duration & chronotypes will be synced later in the dashboard.",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            )
          ],
        );
      default:
        return Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Text(
              "PLACEHOLDER FOR STEP $_currentStep\n(Will be hydrated on Supabase linking)",
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ),
        );
    }
  }
}
