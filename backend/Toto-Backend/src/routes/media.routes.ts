import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middlewares/auth.middleware';
import { MediaUploadService } from '../services/mediaUpload.service';
import { Readable } from 'stream';

const router = Router();
const mediaUploadService = new MediaUploadService();

// Memory storage — file goes into req.file.buffer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

// POST /media/upload — accepts any file (audio, image, video)
router.post('/upload', authMiddleware, upload.single('file'), async (req: any, res: any) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided. Use field name "file".' });
        }

        const { mimetype, buffer, size } = req.file;
        const sessionId = (req as any).user?.id || 'unknown';

        // Determine media type from mime
        let mediaType = 'document';
        if (mimetype.startsWith('audio/')) mediaType = 'audio';
        else if (mimetype.startsWith('image/')) mediaType = 'image';
        else if (mimetype.startsWith('video/')) mediaType = 'video';

        const stream = Readable.from(buffer);
        const url = await mediaUploadService.uploadMedia(stream, mimetype, String(sessionId), mediaType, size);

        res.status(200).json({ url, mimeType: mimetype, mediaType, size });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export const mediaRoutes = router;
