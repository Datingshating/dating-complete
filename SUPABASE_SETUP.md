# Supabase Setup Guide

## Overview
This guide will help you connect your dating app to Supabase instead of a local PostgreSQL database.

## Prerequisites
- Supabase account (free tier available)
- Your Supabase project URL and anon key

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Note down your project URL and anon key

## Step 2: Set Up Environment Variables

### Server Environment Variables
Create or update your `.env` file in the `server` directory:

```env
# Supabase Configuration
VITE_SUPERBASE_URL=your_supabase_project_url
VITE_SUPERBASE_ANON_KEY=your_supabase_anon_key

# Other existing variables
CORS_ORIGIN=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
WHATSAPP_NUMBER=+919631126841
```

### Client Environment Variables
Create or update your `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:8080
VITE_SUPERBASE_URL=your_supabase_project_url
VITE_SUPERBASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Set Up Database Schema

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `server/src/supabase-schema.sql`
4. Run the SQL script

This will create all the necessary tables:
- `users` - User accounts and authentication
- `profiles` - User profile information
- `connection_requests` - Connection requests between users
- `matches` - Successful matches
- `conversations` - Chat conversations
- `messages` - Chat messages
- `user_packs` - Subscription packs
- `payment_orders` - Payment tracking

## Step 4: Verify Connection

1. Start your server:
   ```bash
   cd server
   npm run dev
   ```

2. Test the connection by visiting:
   ```
   http://localhost:8080/api/test-db
   ```

3. You should see a success message indicating Supabase connection is working.

## Step 5: Test the Application

1. Start your client:
   ```bash
   cd client
   npm run dev
   ```

2. Try registering a new user
3. Check your Supabase dashboard to see if the data is being stored

## Database Schema Details

### Users Table
- Stores user registration information
- Includes location fields for the new location feature
- Handles authentication with login_id and password_hash

### Profiles Table
- Stores detailed profile information
- Linked to users table via user_id
- Contains bio, interests, and relationship status

### Connection Requests
- Tracks connection requests between users
- Includes message content and status

### Matches
- Stores successful matches
- Ensures unique pairs with constraints

### Chat System
- Conversations table for chat sessions
- Messages table for individual messages
- Real-time capable with Supabase

## Security Features

The schema includes:
- Row Level Security (RLS) enabled on all tables
- Proper foreign key constraints
- Input validation and sanitization
- Password hashing with bcrypt

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify your Supabase URL and anon key
   - Check if your Supabase project is active
   - Ensure CORS is properly configured

2. **Table Not Found**
   - Run the schema script in Supabase SQL Editor
   - Check table names match exactly

3. **Permission Denied**
   - Verify RLS policies are set correctly
   - Check if your anon key has proper permissions

4. **Environment Variables Not Loading**
   - Restart your server after updating .env
   - Verify variable names match exactly

### Testing Database Connection

You can test the connection using the built-in endpoint:

```bash
curl http://localhost:8080/api/test-db
```

Expected response:
```json
{
  "ok": true,
  "message": "Supabase connection successful",
  "supabase_url": "Set",
  "supabase_key": "Set"
}
```

## Migration from Local PostgreSQL

If you're migrating from a local PostgreSQL database:

1. Export your data from the local database
2. Import the data into Supabase using the SQL Editor
3. Update your environment variables
4. Test all functionality

## Performance Considerations

- Supabase provides automatic scaling
- Built-in connection pooling
- Real-time subscriptions available
- Automatic backups included

## Next Steps

1. Test all app functionality
2. Set up proper RLS policies for production
3. Configure real-time subscriptions if needed
4. Set up monitoring and alerts

## Support

If you encounter issues:
1. Check Supabase documentation
2. Verify your environment variables
3. Test with the provided endpoints
4. Check server logs for detailed error messages
