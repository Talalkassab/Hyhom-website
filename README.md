# HYHOM Connect - حيهم كونكت

**Real-time internal communication platform for HYHOM LTD employees**

[![Development Status](https://img.shields.io/badge/Status-Phase%202%20Complete-success)](https://github.com/Talalkassab/Hyhom-website)
[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-blue)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Real--time-green)](https://supabase.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://typescript.org/)

A modern, Arabic-first communication platform featuring real-time messaging, file sharing, and team collaboration tools.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hyhom-connect
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Update `.env.local` with your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

4. Set up the database:
- Go to your Supabase project dashboard
- Navigate to SQL Editor
- Copy and execute the contents of `supabase/schema.sql`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Architecture Overview

HYHOM Connect is built as a modern, scalable real-time communication platform with the following key architectural decisions:

### Core Technologies
- **Next.js 14 with App Router**: Server-side rendering and optimal performance
- **Supabase**: Complete backend-as-a-service with real-time capabilities
- **TypeScript**: Full type safety across the application
- **Tailwind CSS + shadcn/ui**: Modern, consistent UI components

### Real-time Features
- **WebSocket connections** via Supabase Realtime for instant messaging
- **Database triggers** for automatic notifications and presence updates
- **Optimistic updates** for smooth user experience
- **Smart message grouping** and pagination for performance

### Security & Permissions
- **Row Level Security (RLS)** on all database tables
- **JWT-based authentication** with automatic token refresh
- **Role-based access control** with granular permissions
- **Secure file upload** with type validation and size limits

### Database Schema
- **Profiles**: User information with Arabic/English names
- **Channels**: Organized conversations with type-based permissions
- **Messages**: Real-time messaging with file attachments
- **User Presence**: Live activity and status tracking
- **File Uploads**: Secure file storage and metadata

## 🏗️ Tech Stack

- **Frontend**: Next.js 14.1.0 (App Router)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript
- **State Management**: Zustand
- **Internationalization**: next-intl (Arabic/English)

## 📁 Project Structure

```
hyhom-connect/
├── src/
│   ├── app/
│   │   └── [locale]/      # Locale-specific pages
│   ├── components/        # React components
│   ├── config/           # Configuration files
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── messages/         # i18n translations
│   ├── store/            # Zustand stores
│   └── types/            # TypeScript types
├── public/               # Static assets
└── supabase/            # Database schema
```

## 🌍 Internationalization

The app supports both Arabic and English with full RTL support:
- Default language: Arabic
- Language switcher available in the UI
- All text content is translatable

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control (Admin, Supervisor, Employee)
- JWT-based authentication
- Secure password requirements

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import the project to Vercel
3. Add environment variables
4. Deploy

### Manual Deployment
```bash
npm run build
npm start
```

## ✨ Features Implemented

### 🔐 Authentication & User Management
- ✅ Secure email/password authentication
- ✅ User profile management with Arabic names
- ✅ Role-based access control (Admin, Supervisor, Employee)
- ✅ Password reset functionality

### 💬 Real-time Messaging
- ✅ Instant message delivery with Supabase Realtime
- ✅ Message history with pagination
- ✅ Message editing and deletion
- ✅ Rich message display with timestamps
- ✅ Smart message grouping by user and time

### 📁 Channel Management
- ✅ Create/join/leave channels
- ✅ Multiple channel types (Public, Private, Department, Announcement)
- ✅ Channel member management
- ✅ Real-time channel updates
- ✅ Bilingual channel names and descriptions

### 📎 File Sharing
- ✅ Image upload with preview
- ✅ File attachments (PDF, DOC, XLS, etc.)
- ✅ Automatic file size formatting
- ✅ Secure file storage with Supabase Storage
- ✅ Download links for shared files

### 👥 User Presence
- ✅ Online/offline status indicators
- ✅ Real-time presence updates
- ✅ User activity tracking
- ✅ Visual presence indicators on avatars

### 🌍 Internationalization
- ✅ Full Arabic RTL support
- ✅ English/Arabic language switching
- ✅ Bilingual user interface
- ✅ Arabic-first design approach

### 🎨 Modern UI/UX
- ✅ Professional chat interface
- ✅ Responsive design (desktop/mobile)
- ✅ shadcn/ui component library
- ✅ Tailwind CSS styling
- ✅ Consistent HYHOM branding

## 📝 Development Phases

- ✅ **Phase 1**: Foundation (Setup, Auth, Profiles) - **COMPLETE**
- ✅ **Phase 2**: Core Chat (Messages, Channels, Real-time) - **COMPLETE**
- 🔄 **Phase 3**: Enhanced Features (DMs, Notifications, Admin) - **IN PROGRESS**
- ⏳ **Phase 4**: Polish & Launch - **PENDING**

### Phase 2 Accomplishments (Latest Session)
- Enhanced real-time messaging with complete profile data
- Implemented seamless channel switching
- Added comprehensive file upload with image preview
- Integrated user presence indicators throughout the app
- Fixed locale routing and navigation issues
- Completed end-to-end messaging workflow testing

## 🤝 Contributing

This is an internal project for HYHOM LTD. For any questions or issues, please contact the development team.

## 📄 License

© 2025 HYHOM LTD. All rights reserved.