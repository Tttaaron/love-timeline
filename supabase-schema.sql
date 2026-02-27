-- Supabase SQL: Run this in Supabase Dashboard → SQL Editor
-- Memories table
CREATE TABLE IF NOT EXISTS memories (
    id BIGSERIAL PRIMARY KEY,
    date TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '写下标题 📝',
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Memory images table
CREATE TABLE IF NOT EXISTS memory_images (
    id BIGSERIAL PRIMARY KEY,
    memory_id BIGINT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT
);
-- Enable Row Level Security (allow all for simplicity - personal project)
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on memories" ON memories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on memory_images" ON memory_images FOR ALL USING (true) WITH CHECK (true);