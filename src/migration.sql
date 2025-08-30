-- Migration to add location fields to users table
-- Run this script to add location support to existing database

-- Add location columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_location TEXT;

-- Update existing users to have a default location if needed
-- UPDATE users SET location = 'Not specified' WHERE location IS NULL;
