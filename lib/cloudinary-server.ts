// Server-only Cloudinary uploader utilities
'use server'

import 'server-only'

import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from 'cloudinary'

function getCloudinaryConfig(): void {
  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const API_KEY = process.env.CLOUDINARY_API_KEY ?? process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
  const API_SECRET = process.env.CLOUDINARY_API_SECRET // must be server-only
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    const missing = [
      !CLOUD_NAME ? 'CLOUDINARY_CLOUD_NAME (or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)' : null,
      !API_KEY ? 'CLOUDINARY_API_KEY (or NEXT_PUBLIC_CLOUDINARY_API_KEY)' : null,
      !API_SECRET ? 'CLOUDINARY_API_SECRET' : null,
    ].filter(Boolean).join(', ')
    throw new Error(`Cloudinary environment variables are not defined. Missing: ${missing}`)
  }
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  })
}

interface UploadFromUrlParams {
  readonly fileUrl: string
  readonly folder: string
  readonly publicId?: string
}

interface UploadFromUrlResult {
  readonly secureUrl: string
  readonly publicId: string
}

export async function uploadImageFromUrl(params: UploadFromUrlParams): Promise<UploadFromUrlResult> {
  getCloudinaryConfig()

  const { fileUrl, folder, publicId } = params

  const uploadOptions: UploadApiOptions = {
    folder,
    public_id: publicId,
    overwrite: true,
  }

  // Basic retry logic for transient errors
  const maxAttempts = 3
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res: UploadApiResponse = await cloudinary.uploader.upload(fileUrl, uploadOptions)
      return { secureUrl: res.secure_url, publicId: res.public_id }
    } catch (err: unknown) {
      const isLast = attempt === maxAttempts
      // eslint-disable-next-line no-console
      console.error('Cloudinary upload error', { attempt, fileUrl, folder, publicId, err })
      if (isLast) throw err
      await new Promise((r) => setTimeout(r, attempt * 500))
    }
  }

  // Fallback (should be unreachable)
  throw new Error('Cloudinary upload failed after retries')
}
