/**
 * Direct-to-S3 file uploads (phase P6). In production the backend hands back
 * a presigned POST and the browser uploads straight to S3 — the file never
 * transits our API server. In local/test dev (no S3 bucket configured) the
 * presign endpoint returns 501 and the caller should fall back to a plain
 * multipart POST to the resource's own create/update endpoint instead.
 */
import { apiFetch, ApiError } from '../lib/api';

export class DirectUploadNotSupported extends Error {}

interface PresignedPost {
  url: string;
  fields: Record<string, string>;
  key: string;
}

/** Uploads `file` straight to S3 via a presigned POST obtained from `presignPath`.
 * Returns the storage-relative key to send back as `file_key`/`media_file_key`. */
export async function uploadFileDirect(file: File, presignPath: string): Promise<string> {
  let presigned: PresignedPost;
  try {
    presigned = await apiFetch<PresignedPost>(presignPath, {
      method: 'POST',
      json: { filename: file.name, contentType: file.type || 'application/octet-stream' },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 501) {
      throw new DirectUploadNotSupported('Direct S3 upload is not configured in this environment.');
    }
    throw err;
  }

  const form = new FormData();
  Object.entries(presigned.fields).forEach(([key, value]) => form.append(key, value));
  form.append('file', file);

  const res = await fetch(presigned.url, { method: 'POST', body: form });
  if (!res.ok) {
    throw new Error(`Upload to cloud storage failed (${res.status}).`);
  }
  return presigned.key;
}
