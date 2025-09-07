-- Migration to add missing columns to profiles table
-- Run this script to add the missing columns to your existing database

-- Add partner_expectations column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_expectations TEXT;

-- Add missing interest columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interest_4 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interest_4_desc TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interest_5 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interest_5_desc TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interest_6 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interest_6_desc TEXT;

-- Update existing records to have default values for the new required columns
UPDATE profiles SET 
  partner_expectations = 'Looking for someone who shares my interests and values.',
  interest_4 = 'General',
  interest_4_desc = 'General interest',
  interest_5 = 'General',
  interest_5_desc = 'General interest',
  interest_6 = 'General',
  interest_6_desc = 'General interest'
WHERE partner_expectations IS NULL;

-- Make the columns NOT NULL after setting default values
ALTER TABLE profiles ALTER COLUMN partner_expectations SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN interest_4 SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN interest_4_desc SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN interest_5 SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN interest_5_desc SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN interest_6 SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN interest_6_desc SET NOT NULL;


