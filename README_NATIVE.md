# EZ Clear - React Native App

A native mobile application for connecting service providers with customers, built with React Native and Expo.

## 🚀 Features

- **Dark Theme UI** - Pixel-perfect implementation of the v0 design
- **Authentication** - Sign up/Sign in with Supabase
- **Role-based Access** - Worker and Hirer account types
- **Job Management** - Post, browse, and apply for jobs
- **Real-time Messaging** - Chat with other users
- **Profile Management** - User profiles and ratings
- **Service Categories** - Snow removal, landscaping, renovation, and more

## 📱 Screens

- **Splash Screen** - App loading with animated logo
- **Welcome** - Onboarding with role selection
- **Authentication** - Sign in/Sign up screens
- **Home** - Service categories and recent jobs
- **Find Jobs** - Browse and search available jobs
- **Post Job** - Create new job postings
- **Messages** - Conversation list and chat
- **Profile** - User profile and settings

## 🛠 Tech Stack

- **React Native** - Mobile app framework
- **Expo** - Development platform and tools
- **Expo Router** - File-based navigation
- **TypeScript** - Type safety
- **Supabase** - Backend and authentication
- **React Hook Form** - Form management
- **Expo Vector Icons** - Icon library
- **React Native Reanimated** - Animations
- **Expo Haptics** - Tactile feedback

## 🏗 Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac) or Android Studio
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ez-clear
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   
   Create the following tables in your Supabase project:
   
   ```sql
   -- Profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users ON DELETE CASCADE,
     email TEXT,
     name TEXT,
     user_type TEXT CHECK (user_type IN ('worker', 'hirer')),
     avatar_url TEXT,
     phone_number TEXT,
     phone_verified BOOLEAN DEFAULT FALSE,
     is_online BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     PRIMARY KEY (id)
   );

   -- Jobs table
   CREATE TABLE jobs (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     description TEXT NOT NULL,
     service_slug TEXT,
     service_sub_slug TEXT,
     city TEXT,
     budget_min INTEGER,
     budget_max INTEGER,
     status TEXT CHECK (status IN ('open', 'assigned', 'completed', 'cancelled')) DEFAULT 'open',
     assigned_to UUID REFERENCES profiles(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Applications table
   CREATE TABLE applications (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
     worker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
     message TEXT,
     status TEXT CHECK (status IN ('sent', 'accepted', 'declined')) DEFAULT 'sent',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Reviews table
   CREATE TABLE reviews (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
     reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
     reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
     rating INTEGER CHECK (rating >= 1 AND rating <= 5),
     comment TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Conversations table
   CREATE TABLE conversations (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     job_id UUID REFERENCES jobs(id),
     created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Messages table
   CREATE TABLE messages (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
     sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
     body TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## 🎨 Design System

The app uses a custom dark theme with the following color palette:

- **Background**: `#0A0A0B` - Deep dark background
- **Surface**: `#111113` - Card surfaces
- **Primary**: `#3B82F6` - Blue accent
- **Secondary**: `#00E6CF` - Teal/mint brand color
- **Accent**: `#7C5DFA` - Purple accent
- **Text Primary**: `#FFFFFF` - White text
- **Text Secondary**: `#E4E4E7` - Light gray text
- **Text Muted**: `#A1A1AA` - Muted text

## 📁 Project Structure

```
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
├── src/
│   ├── components/        # Reusable components
│   │   └── ui/           # UI components
│   ├── context/          # React contexts
│   ├── theme/            # Theme tokens and styling
│   └── ui/               # Base UI components
├── assets/               # Images, fonts, etc.
└── ...config files
```

## 🔧 Development

### Running Tests
```bash
npm test
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
# iOS
expo build:ios

# Android
expo build:android
```

## 📱 Platform Support

- **iOS**: 13.0+
- **Android**: API 21+ (Android 5.0)
- **Web**: Modern browsers (development only)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
