# Changelog

## [1.0.0] - 2024-02-22

### Added
- Bilingual support (Arabic/English) for the login page
- Dynamic language switching in login form
- Right-to-left (RTL) text support for Arabic inputs
- Arabic translations for error messages and loading states
- Arabic placeholder text for email and password fields

### Changed
- Updated header "Login" text to show "تسجيل دخول" in Arabic
- Modified login form layout to support RTL in Arabic mode
- Improved error message display with proper RTL alignment
- Enhanced toast notifications with bilingual support

### Removed
- Signup functionality as user creation is now admin-only
- Signup route from App.tsx
- Sign up button from login page
- Public registration access

### Security
- Restricted user registration to system administrators only
- Maintained Supabase authentication integration
