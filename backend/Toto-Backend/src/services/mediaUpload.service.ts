import { Upload } from '@aws-sdk/lib-storage';
import { s3Client, SPACE_BUCKET } from '../config/spaces.config';
import { Readable } from 'stream';
import mime from 'mime-types';
import path from 'path';

export class MediaUploadService {
    /**
     * Uploads a media stream to DigitalOcean Spaces
     * @param stream The readable stream of the file
     * @param mimeType The MIME type of the file
     * @param sessionId The session ID (mongo ID or other identifier) to organize files
     * @param mediaType The broad type of media (image, audio, video, document)
     * @returns The public URL of the uploaded file
     */
    async uploadMedia(stream: Readable | Buffer, mimeType: string, sessionId: string, mediaType: string, mediaSize?: number): Promise<string> {
        try {
            const extension = mime.extension(mimeType) || 'bin';
            const timestamp = Date.now();
            // Key format: sessions/{sessionId}/{mediaType}/{timestamp}.{ext}
            const key = `sessions/${sessionId}/${mediaType}/${timestamp}.${extension}`;

            const upload = new Upload({
                client: s3Client,
                params: {
                    Bucket: SPACE_BUCKET,
                    Key: key,
                    Body: stream,
                    ContentType: mimeType,
                    ACL: 'public-read', // Make it publicly accessible via CDN
                    // Add ContentLength if available to prevent InvalidArgument on some S3 providers (like DO Spaces)
                    ...(mediaSize ? { ContentLength: mediaSize } : {})
                }
            });

            await upload.done();

            // Construct the public URL
            // Assuming the endpoint in config is like https://sgp1.digitaloceanspaces.com
            // and bucket is 'toto-storage', result is https://toto-storage.sgp1.digitaloceanspaces.com/key
            // OR if using CDN custom domain, it might be different. 
            // Standard format: https://{bucket}.{region}.digitaloceanspaces.com/{key}

            // Let's rely on the endpoint configuration or construct it reliably
            const region = process.env.DO_SPACES_REGION || 'sgp1';
            const endpoint = process.env.DO_SPACES_ENDPOINT || `https://${region}.digitaloceanspaces.com`;

            // Standard Spaces URL construction
            // If the endpoint contains the bucket, good, otherwise prepend it.
            // Actually, usually it's `https://{bucket}.{endpoint_domain}/{key}`

            // However, DigitalOcean Spaces often uses: https://{bucket}.{region}.digitaloceanspaces.com
            // The `endpoint` usually passed to SDK is `https://{region}.digitaloceanspaces.com`

            // If the user has a custom CDN subdomain, they might strictly want that.
            // For now, I will map it to the direct bucket URL which is effectively the CDN URL if CDN is enabled on the Space.

            const publicUrl = `https://${SPACE_BUCKET}.${region}.digitaloceanspaces.com/${key}`;

            return publicUrl;
        } catch (error: any) {
            console.error('Error uploading to Spaces:', error);
            throw new Error(`Media upload failed: ${error.message}`);
        }
    }
}
