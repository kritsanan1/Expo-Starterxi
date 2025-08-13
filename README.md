# Project Name: Social Media Insight Pro

## Description
An Expo-based mobile app for analyzing social media post performance with AI-driven trend suggestions, featuring analytics dashboards, enhanced authentication, and community engagement.

## Primary Goals
- Provide users insights into their social media post performance across platforms.
- Suggest trending topics for new posts using AI.
- Offer enhanced analytics features for premium subscribers.
- Ensure responsive design across all platforms with robust authentication.
- Foster community engagement through a dedicated forum.
- Provide real-time notifications and personalized insights.
- Expand platform integration to include Instagram and Facebook.

----------------------------------------------------

## Tech Stack & Environment

**Frontend:** Vite + React + TypeScript + Tailwind CSS

**Backend:** Supabase (PostgreSQL + Auth)

**Target Platform:** Single-Page Application

**Framework Versions & Config:** Latest stable versions

----------------------------------------------------

## Requirements & Features

### Core Features:
1. **Home Screen:** Display a dashboard showing Twitter, LinkedIn, Instagram, and Facebook post performance (likes, shares, comments) via the Ayrshare API.

2. **Trends Screen:** Provide AI-driven trending topic suggestions for new posts using the Google Gemini API.

3. **Authentication:** Use Supabase for Google OAuth, email/password authentication, and two-factor authentication.

4. **Subscription Management:** Restrict premium analytics features to Stripe subscribers.

5. **UI/UX:** Implement a professional, Tailwind-inspired UI with a blue-white theme, smooth transitions, and a dark mode option.

6. **Platform Compatibility:** Ensure the app is responsive and works on iOS, Android, and web.

7. **Local Caching:** Use improved caching strategies for faster data retrieval and reduced API calls.

8. **Real-Time Notifications:** Provide users with notifications for updates on post performance.

9. **Community Forum:** Allow users to discuss trends and analytics in a dedicated forum space.

10. **Advanced Filtering:** Enable sorting of analytics data by date, platform, and engagement type.

11. **Personalized Insights:** Offer tailored recommendations based on user activity.

### User Flows
- User logs in using email/password, Google OAuth, or two-factor authentication.
- Navigate through the home screen to view social media analytics.
- Explore trending topics on the Trends Screen.
- Access premium analytics features as a subscribed user.
- Join discussions in the community forum.
- Receive real-time notifications for post performance updates.
- Utilize advanced filtering options for data analysis.

### Business Rules
- Premium analytics features are restricted to Stripe subscribers.
- Authentication is required for accessing core app functionality.
- Forum participation requires user authentication.

----------------------------------------------------

## UI/UX Design

### Layout
- Dashboard-style home screen displaying social media analytics.
- Intuitive navigation for easy access to trends, analytics features, and community forum.

### Look & Feel
- Professional design inspired by Tailwind CSS.
- Blue-white theme with a dark mode option.
- Smooth transitions and consistent use of color palette and typography.

### Pages
- Home Screen
- Trends Screen
- Subscription Management Screen
- Authentication Screen
- Community Forum Screen

### Components
- Analytics Dashboard
- Trending Topics Display
- Subscription Management Tools
- Notification System
- Forum Discussion Board

----------------------------------------------------

## Data Model & Supabase Setup

### Database Schema
- Users Table: Stores user information, authentication details, and forum participation.
- Analytics Table: Stores social media analytics data.
- Subscriptions Table: Tracks user subscription status and access levels.
- Forum Table: Manages forum posts and discussions.

### Row-Level Security
Enabled by default

### Auth Requirements
- Email/Password authentication via Supabase.
- Google OAuth for quick login.
- Two-factor authentication for enhanced security.