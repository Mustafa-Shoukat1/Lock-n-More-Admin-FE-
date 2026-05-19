import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const region = process.env.DO_SPACES_REGION || 'sgp1';
const endpoint = process.env.DO_SPACES_ENDPOINT || `https://${region}.digitaloceanspaces.com`;
const accessKeyId = process.env.DO_SPACES_KEY;
const secretAccessKey = process.env.DO_SPACES_SECRET;

if (!accessKeyId || !secretAccessKey) {
    console.warn('⚠️ DigitalOcean Spaces credentials missing! Media upload will fail.');
}

export const s3Client = new S3Client({
    region,
    endpoint,
    credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || ''
    },
    forcePathStyle: false // Spaces requires this to be false usually, or handled by the SDK logic for custom endpoints
});

export const SPACE_BUCKET = process.env.DO_SPACES_BUCKET || 'toto-storage';
