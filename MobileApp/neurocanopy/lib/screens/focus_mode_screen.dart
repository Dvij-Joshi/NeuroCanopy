import 'dart:async';
import 'package:flutter/material.dart';
import '../widgets/brutalist_widgets.dart';

class FocusModeScreen extends StatefulWidget {
  const FocusModeScreen({super.key});

  @override
  State<FocusModeScreen> createState() => _FocusModeScreenState();
}

class _FocusModeScreenState extends State<FocusModeScreen> with WidgetsBindingObserver {
  static const int _blockDuration = 25 * 60; // 25 minutes
  int _remainingSeconds = _blockDuration;
  Timer? _timer;
  bool _isActive = false;
  bool _focusFailed = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_isActive && state == AppLifecycleState.paused) {
      // User minimized the app or opened another app (like Social Media)
      setState(() {
        _focusFailed = true;
        _isActive = false;
        _timer?.cancel();
      });
      _showFailureDialog();
    }
  }

  void _startFocusBlock() {
    setState(() {
      _isActive = true;
      _focusFailed = false;
      _remainingSeconds = _blockDuration;
    });

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        setState(() => _remainingSeconds--);
      } else {
        // Success
        timer.cancel();
        setState(() => _isActive = false);
        _showSuccessDialog();
      }
    });
  }

  void _giveUp() {
    setState(() {
      _isActive = false;
      _focusFailed = true;
      _timer?.cancel();
    });
    _showFailureDialog();
  }

  void _showFailureDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFFFF3D00), // Brutalist Red
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: Colors.black, width: 4),
          borderRadius: BorderRadius.circular(0),
        ),
        title: Row(
          children: const [
            Icon(Icons.warning_amber_rounded, color: Colors.white, size: 32),
            SizedBox(width: 8),
            Text('FOCUS BROKEN', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
          ],
        ),
        content: const Text(
          'You left the app during a Focus Block! Accessing social media or minimizing the app is strictly prohibited right now.',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
        ),
        actions: [
          Container(
            decoration: BoxDecoration(
              boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
            ),
            child: TextButton(
              style: TextButton.styleFrom(
                backgroundColor: Colors.white,
                side: const BorderSide(color: Colors.black, width: 3),
                shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
              ),
              onPressed: () {
                Navigator.of(ctx).pop();
                Navigator.of(context).pop(); // Send back to dashboard
              },
              child: const Text('ACCEPT PENALTY', style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900)),
            ),
          )
        ],
      ),
    );
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF00E676), // Brutalist Green
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: Colors.black, width: 4),
          borderRadius: BorderRadius.circular(0),
        ),
        title: Row(
          children: const [
            Icon(Icons.star, color: Colors.black, size: 32),
            SizedBox(width: 8),
            Text('BLOCK COMPLETE', style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900)),
          ],
        ),
        content: const Text(
          'You successfully maintained your focus without distraction. Excellent work.',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 16),
        ),
        actions: [
          Container(
            decoration: BoxDecoration(
              boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
            ),
            child: TextButton(
              style: TextButton.styleFrom(
                backgroundColor: Colors.white,
                side: const BorderSide(color: Colors.black, width: 3),
                shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
              ),
              onPressed: () {
                Navigator.of(ctx).pop();
                Navigator.of(context).pop(); 
              },
              child: const Text('COLLECT XP', style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900)),
            ),
          )
        ],
      ),
    );
  }

  String get _timeString {
    int m = _remainingSeconds ~/ 60;
    int s = _remainingSeconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    // If active, prevent going back via hardware back button
    return PopScope(
      canPop: !_isActive,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop && _isActive) {
          _giveUp();
        }
      },
      child: Scaffold(
        backgroundColor: _isActive ? const Color(0xFFFFD43B) : const Color(0xFFFAF9F6), // Yellow warning bg when active
        appBar: AppBar(
          title: const Text('FOCUS MODE', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.black, fontSize: 24)),
          backgroundColor: _isActive ? const Color(0xFFFFD43B) : const Color(0xFFFF3D00), // Red when idle
          elevation: 0,
          shape: const Border(bottom: BorderSide(color: Colors.black, width: 4)),
          leading: _isActive 
            ? const SizedBox() // Hide back button if active
            : IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.black, size: 28),
                onPressed: () => Navigator.of(context).pop(),
              ),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (_isActive) ...[
                  const Icon(Icons.lock_rounded, size: 80, color: Colors.black),
                  const SizedBox(height: 16),
                  const Text(
                    'STRICT MODE ACTIVE',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 24, letterSpacing: 2),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'DO NOT OPEN OTHER APPS',
                    style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFFF3D00), fontSize: 16),
                  ),
                ] else ...[
                  const Icon(Icons.psychology, size: 80, color: Colors.black),
                  const SizedBox(height: 16),
                  const Text(
                    'READY TO FOCUS?',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 24, letterSpacing: 2),
                  ),
                ],
                
                const SizedBox(height: 48),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: Colors.black, width: 8),
                    boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(8, 8))],
                  ),
                  child: Text(
                    _timeString,
                    style: const TextStyle(
                      fontSize: 72,
                      fontWeight: FontWeight.w900,
                      fontFeatures: [FontFeature.tabularFigures()],
                    ),
                  ),
                ),
                const SizedBox(height: 64),

                if (!_isActive)
                  SizedBox(
                    width: double.infinity,
                    height: 64,
                    child: BrutalistButton(
                      text: 'LOCK IN',
                      backgroundColor: const Color(0xFF00E676),
                      onPressed: _startFocusBlock,
                      icon: Icons.play_arrow,
                    ),
                  )
                else
                  SizedBox(
                    width: double.infinity,
                    height: 64,
                    child: BrutalistButton(
                      text: 'GIVE UP',
                      backgroundColor: const Color(0xFFFF3D00),
                      onPressed: _giveUp,
                      icon: Icons.stop,
                    ),
                  )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
