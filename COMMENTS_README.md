# Comments System Setup and Usage

## Overview
This implementation adds a comments system to market pages where users can discuss markets and share their insights that might influence betting decisions.

## Setup Instructions

### 1. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL schema from `supabase-schema.sql` to create the comments table
4. Optionally, run the test queries from `test-comments.sql` to verify everything works

### 2. Environment Variables
Make sure your `.env` file contains:
```env
# Frontend (exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Backend (server-side only)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Note: For development, if you don't have the service role key, the system will fall back to using the anon key.

### 3. Dependencies
The following packages are installed:
- `@supabase/supabase-js` - Supabase JavaScript client

## Architecture

### Backend API (`/api/comments`)
- **GET** `/api/comments?marketId={id}` - Fetch comments for a market
- **POST** `/api/comments` - Create a new comment

The API validates:
- Wallet address format (must be valid Ethereum address)
- Content length (max 1000 characters)
- Required fields

### Frontend Components
- **Comments Component** (`/components/Comments.tsx`)
  - Displays comments for a market
  - Allows authenticated users to post comments
  - Shows user's own comments with special styling
  - Integrates with existing Web3Context and ToastContext

### Database
- **comments table** with the following fields:
  - `id` (UUID, primary key)
  - `market_id` (integer, references market)
  - `wallet_address` (text, Ethereum address)
  - `content` (text, max 1000 chars)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

## Security Features

1. **No Direct Database Access**: Frontend never communicates directly with Supabase
2. **API Validation**: All inputs are validated on the server side
3. **Wallet Verification**: Comments are tied to wallet addresses
4. **Content Limits**: 1000 character limit prevents spam
5. **SQL Injection Protection**: Using Supabase's query builder

## Usage

### For Users
1. Connect wallet to the app
2. Navigate to any market page
3. Scroll down to see the "Market Discussion" section
4. Write comments to share insights about the market
5. View other users' comments and discussions

### For Developers
The comments system is automatically included on all market detail pages. The `Comments` component is integrated into `/app/market/[id]/page.tsx`.

## Features

- **Real-time Comments**: Comments appear immediately after posting
- **User Identification**: Comments show abbreviated wallet addresses
- **Own Comment Highlighting**: User's own comments are highlighted
- **Character Counter**: Shows remaining characters while typing
- **Loading States**: Proper loading indicators
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Responsive Design**: Works on all device sizes

## Future Enhancements

1. **Pagination**: For markets with many comments
2. **Reply System**: Threaded replies to comments
3. **Voting/Likes**: Allow users to vote on helpful comments
4. **Moderation**: Report inappropriate comments
5. **Rich Text**: Support for formatting in comments
6. **Notifications**: Notify users of replies to their comments

## Testing

1. Run the test SQL queries in Supabase
2. Connect your wallet on a market page
3. Post a test comment
4. Verify it appears immediately
5. Check that your comment is highlighted differently
6. Test with multiple wallets to see different user interactions

## Troubleshooting

### Common Issues

1. **Comments not loading**
   - Check Supabase URL and keys in environment variables
   - Verify the comments table exists in your database
   - Check browser console for API errors

2. **Cannot post comments**
   - Ensure wallet is properly connected
   - Check that the wallet address is valid
   - Verify content is under 1000 characters

3. **API errors**
   - Check server logs for detailed error messages
   - Verify environment variables are set correctly
   - Ensure Supabase project is active and accessible

### Development Notes

- The system uses the anon key for development if service role key is not available
- In production, always use the service role key for better security
- Comments are stored with lowercase wallet addresses for consistency
- The system is designed to work without RLS (Row Level Security) for simplicity
