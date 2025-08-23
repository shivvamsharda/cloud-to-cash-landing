-- Update existing profiles to set wallet_address from auth.users metadata
UPDATE profiles 
SET wallet_address = (
  SELECT au.raw_user_meta_data->>'wallet_address'
  FROM auth.users au 
  WHERE au.id = profiles.id
)
WHERE wallet_address IS NULL 
AND EXISTS (
  SELECT 1 FROM auth.users au 
  WHERE au.id = profiles.id 
  AND au.raw_user_meta_data->>'wallet_address' IS NOT NULL
);