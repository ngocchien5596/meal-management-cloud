import express, { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router: Router = Router();

// Configuration for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), 'uploads/reviews');
        console.log('📁 Target upload path:', uploadPath);
        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            console.log('✨ Creating uploads directory...');
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let ext = path.extname(file.originalname);

        // Safety: If no extension from filename, try mimetype
        if (!ext && file.mimetype) {
            ext = '.' + file.mimetype.split('/')[1];
        }

        cb(null, uniqueSuffix + (ext || '.jpg'));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit (client should compress to <1MB, but safety first)
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

import cloudinary from '../lib/cloudinary.js';

// Route: POST /api/upload/image
router.post('/image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET;

        if (hasCloudinary) {
            console.log('☁️ Uploading to Cloudinary:', req.file.path);

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'review_images',
                use_filename: true,
                unique_filename: true
            });

            console.log('✅ Cloudinary upload success:', result.secure_url);

            // Cleanup local file after upload
            try {
                fs.unlinkSync(req.file.path);
                console.log('🗑️ Local file cleaned up');
            } catch (unlinkError) {
                console.error('⚠️ Failed to delete local temp file:', unlinkError);
            }

            return res.json({
                success: true,
                url: result.secure_url,
                public_id: result.public_id,
                mimetype: req.file.mimetype,
                size: req.file.size
            });
        } else {
            // FALLBACK TO LOCAL STORAGE
            console.log('🏠 Cloudinary credentials missing. Using local storage fallback.');

            // The file is already saved in uploads/reviews/[filename] by multer
            // We return a relative path that the frontend can resolve
            const relativePath = `/static/uploads/reviews/${req.file.filename}`;

            return res.json({
                success: true,
                url: relativePath,
                isLocal: true,
                mimetype: req.file.mimetype,
                size: req.file.size
            });
        }
    } catch (error) {
        console.error('🔥 Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

export default router;
