-- Comments table for market discussions
-- Users can comment on markets to push narratives that benefit their positions

CREATE TABLE comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id integer NOT NULL,
  wallet_address text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for efficient querying by market_id
CREATE INDEX idx_comments_market_id ON comments(market_id);

-- Create index for querying by wallet address
CREATE INDEX idx_comments_wallet_address ON comments(wallet_address);

-- Create index for ordering by creation time
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Optional: Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add some constraints for data validation
ALTER TABLE comments 
ADD CONSTRAINT check_content_length 
CHECK (char_length(content) > 0 AND char_length(content) <= 1000);

ALTER TABLE comments 
ADD CONSTRAINT check_wallet_address_format 
CHECK (wallet_address ~* '^0x[a-f0-9]{40}$');
