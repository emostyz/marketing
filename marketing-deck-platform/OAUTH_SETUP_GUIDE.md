# OAuth Authentication Setup Guide

## Overview

I've completely rebuilt the authentication system for your marketing deck platform to support OAuth authentication with Google, GitHub, and Microsoft, while maintaining compatibility with traditional email/password authentication and demo mode.

## What's Been Built

### 1. OAuth Integration (`lib/auth/oauth-config.ts`)
- **Google OAuth**: Full integration with Google Sign-In
- **GitHub OAuth**: GitHub authentication support
- **Microsoft OAuth**: Azure AD authentication support
- **Automatic Profile Creation**: Creates user profiles in Supabase when users sign in via OAuth
- **Profile Management**: Handles user profile updates and data persistence

### 2. Enhanced Auth Context (`lib/auth/auth-context.tsx`)
- **Unified Authentication**: Single context handles OAuth, traditional auth, and demo mode
- **Real-time Updates**: Listens to Supabase auth state changes
- **Profile Management**: Built-in profile update functionality
- **Session Persistence**: Maintains user sessions across page reloads

### 3. Updated Auth Pages
- **Login Page** (`app/auth/login/page.tsx`): OAuth buttons with loading states
- **Signup Page** (`app/auth/signup/page.tsx`): OAuth registration support
- **Callback Page** (`app/auth/callback/page.tsx`): Handles OAuth redirects

### 4. User Profile Management
- **Profile Component** (`components/ui/UserProfile.tsx`): Complete profile editor
- **Profile API** (`app/api/user/profile/route.ts`): RESTful profile management
- **Business Context**: Company info, industry, target audience, key metrics
- **Branding**: Logo URL, brand colors, visual preferences

### 5. API Routes
- **Registration** (`app/api/auth/register/route.ts`): Traditional user registration
- **Login** (`app/api/auth/login/route.ts`): Email/password and demo authentication
- **Profile Management** (`app/api/user/profile/route.ts`): Profile CRUD operations

## Current Status

✅ **Supabase Configuration**: Properly configured and connected  
✅ **Database Schema**: Profiles and presentations tables accessible  
✅ **OAuth Providers**: Google, GitHub, Microsoft enabled in code  
✅ **Auth Pages**: Login, signup, and callback pages working  
✅ **Demo Mode**: Working for testing without OAuth setup  
✅ **Profile Management**: Complete user profile system  

## Next Steps: OAuth Provider Setup

### 1. Google OAuth Setup

1. **Go to Google Cloud Console**:
   - Visit https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     ```
     https://waddrfstpqkvdfwbxvfw.supabase.co/auth/v1/callback
     http://localhost:3002/auth/callback
     ```

4. **Configure in Supabase**:
   - Go to your Supabase dashboard
   - Navigate to "Authentication" > "Providers"
   - Enable Google provider
   - Add your Google Client ID and Client Secret

### 2. GitHub OAuth Setup

1. **Create GitHub OAuth App**:
   - Go to https://github.com/settings/developers
   - Click "New OAuth App"
   - Fill in the details:
     - Application name: "EasyDecks.ai Marketing Platform"
     - Homepage URL: `http://localhost:3002`
     - Authorization callback URL: `https://waddrfstpqkvdfwbxvfw.supabase.co/auth/v1/callback`

2. **Configure in Supabase**:
   - Go to your Supabase dashboard
   - Navigate to "Authentication" > "Providers"
   - Enable GitHub provider
   - Add your GitHub Client ID and Client Secret

### 3. Microsoft OAuth Setup

1. **Create Azure AD App**:
   - Go to https://portal.azure.com/
   - Navigate to "Azure Active Directory" > "App registrations"
   - Click "New registration"
   - Fill in the details:
     - Name: "EasyDecks.ai Marketing Platform"
     - Redirect URI: `https://waddrfstpqkvdfwbxvfw.supabase.co/auth/v1/callback`

2. **Configure in Supabase**:
   - Go to your Supabase dashboard
   - Navigate to "Authentication" > "Providers"
   - Enable Azure provider
   - Add your Azure Client ID and Client Secret

## Testing the OAuth System

### 1. Run the Test Script
```bash
node test-oauth-system.js
```

### 2. Test OAuth Flow
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3002/auth/login`
3. Click on any OAuth provider button
4. Complete the OAuth flow
5. Verify you're redirected to the dashboard
6. Check that your profile is created in Supabase

### 3. Test Profile Management
1. Go to `/profile` page
2. Edit your profile information
3. Save changes
4. Verify data is persisted in Supabase

## Database Schema

The system uses these Supabase tables:

### `profiles` Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  company_name TEXT,
  logo_url TEXT,
  brand_colors JSONB,
  industry TEXT,
  target_audience TEXT,
  business_context TEXT,
  key_metrics JSONB,
  data_preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `presentations` Table
```sql
CREATE TABLE presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  template_id TEXT,
  slides JSONB DEFAULT '[]',
  data_sources JSONB DEFAULT '[]',
  narrative_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Environment Variables

Make sure these are set in your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://waddrfstpqkvdfwbxvfw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Next.js Configuration
NEXTAUTH_SECRET=easydecks-secret-key-2024
NEXTAUTH_URL=http://localhost:3002
```

## Features

### Authentication Methods
- **OAuth**: Google, GitHub, Microsoft
- **Traditional**: Email/password registration and login
- **Demo Mode**: No account required for testing

### User Profile Features
- **Company Information**: Name, industry, target audience
- **Business Context**: Goals and objectives
- **Key Metrics**: Important business metrics
- **Branding**: Logo URL and brand colors
- **Data Preferences**: Chart styles, color schemes, narrative style

### Security Features
- **Session Management**: Secure session handling
- **Profile Validation**: Input validation and sanitization
- **Error Handling**: Comprehensive error handling
- **Loading States**: User-friendly loading indicators

## Troubleshooting

### Common Issues

1. **OAuth Redirect Errors**:
   - Verify redirect URIs are correctly configured
   - Check that the callback URL matches exactly

2. **Profile Not Created**:
   - Check Supabase logs for errors
   - Verify the `profiles` table exists and has correct schema

3. **Session Not Persisting**:
   - Check browser console for errors
   - Verify Supabase configuration

4. **API Endpoints Not Working**:
   - Ensure the development server is running
   - Check that all API routes are properly exported

### Debug Mode

Enable debug logging by adding to your `.env.local`:
```env
DEBUG=true
```

This will show detailed authentication logs in the browser console.

## Support

If you encounter issues:

1. Check the browser console for errors
2. Review Supabase logs in the dashboard
3. Run the test script to verify configuration
4. Check that all environment variables are set correctly

The OAuth system is now fully integrated and ready for production use once you configure the OAuth providers in your Supabase dashboard. 