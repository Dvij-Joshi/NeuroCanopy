import 'package:flutter/material.dart';
import '../widgets/brutalist_widgets.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final List<String> _blockList = ['youtube.com', 'instagram.com', 'reddit.com', 'twitter.com'];
  final TextEditingController _blockController = TextEditingController();

  bool _decayAlerts = true;
  bool _strictMode = false;

  @override
  void dispose() {
    _blockController.dispose();
    super.dispose();
  }

  void _addBlockSite() {
    final domain = _blockController.text.trim();
    if (domain.isNotEmpty) {
      setState(() {
        _blockList.add(domain);
        _blockController.clear();
      });
    }
  }

  void _removeBlockSite(String domain) {
    setState(() {
      _blockList.remove(domain);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF9F6),
      appBar: AppBar(
        title: const Text('SETTINGS', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.black, fontSize: 24)),
        backgroundColor: const Color(0xFF00E676),
        elevation: 0,
        shape: const Border(bottom: BorderSide(color: Colors.black, width: 4)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black, size: 28),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16.0).copyWith(bottom: 120), // Leave room for floating button
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Adjust your environment parameters.', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 24),
                
                _buildBlocklistSection(),
                const SizedBox(height: 24),
                
                _buildIntegrationsSection(),
                const SizedBox(height: 24),

                _buildNotificationsSection(),
              ],
            ),
          ),
          
          Positioned(
            left: 16,
            right: 16,
            bottom: 32,
            child: BrutalistButton(
              text: 'SAVE SETTINGS',
              backgroundColor: const Color(0xFFFFE600),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('SETTINGS SAVED!', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.black)),
                    backgroundColor: Color(0xFFFFE600),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
                Navigator.of(context).pop();
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBlocklistSection() {
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
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xFFFFE600),
              border: Border(bottom: BorderSide(color: Colors.black, width: 4)),
            ),
            child: const Row(
              children: [
                Icon(Icons.lock, color: Colors.black, size: 24),
                SizedBox(width: 8),
                Text('FOCUS BLOCKLIST', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20)),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'These sites are completely inaccessible during active Focus Blocks.',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 16),
                ..._blockList.map((site) => Padding(
                      padding: const EdgeInsets.only(bottom: 8.0),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFAF9F6),
                          border: Border.all(color: Colors.black, width: 2),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(site, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            GestureDetector(
                              onTap: () => _removeBlockSite(site),
                              child: const Text('REMOVE', style: TextStyle(color: Color(0xFFFF3D00), fontWeight: FontWeight.w900)),
                            ),
                          ],
                        ),
                      ),
                    )),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 52,
                        decoration: BoxDecoration(
                          color: const Color(0xFFFAF9F6),
                          border: Border.all(color: Colors.black, width: 3),
                        ),
                        child: TextField(
                          controller: _blockController,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                          decoration: const InputDecoration(
                            hintText: 'Add to blocklist...',
                            contentPadding: EdgeInsets.symmetric(horizontal: 16),
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: _addBlockSite,
                      child: Container(
                        height: 52,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        decoration: BoxDecoration(
                          color: Colors.black,
                          border: Border.all(color: Colors.black, width: 3),
                          boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(2, 2))],
                        ),
                        alignment: Alignment.center,
                        child: const Text('ADD', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIntegrationsSection() {
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
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xFFFF3D00),
              border: Border(bottom: BorderSide(color: Colors.black, width: 4)),
            ),
            child: const Row(
              children: [
                Icon(Icons.monitor_heart, color: Colors.white, size: 24),
                SizedBox(width: 8),
                Text('APP INTEGRATIONS', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: Colors.white)),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildIntegrationRow('Google Calendar', 'Sync quantum schedule with GCal.', true),
                const SizedBox(height: 16),
                _buildIntegrationRow('Notion', 'Auto-export generated notes.', false),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIntegrationRow(String name, String desc, bool isConnected) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.black12, width: 2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                const SizedBox(height: 4),
                Text(desc, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              ],
            ),
          ),
          const SizedBox(width: 16),
          GestureDetector(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(isConnected ? 'Disconnected $name' : 'Connected to $name', style: const TextStyle(fontWeight: FontWeight.bold))),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: isConnected ? Colors.black : const Color(0xFFFFE600),
                border: Border.all(color: Colors.black, width: 3),
                boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(2, 2))],
              ),
              child: Text(
                isConnected ? 'DISCONNECT' : 'CONNECT',
                style: TextStyle(
                  color: isConnected ? Colors.white : Colors.black,
                  fontWeight: FontWeight.w900,
                  fontSize: 12,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationsSection() {
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
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Colors.black,
              border: Border(bottom: BorderSide(color: Colors.black, width: 4)),
            ),
            child: const Row(
              children: [
                Icon(Icons.notifications, color: Colors.white, size: 24),
                SizedBox(width: 8),
                Text('NOTIFICATIONS', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: Colors.white)),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildToggleRow('DECAY ALERTS', 'Notify when topics need review.', _decayAlerts, (val) => setState(() => _decayAlerts = val)),
                const SizedBox(height: 24),
                _buildToggleRow('STRICT MODE', 'Loud, un-dismissable alarms for focus ending.', _strictMode, (val) => setState(() => _strictMode = val)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToggleRow(String title, String desc, bool value, ValueChanged<bool> onChanged) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GestureDetector(
          onTap: () => onChanged(!value),
          child: Container(
            width: 60,
            height: 32,
            decoration: BoxDecoration(
              color: value ? const Color(0xFFFFE600) : Colors.grey[300],
              border: Border.all(color: Colors.black, width: 3),
            ),
            child: AnimatedAlign(
              duration: const Duration(milliseconds: 200),
              alignment: value ? Alignment.centerRight : Alignment.centerLeft,
              child: Container(
                width: 26,
                height: 26,
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: Colors.black, width: 3),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
              const SizedBox(height: 4),
              Text(desc, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black54)),
            ],
          ),
        ),
      ],
    );
  }
}
