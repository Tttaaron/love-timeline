require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Multer: store files in memory (we upload to Supabase Storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('只能上传图片文件'), false);
        }
    }
});

const BUCKET = 'memory-images';

// ===== API Routes =====

// GET all memories with images
app.get('/api/memories', async (req, res) => {
    try {
        let query = supabase
            .from('memories')
            .select('*')
            .order('date', { ascending: true });

        if (req.query.perspective) {
            query = query.eq('perspective', req.query.perspective);
        }

        const { data: memories, error } = await query;

        if (error) throw error;

        // Get images for each memory
        const { data: images, error: imgErr } = await supabase
            .from('memory_images')
            .select('*');

        if (imgErr) throw imgErr;

        // Attach images to memories
        const result = memories.map(m => ({
            ...m,
            images: images
                .filter(img => img.memory_id === m.id)
                .map(img => ({
                    id: img.id,
                    url: `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${img.filename}`
                }))
        }));

        res.json(result);
    } catch (err) {
        console.error('GET /api/memories error:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST create a new memory with images
app.post('/api/memories', upload.array('images', 9), async (req, res) => {
    try {
        const { date, title, description } = req.body;

        // Insert memory record
        const { data: memory, error: memErr } = await supabase
            .from('memories')
            .insert({
                date: date || new Date().toISOString().slice(0, 10),
                title: title || '写下标题 📝',
                description: description || '',
                perspective: req.body.perspective || 'girl'
            })
            .select()
            .single();

        if (memErr) throw memErr;

        // Upload images to Supabase Storage
        const uploadedImages = [];
        for (const file of (req.files || [])) {
            const ext = path.extname(file.originalname) || '.jpg';
            const filename = `${uuidv4()}${ext}`;

            const { error: uploadErr } = await supabase.storage
                .from(BUCKET)
                .upload(filename, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (uploadErr) throw uploadErr;

            // Insert image record
            const { data: imgData, error: imgInsertErr } = await supabase
                .from('memory_images')
                .insert({
                    memory_id: memory.id,
                    filename: filename,
                    original_name: file.originalname
                })
                .select()
                .single();

            if (imgInsertErr) throw imgInsertErr;

            uploadedImages.push({
                id: imgData.id,
                url: `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${filename}`
            });
        }

        res.json({ ...memory, images: uploadedImages });
    } catch (err) {
        console.error('POST /api/memories error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT update memory text
app.put('/api/memories/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { date, title, description } = req.body;

        const updates = {};
        if (date !== undefined) updates.date = date;
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;

        const { data, error } = await supabase
            .from('memories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('PUT /api/memories error:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE a memory and its images
app.delete('/api/memories/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        console.log('Deleting memory id:', id);

        // Get image filenames first
        const { data: images, error: fetchErr } = await supabase
            .from('memory_images')
            .select('filename')
            .eq('memory_id', id);

        if (fetchErr) throw fetchErr;
        console.log('Found images to delete:', images);

        // Delete from storage
        if (images && images.length > 0) {
            const filenames = images.map(img => img.filename);
            const { error: delStorageErr } = await supabase.storage
                .from(BUCKET)
                .remove(filenames);
            if (delStorageErr) console.error('Storage delete warning:', delStorageErr);
        }

        // Delete image records first (child)
        const { error: delImgErr } = await supabase
            .from('memory_images')
            .delete()
            .eq('memory_id', id);
        if (delImgErr) console.error('Image record delete warning:', delImgErr);

        // Delete memory (parent)
        const { error: delErr } = await supabase
            .from('memories')
            .delete()
            .eq('id', id);

        if (delErr) throw delErr;

        console.log('Memory', id, 'deleted successfully');
        res.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/memories error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Fallback: serve index.html for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🏰 Love Timeline server running at http://localhost:${PORT}`);
});
