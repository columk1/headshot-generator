'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActionState, useRef, useState } from 'react';
import { deleteAccount } from '@/app/(login)/actions';
import type { User } from '@/lib/db/schema';
import { generateHeadshot } from '@/lib/ai/actions';
import type { ActionState } from '@/lib/auth/middleware';
import { useImageForm } from '@/hooks/useImageForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { imageSchema, type ImageData } from '@/lib/schemas/zod.schema';
import { signUploadForm } from '@/lib/cloudinary';
import { IMG_UPLOAD_URL } from '@/lib/constants';
import { z } from 'zod';

type Generation = {
  id: number;
  storagePath: string;
  imageUrl: string;
  createdAt: number;
};

type GenerationState = ActionState & {
  imageUrl?: string;
};

export function Dashboard({ initialGenerations }: { initialGenerations: Generation[] }) {
  const [generations, setGenerations] = useState<Generation[]>(initialGenerations);
  const [error, setError] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [generateState, generateAction, isGeneratePending] = useActionState<
    GenerationState,
    FormData
  >(generateHeadshot, { error: '', success: '' });
  const [removeState, removeAction, isRemovePending] = useActionState<
    ActionState,
    FormData
  >(deleteAccount, { error: '', success: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadButtonClick = () => {
    fileInputRef?.current?.click();
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      await imageSchema.parseAsync(file)
      const optimisticUrl = URL.createObjectURL(file)
      setImage(optimisticUrl)
      setUploading(true)

      const options = { eager: 'c_fit,h_1920,w_1920', folder: 'headshot/inputs' }
      const signData = await signUploadForm(options)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', signData.apiKey)
      formData.append('timestamp', signData.timestamp)
      formData.append('signature', signData.signature)
      // biome-ignore lint/complexity/noForEach: Cleaner
      Object.entries(options).forEach(([key, value]) => formData.append(key, value))

      const res = await fetch(IMG_UPLOAD_URL, { method: 'POST', body: formData })
      const data = await res.json()

      setImageUrl(data.secure_url)
      setUploading(false)
    } catch (err) {
      if (err instanceof z.ZodError) {
        // toast(err.issues[0]?.message)
        console.error(err.issues[0]?.message)
      } else {
        // toast('Oops! Something went wrong. Please try again.')
        console.error('Oops! Something went wrong. Please try again.')
      }
      setImage(null)
      resetFileInput()
    }
  }


  const getUserDisplayName = (user: Pick<User, 'id' | 'email'>) => {
    return user.email || 'Unknown User';
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* <h1 className="text-lg lg:text-2xl font-medium mb-6">Generate</h1> */}
      {/* Card to start a new generation */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Start a New Generation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Upload your photo and select from the options below.
          </p>
          <form action={generateAction}>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="image">Picture</Label>
              <div className="flex w-full max-w-md items-center space-x-2">
                <Input ref={fileInputRef} id="image" type="file" accept="image/*" className='border-border border' onChange={handleFileChange} />
                <Input type="hidden" name="image" value={imageUrl} />
                <Button type='submit' variant="default" disabled={!imageUrl || isGeneratePending}>
                  Generate Headshots
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card >

      <h2 className="text-xl font-medium mb-4">Current Generation</h2>
      {generateState.error && <p className="text-red-500">{generateState.error}</p>}
      {generateState.imageUrl && <img src={generateState.imageUrl} alt="Current Generation" className="w-full max-h-48 object-contain rounded" />}

      <h2 className="text-xl font-medium mb-4">Your Previous Generations</h2>
      {error && <p className="text-red-500">{error}</p>}
      {
        generations.length === 0 && (
          <p>No generations found. Start a new one!</p>
        )
      }
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {generations.map((gen) => (
          <Card key={gen.id}>
            <CardHeader>
              <CardTitle>Generation #{gen.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                // src={gen.storagePath}
                src={gen.imageUrl}
                alt={`Generation ${gen.id}`}
                className="w-full h-48 object-cover rounded"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                {new Date(gen.createdAt * 1000).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => window.open(gen.storagePath, '_blank')}
              >
                View / Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section >
  );
}
