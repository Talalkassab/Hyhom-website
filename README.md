# Hyhom Limited Enterprise Management Platform

A bilingual (Arabic/English) enterprise management platform designed to streamline employee management and business operations for Hyhom Limited.

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Express.js
- **Database**: PostgreSQL with Supabase
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query
- **Internationalization**: i18n

## Features

- 🌐 Bilingual Support (Arabic/English)
- 👥 Comprehensive Employee Management
- 🔐 Role-based Access Control
- 📱 Responsive Dashboard Design
- 🎨 Modern UI/UX with shadcn/ui Components
- 🔄 Real-time Data Updates
- 📊 Analytics and Reporting

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL database
- Supabase account

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Talalkassab/Hyhom-website.git
   cd Hyhom-website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   DATABASE_URL=your_database_url
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`.

## Project Structure

```
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── lib/        # Utilities and configurations
│   │   └── hooks/      # Custom React hooks
├── server/              # Backend Express application
│   ├── routes.ts       # API routes
│   └── db.ts           # Database configuration
└── shared/             # Shared types and utilities
    └── schema.ts       # Database schema and types
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. © 2025 Hyhom Limited. All rights reserved.
