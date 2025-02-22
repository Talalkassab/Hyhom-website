# Hyhom Limited Website Documentation

## Authentication System

### Overview
The website implements a bilingual (Arabic/English) authentication system using Supabase for user management. User registration is restricted to system administrators only, ensuring controlled access to the platform.

### Login System Features
- Bilingual support (Arabic/English)
- RTL/LTR layout switching
- Responsive design
- Error handling in both languages
- Secure authentication via Supabase

### User Interface
The login page automatically adapts to the selected language:

#### English Mode
- Email placeholder: "Email"
- Password placeholder: "Password"
- Submit button: "Sign in"
- Loading state: "Signing in..."
- Error messages in English

#### Arabic Mode
- Email placeholder: "البريد الإلكتروني"
- Password placeholder: "كلمة المرور"
- Submit button: "تسجيل دخول"
- Loading state: "جاري تسجيل الدخول..."
- Error messages in Arabic

### Language Switching
- Language can be toggled using the globe icon in the header
- Automatically persists language preference
- Affects the entire application including the login page

## Employee Profile System

### Database Structure
The system uses a comprehensive database structure including:
- Employees (core information)
- Departments
- Positions
- Compensation
- Emergency Contacts
- Performance Reviews
- Benefits

### Employee Profile Features
1. Basic Information
   - Full name
   - Contact details (email, phone)
   - Address
   - Department and position

2. Professional Details
   - Current position
   - Department affiliation
   - Manager information
   - Employment history

3. Compensation
   - Base salary
   - Currency
   - Effective date

4. Benefits
   - Enrolled benefits
   - Enrollment dates
   - Benefit descriptions

5. Performance
   - Review history
   - Ratings
   - Comments
   - Review dates

### Admin Capabilities
1. User Management
   - Create and manage employee profiles
   - Assign roles and permissions
   - Update employee information

2. Department Management
   - Create and manage departments
   - Assign employees to departments
   - Track departmental hierarchy

3. Position Management
   - Create and manage positions
   - Assign positions to employees
   - Track position history

### Security Considerations
- Supabase Authentication for secure login
- Role-based access control
- Data encryption for sensitive information
- Audit logging for profile changes

### Technical Implementation
The system uses:
- React with TypeScript
- Supabase Authentication
- PostgreSQL Database
- Drizzle ORM
- TanStack Query for data fetching
- Shadcn UI components

### Future Considerations
- Enhanced reporting capabilities
- Advanced search and filtering
- Document management integration
- Time tracking features