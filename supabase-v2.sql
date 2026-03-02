-- Run this in Supabase Dashboard → SQL Editor
-- Add perspective column to memories table
ALTER TABLE memories
ADD COLUMN IF NOT EXISTS perspective TEXT DEFAULT 'girl';