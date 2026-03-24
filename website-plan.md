# NeuroCanopy Web Platform Plan

## Goal
Build the NeuroCanopy web platform (Landing, Auth, and Dashboard) using a bright, vibrant, student-centric "Figma-like" aesthetic (Neo-brutalism). We will strictly avoid dark mode, default generic shapes, and AI-style purple/blue gradients or glassmorphism.

## Page Structure & Features (Based on Legacy UI)

### 1. Public & Auth Pages
- **Landing Page (`Index.tsx`):**
  - Hero Section, How It Works, Features, Testimonials, CTA.
  - *Design:* Bright background (Off-White `#FAF9F6`), solid structural shapes, heavy typography (Space Grotesk).
- **Authentication Flow:**
  - `Login.tsx`
  - `Register.tsx` (Multi-step: Account, Identity, Bio-Rhythms, Academics, Logistics, Digital Rules, Materials)
  - `ForgotPassword.tsx` & `ResetPassword.tsx`
  - *Design:* High-contrast, accessibility-focused forms with clear step progress indicators.

### 2. Dashboard Core
- **Main Shell (`DashboardLayout.tsx` & `DashboardSidebar.tsx`):**
  - Persistent navigation routing to all internal pages.
  - Bright, active-state highlighting with solid borders.
- **Dashboard Overview (`Dashboard.tsx`):**
  - **Stat Cards:** Total study hours, viva scores, syllabus progress.
  - **Pacing Indicator:** Real-time state (Smooth, Alert, Panic).
  - **Decay Radar & Study Streak:** Visualizing areas needing review and daily streaks.
  - **Upcoming Exams & Quick Actions:** Easy access to start a study block or upload notes.

### 3. Feature Pages
- **Knowledge Tree Visualizer (`KnowledgeTreePage.tsx`):**
  - D3.js/SVG based tree showing node growth (green leaves for mastered topics, brown/falling for decayed topics). No dark sci-fi themes—use organic, vibrant greens and earthy tones.
- **Adaptive Scheduler (`Schedule.tsx`):**
  - Quantum Calendar view displaying today's required study topics.
  - Auto-reshuffles based on missed blocks or new exams.
- **Syllabus Commander (`Syllabus.tsx`):**
  - Tracks all courses and granular topic-level mastery.
  - Resource Vault for uploading PDFs/PPTs.
- **AI Assessment (`VoiceViva.tsx`):**
  - Secure browser environment for voice-based testing.
  - Real-time STT (Speech-to-Text) mechanics and grading feedback.
- **Learning Assistant (`Chat.tsx`):**
  - Interface for resolving doubts and generating summaries before exams.
- **User Management (`Profile.tsx` & `Settings.tsx`):**
  - Configuration for Bio-rhythms, logistics, app blockers, and notification permissions.

## Execution Tasks
- [ ] **Task 1: Setup Foundation & Theming** → Verify: `tailwind.config.ts` configured with custom vibrant palette and completely disabled dark mode.
- [ ] **Task 2: Build Public & Auth Pages** → Verify: Landing, Login, Register, Forgot Password flows route correctly and follow Neo-brutalist styling.
- [ ] **Task 3: Construct Dashboard Shell & Navigation** → Verify: Sidebar links correctly to all 8 internal routes (`/dashboard`, `/tree`, `/schedule`, `/syllabus`, `/viva`, `/chat`, `/profile`, `/settings`).
- [ ] **Task 4: Implement Dashboard Widgets** → Verify: Stat cards, Decay Radar, pacing engine, and Streak components render properly on the main Dashboard view.
- [ ] **Task 5: Develop Feature Pages (Tree, Schedule, Syllabus)** → Verify: Data visualizations match the bright design language and adapt to layout widths.
- [ ] **Task 6: Build Interactive AI Pages (Viva & Chat)** → Verify: Voice recording UI and chat bubbles feature clear, high-contrast states.

## Done When
- [ ] All 14 pages from the legacy architecture are scaffolded and fully navigable in the new project.
- [ ] The entire UI adheres to the bright, energetic, student-first design language.
- [ ] There is a complete absence of generic "AI slop" visuals (no purple/blue gradients, no glassmorphism, no default dark modes).

## Notes
- **Design Philosophy:** Think Neo-brutalism or high-energy modern flat design. Sharp borders, solid colors, bold typography.
- **Audience:** Gen Z students. Needs to feel fast, authentic, and engaging.
- **Tools to Use:** React 18, Vite, TypeScript, Tailwind CSS, Radix UI.
