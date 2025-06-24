# Profile System Migration Plan - 2024-12-22-1430

## Overview
This document outlines the comprehensive migration plan to implement a robust profile system with retrieve/sync/update flywheel for the marketing deck platform.

## Issues Identified
1. **Missing Supabase Client Exports**: `createServerClient` export doesn't exist
2. **Incomplete Database Schema**: Missing profile columns for new features
3. **No Profile Service**: Lack of centralized profile management
4. **No Retrieve/Sync/Update Flywheel**: Missing data synchronization logic

## Migration Files Created

### 1. Database Migration
**File**: `supabase-comprehensive-profile-migration-2024-12-22-1430.sql`
**Purpose**: Add all missing profile columns and set up proper database structure

**New Columns Added**:
- `bio` - User bio/description
- `phone` - User phone number
- `target_audience` - User's target audience description
- `business_context` - User's business context and background
- `master_system_prompt` - User's custom system prompt for AI interactions
- `key_metrics` - User's key business metrics as JSON array
- `logo_url` - URL to user's company logo
- `profile_picture_url` - URL to user's profile picture
- `preferences` - User preferences as JSON object
- `last_login` - Last login timestamp
- `login_count` - Login counter
- `is_active` - Account active status
- `email_verified` - Email verification status
- `timezone` - User timezone
- `language` - User language preference
- `notification_settings` - Notification preferences

### 2. Profile Service
**File**: `lib/services/profile-service.ts`
**Purpose**: Centralized profile management with retrieve/sync/update flywheel

**Key Features**:
- **Caching**: In-memory cache with configurable timeout
- **Retrieve**: Fetch profile from database or cache
- **Sync**: Synchronize with auth data and external sources
- **Update**: Update profile with validation
- **Create**: Create new profiles with defaults
- **Validation**: Built-in validation with custom rules

### 3. Updated Client Types
**File**: `lib/supabase/client.ts`
**Purpose**: Updated TypeScript types to match new schema

### 4. Fixed Server Client
**File**: `lib/supabase/server-client.ts`
**Purpose**: Fixed export issues and added backward compatibility

### 5. Updated API Route
**File**: `app/api/user/profile/update/route.ts`
**Purpose**: Updated to use new profile service and correct imports

## Implementation Steps

### Step 1: Run Database Migration
```bash
# Connect to your Supabase project and run the migration
psql -h your-project.supabase.co -U postgres -d postgres -f supabase-comprehensive-profile-migration-2024-12-22-1430.sql
```

### Step 2: Verify Migration
```sql
-- Check that all columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
```

### Step 3: Test Profile Service
```typescript
import { profileService } from '@/lib/services/profile-service'

// Test the retrieve/sync/update flywheel
const profile = await profileService.getOrCreateProfile(userId)
console.log('Profile:', profile)

// Test update
const updated = await profileService.updateProfile(userId, {
  bio: 'Updated bio',
  company_name: 'New Company'
})
console.log('Updated:', updated)
```

### Step 4: Update Frontend Components
Update any profile-related components to use the new service:

```typescript
import { getProfile, updateProfile } from '@/lib/services/profile-service'

// In your components
const profile = await getProfile(userId)
const updated = await updateProfile(userId, { bio: 'New bio' })
```

## Retrieve/Sync/Update Flywheel

### Retrieve Phase
1. Check in-memory cache first
2. If cache miss, fetch from database
3. Update cache with fresh data
4. Return profile data

### Sync Phase
1. Compare current profile with auth data
2. Check for email/name updates from auth
3. Update profile if discrepancies found
4. Log sync activities

### Update Phase
1. Validate input data
2. Update database record
3. Invalidate cache
4. Log update activities
5. Return updated profile

## Error Handling

### Database Errors
- Connection failures
- Constraint violations
- Permission errors

### Validation Errors
- Required field missing
- Field length exceeded
- Invalid data types

### Cache Errors
- Cache corruption
- Memory issues
- Timeout problems

## Monitoring and Logging

### Event Logging
- Profile creation events
- Profile update events
- Sync events
- Error events

### Performance Monitoring
- Cache hit/miss ratios
- Database query performance
- API response times

### Security Monitoring
- Unauthorized access attempts
- Suspicious update patterns
- Data validation failures

## Testing Strategy

### Unit Tests
- Profile service methods
- Validation functions
- Cache operations

### Integration Tests
- API route functionality
- Database operations
- Auth integration

### End-to-End Tests
- Complete profile workflow
- Error scenarios
- Performance under load

## Rollback Plan

### Database Rollback
```sql
-- Remove new columns (if needed)
ALTER TABLE profiles DROP COLUMN IF EXISTS bio;
ALTER TABLE profiles DROP COLUMN IF EXISTS phone;
-- ... repeat for other columns
```

### Code Rollback
- Revert to previous client types
- Remove profile service
- Restore old API routes

## Performance Considerations

### Caching Strategy
- 5-minute cache timeout (configurable)
- LRU eviction for memory management
- Cache warming for active users

### Database Optimization
- Indexes on frequently queried columns
- Connection pooling
- Query optimization

### API Optimization
- Response compression
- Request batching
- Rate limiting

## Security Considerations

### Row Level Security
- Users can only access their own profiles
- Proper RLS policies in place
- Audit logging for all operations

### Input Validation
- Server-side validation for all inputs
- SQL injection prevention
- XSS protection

### Data Privacy
- Sensitive data encryption
- GDPR compliance
- Data retention policies

## Future Enhancements

### Planned Features
- Profile versioning
- Bulk profile operations
- Advanced search/filtering
- Profile analytics
- Integration with external systems

### Scalability Improvements
- Redis caching
- Database sharding
- CDN for profile images
- Microservice architecture

## Support and Maintenance

### Monitoring
- Set up alerts for errors
- Monitor performance metrics
- Track user engagement

### Documentation
- API documentation
- User guides
- Developer documentation

### Training
- Team training on new system
- Best practices documentation
- Troubleshooting guides

## Conclusion

This migration plan provides a comprehensive solution for the profile system issues. The retrieve/sync/update flywheel ensures data consistency, while the new service layer provides a clean API for profile management. The database migration adds all necessary columns for current and future features.

**Next Steps**:
1. Review and approve the migration plan
2. Schedule the database migration
3. Deploy the updated code
4. Monitor system performance
5. Train team on new features 