
# Environment Setup

## Required API Keys

1. **Supabase Configuration**
   - Go to [Supabase](https://supabase.com) and create a new project
   - Get your Project URL and anon key from Settings > API
   - Update `lib/supabase.ts` with your credentials

2. **Google Gemini API**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key
   - Update `lib/services/gemini.ts` with your API key

3. **Ayrshare API**
   - Go to [Ayrshare](https://www.ayrshare.com)
   - Sign up and get your API key
   - Update `lib/services/ayrshare.ts` with your API key

4. **Supabase Database Schema**
   ```sql
   -- User profiles table
   CREATE TABLE user_profiles (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     email TEXT,
     subscription_tier TEXT DEFAULT 'free',
     posts_count INTEGER DEFAULT 0,
     posts_limit INTEGER DEFAULT 3,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Posts table
   CREATE TABLE posts (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     content TEXT NOT NULL,
     platforms TEXT[],
     status TEXT DEFAULT 'draft',
     published_at TIMESTAMP WITH TIME ZONE,
     ayrshare_id TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable RLS
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

   -- RLS policies
   CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
   CREATE POLICY "Users can view own posts" ON posts FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can insert own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

## Setup Steps

1. Install dependencies: `npm install`
2. Configure your API keys in the respective service files
3. Set up your Supabase database with the schema above
4. Run the development server: `npm start`

## Features

- ✅ Modern UI with Tailwind-inspired styles
- ✅ Authentication (Email/Password, Google OAuth)
- ✅ Content creation with AI suggestions
- ✅ Multi-platform publishing (Twitter, LinkedIn, Facebook, Instagram)
- ✅ Analytics dashboard
- ✅ Draft management with local storage
- ✅ Subscription management with post limits
- ✅ Responsive design for iOS, Android, and web
