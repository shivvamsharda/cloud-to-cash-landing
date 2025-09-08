-- Create time_slots table for tracking daily slot usage
CREATE TABLE public.time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('free', 'nft')),
  minutes_used INTEGER NOT NULL DEFAULT 0,
  multiplier DECIMAL NOT NULL DEFAULT 1.0,
  slot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  nft_mint TEXT, -- Optional: link to specific NFT for NFT slots
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one record per user per slot type per day
  UNIQUE(user_id, slot_type, slot_date, nft_mint)
);

-- Enable RLS
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

-- RLS policies for time_slots
CREATE POLICY "Users can view their own time slots" 
ON public.time_slots 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time slots" 
ON public.time_slots 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time slots" 
ON public.time_slots 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add columns to profiles for daily slot tracking
ALTER TABLE public.profiles 
ADD COLUMN daily_free_slot_used INTEGER DEFAULT 0,
ADD COLUMN last_slot_reset DATE DEFAULT CURRENT_DATE;

-- Create function to get user's daily slots
CREATE OR REPLACE FUNCTION public.get_user_daily_slots(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    free_slot_used INTEGER DEFAULT 0;
    nft_slots_used INTEGER DEFAULT 0;
    total_nfts INTEGER DEFAULT 0;
    result JSON;
BEGIN
    -- Check if we need to reset daily slots (new day)
    UPDATE profiles 
    SET daily_free_slot_used = 0, last_slot_reset = CURRENT_DATE
    WHERE id = target_user_id AND last_slot_reset < CURRENT_DATE;
    
    -- Get current free slot usage
    SELECT COALESCE(daily_free_slot_used, 0) 
    INTO free_slot_used
    FROM profiles 
    WHERE id = target_user_id;
    
    -- Get NFT slot usage for today (sum of all NFT slots used)
    SELECT COALESCE(SUM(minutes_used), 0)
    INTO nft_slots_used
    FROM time_slots
    WHERE user_id = target_user_id 
    AND slot_type = 'nft' 
    AND slot_date = CURRENT_DATE;
    
    -- Calculate total available NFT slots (we'll get this from frontend for now)
    -- This will be updated when we integrate with actual NFT data
    
    -- Return slot information
    SELECT json_build_object(
        'user_id', target_user_id,
        'free_slot_minutes_used', free_slot_used,
        'free_slot_minutes_remaining', GREATEST(0, 10 - free_slot_used),
        'nft_slot_minutes_used', nft_slots_used,
        'date', CURRENT_DATE,
        'free_slot_multiplier', 0.5,
        'nft_slot_multiplier', 10.0
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Create trigger for time_slots updated_at
CREATE TRIGGER update_time_slots_updated_at
BEFORE UPDATE ON public.time_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();