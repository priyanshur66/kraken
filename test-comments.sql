-- Test data for the comments table
-- You can run this in your Supabase SQL editor to test the system

-- Insert a test comment
INSERT INTO comments (market_id, wallet_address, content) 
VALUES (1, '0x1234567890123456789012345678901234567890', 'This is a test comment to verify the system is working correctly.');

-- Query to see all comments for market 1
SELECT * FROM comments WHERE market_id = 1 ORDER BY created_at DESC;

-- Delete test data (optional)
-- DELETE FROM comments WHERE wallet_address = '0x1234567890123456789012345678901234567890';
