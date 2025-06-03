# **HYHOM Employee Communication Platform**
## **Product Requirements Document (PRD)**

### **Version 1.0 - May 2025**

---

## **Table of Contents**
1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Technical Architecture](#technical-architecture)
4. [Open-Source Solutions Evaluation](#open-source-solutions-evaluation)
5. [Database Schema & RLS](#database-schema--rls)
6. [User Stories & Features](#user-stories--features)
7. [UI/UX Requirements](#uiux-requirements)
8. [Security & Compliance](#security--compliance)
9. [Development Phases](#development-phases)
10. [Success Metrics](#success-metrics)
11. [Todo List](#todo-list)
12. [Cursor AI Agent Prompt](#cursor-ai-agent-prompt)

---

## **Executive Summary**

### **Project Name**: HYHOM Connect (حيهم كونكت)
### **Purpose**: Internal communication platform for HYHOM LTD employees
### **Target Users**: 30 current employees (scaling to 100+)
### **Primary Language**: Arabic (with English support)
### **Platform**: Web (Desktop & Mobile Responsive)

---

## **Project Overview**

### **Business Context**
HYHOM LTD, a food & beverage company operating multiple restaurant brands in Saudi Arabia, requires an internal communication platform to enhance employee collaboration and streamline company communications.

### **Core Objectives**
1. **Unified Communication**: Replace WhatsApp/email with secure internal platform
2. **Arabic-First Design**: Full RTL support with Arabic as primary language
3. **Scalability**: Support growth from 30 to 100+ employees
4. **Role-Based Access**: Different permissions for admins, supervisors, and employees
5. **Future Extensibility**: Foundation for task management, calendar, and HR features

### **Key Constraints**
- Development by AI agents (Cursor/Claude)
- Minimal custom code
- Use of open-source solutions
- Simple architecture for easy maintenance

---

## **Technical Architecture**

### **Tech Stack**

```javascript
{
  "core": {
    "frontend": "Next.js 14.1.0 (App Router)",
    "backend": "Supabase (PostgreSQL, Auth, Realtime, Storage)",
    "styling": "Tailwind CSS 3.4.0",
    "ui": "shadcn/ui (Radix UI + Tailwind)",
    "language": "TypeScript 5.0+"
  },
  "libraries": {
    "state": "Zustand 4.4.0",
    "i18n": "next-intl 3.0.0",
    "icons": "lucide-react",
    "dates": "date-fns",
    "forms": "react-hook-form + zod"
  },
  "development": {
    "package": "pnpm",
    "linting": "ESLint + Prettier",
    "git": "Git + GitHub"
  }
}
```

### **Architecture Principles**
1. **Server-First**: Leverage Next.js App Router for SSR
2. **Database-First**: Let Supabase handle complexity
3. **Progressive Enhancement**: Start simple, add features incrementally
4. **Type Safety**: Full TypeScript coverage
5. **Arabic-First**: RTL by default, LTR as option

---

## **Open-Source Solutions Evaluation**

### **Chat UI Libraries Evaluated**

#### **1. @chatscope/chat-ui-kit-react** ✅ (Considered for Phase 2)
```json
"@chatscope/chat-ui-kit-react": "^2.0.0"
```
**Pros:**
- Pre-built chat components (MessageList, MessageInput, ChatContainer)
- Excellent RTL support
- Customizable styling
- Well-documented

**Decision**: Start WITHOUT it in Phase 1 to keep things simple, but add in Phase 2 if custom components become complex.

#### **2. TalkJS** ❌
**Pros:**
- Complete chat solution
- Great UI/UX

**Cons:**
- Paid service
- Less control over data
- Not self-hosted

**Decision**: Rejected - We need full control and self-hosting with Supabase.

#### **3. Sendbird UIKit** ❌
**Cons:**
- Paid service
- Overkill for our needs
- External dependency

**Decision**: Rejected - Too complex and expensive.

### **Real-time Solutions**

#### **1. Supabase Realtime** ✅ (Chosen)
```javascript
// Built into Supabase - no extra dependencies!
const channel = supabase.channel('room1')
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'messages' 
  }, handleNewMessage)
  .subscribe()
```
**Pros:**
- Built into Supabase
- No additional setup
- Handles presence
- PostgreSQL integration

**Decision**: Perfect fit - no need for Socket.io or other solutions.

#### **2. Socket.io** ❌
**Cons:**
- Requires separate server
- Complex scaling
- Additional infrastructure

**Decision**: Rejected - Supabase Realtime is sufficient.

### **UI Component Libraries**

#### **1. shadcn/ui** ✅ (Chosen)
```bash
npx shadcn-ui@latest init
```
**Pros:**
- Copy-paste components
- Full customization
- Tailwind based
- Excellent TypeScript support
- No vendor lock-in

**Decision**: Primary UI library for all components.

#### **2. Ant Design** ❌
**Pros:**
- Good RTL support
- Comprehensive components

**Cons:**
- Heavy bundle size
- Opinionated styling
- Harder to customize

**Decision**: Rejected - shadcn/ui is more flexible.

### **Complete Dependencies List**

```javascript
{
  "dependencies": {
    // Core (Phase 1)
    "next": "14.1.0",
    "@supabase/supabase-js": "^2.39.0", // Includes Realtime
    "@supabase/ssr": "^0.0.10",
    "tailwindcss": "^3.4.0",
    
    // UI Components (Phase 1)
    "@radix-ui/react-avatar": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "@radix-ui/react-label": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-separator": "latest",
    "@radix-ui/react-slot": "latest",
    "@radix-ui/react-toast": "latest",
    
    // Utilities (Phase 1)
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.263.1", // Icons
    
    // Forms & Validation (Phase 1)
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.2",
    
    // Internationalization (Phase 1)
    "next-intl": "^3.0.0",
    
    // State Management (Phase 1)
    "zustand": "^4.4.0",
    
    // Date Handling (Phase 1)
    "date-fns": "^2.30.0",
    
    // File Upload (Phase 2)
    "react-dropzone": "^14.2.3",
    
    // Rich Text (Future)
    "@tiptap/react": "^2.1.0",
    "@tiptap/starter-kit": "^2.1.0",
    
    // Chat UI Kit (Phase 2 - Optional)
    "@chatscope/chat-ui-kit-react": "^2.0.0",
    "@chatscope/chat-ui-kit-styles": "^1.4.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.1.0",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.5.0"
  }
}
```

### **Implementation Strategy for Open-Source Components**

#### **Phase 1: Build Custom Simple Chat UI**
```jsx
// Simple custom chat components using shadcn/ui primitives
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"

function SimpleChatMessage({ message, isOwn }) {
  return (
    <div className={cn(
      "flex gap-3 p-4",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar>
        <AvatarImage src={message.user.avatar_url} />
        <AvatarFallback>{message.user.full_name[0]}</AvatarFallback>
      </Avatar>
      <div className={cn(
        "max-w-[70%] rounded-lg p-3",
        isOwn 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted"
      )}>
        <p>{message.content}</p>
        <time className="text-xs opacity-70">
          {formatDistance(message.created_at, new Date())}
        </time>
      </div>
    </div>
  )
}
```

#### **Phase 2: Evaluate Adding @chatscope/chat-ui-kit-react**
If custom components become too complex, integrate the chat UI kit:

```jsx
import { 
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  Avatar,
  ConversationHeader,
  InfoButton,
  MessageSeparator
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

// Override with our brand colors
const customStyles = {
  "--main-color": "#2a577e",
  "--secondary-color": "#6fbeb8",
}
```

### **Decision Matrix for Open-Source Solutions**

| Solution | Purpose | Status | Reason |
|----------|---------|--------|---------|
| Supabase Realtime | WebSocket | ✅ Chosen | Built-in, no extra setup |
| shadcn/ui | UI Components | ✅ Chosen | Flexible, customizable |
| next-intl | i18n | ✅ Chosen | Best Next.js i18n solution |
| @chatscope/chat-ui-kit-react | Chat UI | 🔄 Phase 2 | Start simple, add if needed |
| Socket.io | WebSocket | ❌ Rejected | Supabase handles this |
| TalkJS | Complete Chat | ❌ Rejected | Not self-hosted |
| Ant Design | UI Library | ❌ Rejected | Too heavy |
| react-dropzone | File Upload | ✅ Phase 2 | Simple and effective |
| @tiptap | Rich Text | 🔄 Future | Not needed for MVP |

### **Open-Source Tools for Development**

#### **Database Management**
- **Supabase Dashboard** (built-in)
- **TablePlus** or **DBeaver** for advanced SQL

#### **API Testing**
- **Thunder Client** (VS Code extension)
- **Insomnia** or **Postman**

#### **Performance Monitoring**
- **Vercel Analytics** (free tier)
- **Sentry** for error tracking (free tier)

#### **Development Tools**
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "formulahendry.auto-rename-tag",
    "naumovs.color-highlight",
    "usernamehw.errorlens"
  ]
}
```

---

## **Database Schema & RLS**

### **Complete Database Schema**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  full_name_ar TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  department TEXT CHECK (department IN ('management', 'operations', 'kitchen', 'service', 'hr', 'finance', 'marketing')),
  position TEXT,
  position_ar TEXT,
  bio TEXT,
  joined_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sound": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor', 'employee')),
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Channels
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  type TEXT NOT NULL CHECK (type IN ('public', 'private', 'department', 'announcement')),
  department TEXT,
  icon TEXT DEFAULT 'message-circle',
  color TEXT DEFAULT '#2a577e',
  is_archived BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Channel Members
CREATE TABLE public.channel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notifications_enabled BOOLEAN DEFAULT true,
  UNIQUE(channel_id, user_id)
);

-- 5. Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'file', 'system')),
  metadata JSONB DEFAULT '{}'::jsonb,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  thread_id UUID REFERENCES public.messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Direct Messages
CREATE TABLE public.direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES public.profiles(id),
  to_user_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'file')),
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (from_user_id != to_user_id)
);

-- 7. File Uploads
CREATE TABLE public.file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  message_id UUID REFERENCES public.messages(id),
  direct_message_id UUID REFERENCES public.direct_messages(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. User Presence
CREATE TABLE public.user_presence (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status_message TEXT,
  status_message_ar TEXT
);

-- 9. Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'mention', 'announcement', 'system')),
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  content TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Activity Logs (for admins)
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_direct_messages_users ON public.direct_messages(from_user_id, to_user_id);
CREATE INDEX idx_channel_members_user ON public.channel_members(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Row Level Security (RLS) Policies**

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.user_roles WHERE user_id = $1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- 1. Profiles Policies
-- Everyone can view active profiles
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (is_active = true);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

-- Only admins can insert profiles
CREATE POLICY "profiles_insert_admin" ON public.profiles
  FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- 2. User Roles Policies
-- Users can view their own role
CREATE POLICY "roles_select_own" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view all roles
CREATE POLICY "roles_select_admin" ON public.user_roles
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

-- Only admins can manage roles
CREATE POLICY "roles_insert_admin" ON public.user_roles
  FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "roles_update_admin" ON public.user_roles
  FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

-- 3. Channels Policies
-- Everyone can view public channels
CREATE POLICY "channels_select_public" ON public.channels
  FOR SELECT USING (
    type = 'public' 
    OR type = 'announcement'
    OR id IN (
      SELECT channel_id FROM public.channel_members 
      WHERE user_id = auth.uid()
    )
  );

-- Members can view their channels
CREATE POLICY "channels_select_member" ON public.channels
  FOR SELECT USING (
    id IN (
      SELECT channel_id FROM public.channel_members 
      WHERE user_id = auth.uid()
    )
  );

-- Admins and supervisors can create channels
CREATE POLICY "channels_insert" ON public.channels
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'supervisor')
  );

-- Channel owners and admins can update
CREATE POLICY "channels_update" ON public.channels
  FOR UPDATE USING (
    created_by = auth.uid() 
    OR get_user_role(auth.uid()) = 'admin'
  );

-- 4. Channel Members Policies
-- Members can view channel membership
CREATE POLICY "channel_members_select" ON public.channel_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR channel_id IN (
      SELECT channel_id FROM public.channel_members 
      WHERE user_id = auth.uid()
    )
  );

-- Channel admins can manage members
CREATE POLICY "channel_members_insert" ON public.channel_members
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.channel_members 
      WHERE channel_id = channel_members.channel_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- 5. Messages Policies
-- Users can view messages in their channels
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (
    channel_id IN (
      SELECT channel_id FROM public.channel_members 
      WHERE user_id = auth.uid()
    )
    OR channel_id IN (
      SELECT id FROM public.channels 
      WHERE type IN ('public', 'announcement')
    )
  );

-- Users can insert messages in their channels
CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND (
      channel_id IN (
        SELECT channel_id FROM public.channel_members 
        WHERE user_id = auth.uid()
      )
      OR channel_id IN (
        SELECT id FROM public.channels 
        WHERE type = 'public'
      )
    )
  );

-- Users can update their own messages
CREATE POLICY "messages_update_own" ON public.messages
  FOR UPDATE USING (user_id = auth.uid());

-- 6. Direct Messages Policies
-- Users can view their own DMs
CREATE POLICY "dm_select" ON public.direct_messages
  FOR SELECT USING (
    from_user_id = auth.uid() 
    OR to_user_id = auth.uid()
  );

-- Users can send DMs
CREATE POLICY "dm_insert" ON public.direct_messages
  FOR INSERT WITH CHECK (from_user_id = auth.uid());

-- Users can update their own sent DMs
CREATE POLICY "dm_update" ON public.direct_messages
  FOR UPDATE USING (from_user_id = auth.uid());

-- 7. Notifications Policies
-- Users can view their own notifications
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- System can insert notifications
CREATE POLICY "notifications_insert_system" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- 8. Activity Logs Policies
-- Only admins can view logs
CREATE POLICY "logs_select_admin" ON public.activity_logs
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

-- System can insert logs
CREATE POLICY "logs_insert_system" ON public.activity_logs
  FOR INSERT WITH CHECK (true);
```

### **Database Functions & Triggers**

```sql
-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, full_name_ar)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name_ar', '')
  );
  
  -- Assign default employee role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee');
  
  -- Add to general channel
  INSERT INTO public.channel_members (channel_id, user_id)
  SELECT id, NEW.id FROM public.channels WHERE is_default = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update last seen
CREATE OR REPLACE FUNCTION public.update_last_seen()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET last_seen = NOW()
  WHERE id = auth.uid();
  
  UPDATE public.user_presence
  SET last_seen = NOW(), status = 'online'
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread messages count
CREATE OR REPLACE FUNCTION public.get_unread_count(user_uuid UUID)
RETURNS TABLE (
  channel_id UUID,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.channel_id,
    COUNT(m.id) as unread_count
  FROM public.messages m
  JOIN public.channel_members cm ON cm.channel_id = m.channel_id
  WHERE cm.user_id = user_uuid
    AND m.created_at > cm.last_read_at
    AND m.user_id != user_uuid
  GROUP BY m.channel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## **User Stories & Features**

### **Core User Roles**

1. **Admin (مدير النظام)**
   - Full system access
   - User management
   - Channel management
   - Analytics access
   - System configuration

2. **Supervisor (مشرف)**
   - Department management
   - Create private channels
   - Moderate messages
   - View department analytics

3. **Employee (موظف)**
   - Basic chat access
   - Join public channels
   - Direct messaging
   - Update own profile

### **Feature List by Priority**

#### **P0 - Must Have (MVP)**
1. **Authentication**
   - Email/password login
   - Password reset
   - Session management
   - Remember me

2. **User Profiles**
   - Profile creation
   - Avatar upload
   - Edit profile
   - View other profiles

3. **Basic Chat**
   - Send/receive messages
   - Real-time updates
   - Public channels
   - Message history

4. **Arabic Support**
   - Full RTL layout
   - Arabic UI
   - Bilingual content

#### **P1 - Should Have**
1. **Direct Messages**
   - 1-on-1 chat
   - Online status
   - Read receipts
   - Message notifications

2. **Channel Management**
   - Create channels
   - Private channels
   - Channel settings
   - Member management

3. **File Sharing**
   - Image upload
   - File attachments
   - Preview support
   - Download files

4. **Admin Dashboard**
   - User management
   - Role assignment
   - Activity monitoring
   - System settings

#### **P2 - Nice to Have**
1. **Advanced Messaging**
   - Message threads
   - Edit messages
   - Delete messages
   - Message search

2. **Notifications**
   - Push notifications
   - Email notifications
   - Mention alerts
   - Custom preferences

3. **Presence & Status**
   - Online/offline/away
   - Custom status
   - Last seen
   - Typing indicators

#### **P3 - Future**
1. **Task Management**
2. **Calendar Integration**
3. **Polls & Surveys**
4. **Voice/Video Calls**

---

## **UI/UX Requirements**

### **Design System**

#### **Brand Colors**
```css
:root {
  --hyhom-primary: #2a577e;
  --hyhom-secondary: #6fbeb8;
  --hyhom-dark: #1a3a52;
  --hyhom-light: #e8f4f2;
  --hyhom-success: #10b981;
  --hyhom-warning: #f59e0b;
  --hyhom-error: #ef4444;
  --hyhom-info: #3b82f6;
}
```

#### **Typography**
```css
/* English */
.font-english {
  font-family: 'Poppins', sans-serif;
  font-weight: 300; /* Light */
}

/* Arabic */
.font-arabic {
  font-family: 'Noto Sans Arabic', 'Tajawal', sans-serif;
  font-weight: 400;
}
```

### **Key Screens**

1. **Landing Page**
   - Hero section with app benefits
   - Login/Register CTAs
   - Language toggle
   - Company branding

2. **Dashboard**
   - Channel list (left sidebar)
   - Message area (center)
   - User list (right sidebar)
   - Top navigation

3. **Profile Page**
   - User information
   - Avatar and cover photo
   - Edit capabilities
   - Activity history

4. **Admin Panel**
   - User table
   - Role management
   - Analytics charts
   - System logs

### **Responsive Design**
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px
- Collapsible sidebars on mobile
- Touch-friendly interfaces

### **Accessibility**
- ARIA labels in Arabic/English
- Keyboard navigation
- Screen reader support
- High contrast mode

---

## **Security & Compliance**

### **Authentication**
- Supabase Auth with JWT
- Secure password requirements
- Session timeout (8 hours)
- Rate limiting

### **Data Protection**
- All data encrypted at rest
- HTTPS only
- No external data sharing
- Regular backups

### **Compliance**
- GDPR compliant
- Saudi data protection laws
- Internal data retention policies
- Audit trails

---

## **Development Phases**

### **Phase 1: Foundation (Weeks 1-2)**
- Project setup
- Authentication system
- User profiles
- Basic UI layout
- Landing pages

### **Phase 2: Core Chat (Weeks 3-4)**
- Message system
- Real-time updates
- Channel structure
- Basic file uploads

### **Phase 3: Enhanced Features (Weeks 5-6)**
- Direct messages
- Notifications
- Admin panel
- Search functionality

### **Phase 4: Polish & Launch (Week 7-8)**
- Bug fixes
- Performance optimization
- User testing
- Deployment

---

## **Success Metrics**

### **Technical KPIs**
- Page load time < 2s
- 99.9% uptime
- Real-time latency < 100ms
- Mobile score > 90

### **User KPIs**
- Daily active users > 80%
- Messages per user per day > 10
- User satisfaction > 4.5/5
- Feature adoption > 60%

### **User Adoption**: 70% of employees actively using the platform within 3 months.
### **Reduced Email/WhatsApp**: 50% reduction in internal communication via these channels.
### **Improved Engagement**: Measurable increase in likes, comments, and post views.
### **Task Completion**: (Future) Trackable task completion rates.

---

