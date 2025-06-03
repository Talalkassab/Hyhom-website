# HYHOM Connect - حيهم كونكت

Internal communication platform for HYHOM LTD employees.

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

## 📝 Development Phases

- [x] Phase 1: Foundation (Setup, Auth, Profiles)
- [ ] Phase 2: Core Chat (Messages, Channels, Real-time)
- [ ] Phase 3: Enhanced Features (DMs, Notifications, Admin)
- [ ] Phase 4: Polish & Launch

## 🤝 Contributing

This is an internal project for HYHOM LTD. For any questions or issues, please contact the development team.

## 📄 License

© 2025 HYHOM LTD. All rights reserved.