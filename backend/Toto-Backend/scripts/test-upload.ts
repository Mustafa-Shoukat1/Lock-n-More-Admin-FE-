
import { MediaUploadService } from '../src/services/mediaUpload.service';
import { Readable } from 'stream';

const runTest = async () => {
    console.log('🚀 Starting Media Upload Test...');

    const service = new MediaUploadService();
    const dummyContent = Buffer.from('Hello, DigitalOcean Spaces! This is a test file.');
    const stream = Readable.from(dummyContent);

    // Mock data
    const mimeType = 'text/plain';
    const sessionId = 'test-session-123';
    const mediaType = 'document';

    try {
        console.log('📤 Uploading test file...');
        const url = await service.uploadMedia(stream, mimeType, sessionId, mediaType);
        console.log('✅ Upload Successful!');
        console.log('🔗 Public URL:', url);
    } catch (error: any) {
        console.error('❌ Upload Failed:', error.message);
        console.error('Stack:', error.stack);
    }
};

runTest();
