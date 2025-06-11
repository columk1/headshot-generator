'use client';

import { Button } from '@/components/ui/button';
import { downloadImage } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CircleCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle } from 'lucide-react';
import { useActionState, useRef, useState, useEffect, useCallback } from 'react';
import { deleteAccount } from '@/app/(login)/actions';
import type { User } from '@/lib/db/schema';
import type { ActionState } from '@/lib/auth/middleware';
import { useImageForm } from '@/hooks/useImageForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { imageSchema, type ImageData } from '@/lib/schemas/zod.schema';
import { signUploadForm } from '@/lib/cloudinary';
import { IMG_UPLOAD_URL } from '@/lib/constants';
import { z } from 'zod';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { processGenerationOrder } from '@/lib/payments/actions';
import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { useGenerationPolling, type Generation } from '@/hooks/use-generation-polling';

// Background options with thumbnail URLs
const backgroundOptions = [
  { id: 'neutral', label: 'Neutral', thumbnail: '/backgrounds/neutral.jpg' },
  { id: 'office', label: 'Office', thumbnail: '/backgrounds/office.jpg' },
  { id: 'city', label: 'City', thumbnail: '/backgrounds/city.jpg' },
  { id: 'nature', label: 'Nature', thumbnail: '/backgrounds/nature.jpg' },
];

type GenerationState = ActionState & {
  imageUrl?: string;
}

export function Dashboard({ initialGenerations, pendingGeneration }: { initialGenerations: Generation[]; pendingGeneration: Generation | null }): ReactElement {
  const [generations, setGenerations] = useState<Generation[]>(initialGenerations);
  const [error, setError] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  // Using default values for the radio groups
  const defaultGender = 'male';
  const defaultBackground = 'neutral';

  const [generateState, generateAction, isGeneratePending] = useActionState<
    GenerationState,
    FormData
  >(processGenerationOrder, { error: '', success: '' });
  const [removeState, removeAction, isRemovePending] = useActionState<
    ActionState,
    FormData
  >(deleteAccount, { error: '', success: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  // Use the custom hook for generation polling
  const { pollingStatus } = useGenerationPolling(pendingGeneration);

  const handleUploadButtonClick = (): void => {
    fileInputRef.current?.click();
  };

  const resetFileInput = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
  };


  const getUserDisplayName = (user: Pick<User, 'id' | 'email'>) => {
    return user.email || 'Unknown User';
  };

  // Display polling status if active
  const renderPollingStatus = (): ReactElement | null => {
    if (!pollingStatus) return null;

    return (
      <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
        <LoaderCircle className="size-4 animate-spin" />
        <span>{pollingStatus}</span>
      </div>
    );
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create Your Professional Headshot</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={generateAction} className="space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Upload Your Photo</Label>
                <div className="flex items-center gap-4">
                  <div className="relative h-32 w-32 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-700 overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Preview</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 flex flex-col items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleUploadButtonClick}
                      disabled={uploading}
                      className="gap-2 min-w-28"
                    >
                      {uploading ? (
                        <LoaderCircle className="size-4 animate-spin text-white" />
                      ) : 'Choose File'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {image && !uploading ? <CircleCheck className="h-5 w-5 text-primary" /> : 'JPG or PNG, max 10MB'}
                    </p>
                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Input type="hidden" name="inputImageUrl" value={imageUrl} />
                  </div>
                </div>
              </div>

              {/* Gender Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium block mb-2">Gender</Label>
                <RadioGroup
                  name="gender"
                  defaultValue={defaultGender}
                  className="flex gap-3 w-fit"
                >
                  <div>
                    <RadioGroupItem
                      value="male"
                      id="male"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="male"
                      className="flex items-center justify-center rounded-md border border-muted bg-popover px-6 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="font-medium">Male</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="female"
                      id="female"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="female"
                      className="flex items-center justify-center rounded-md border border-muted bg-popover px-6 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="font-medium">Female</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Background Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium block mb-2">Background Style</Label>
                <RadioGroup
                  name="background"
                  defaultValue={defaultBackground}
                  className="grid grid-cols-4 gap-3 w-full"
                >
                  {backgroundOptions.map((option) => (
                    <div key={option.id}>
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={option.id}
                        className="flex flex-col items-center justify-between rounded-lg border border-muted bg-popover p-2 hover:bg-black/25 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer w-full"
                      >
                        <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center text-xs text-muted-foreground">
                            {option.label}
                          </div>
                        </div>
                        <span className="text-sm font-medium">{option.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <Input type="hidden" name="product" value="headshotBasic" />

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={!imageUrl || uploading || isGeneratePending}
                  className="w-full"
                >
                  {isGeneratePending ? <LoaderCircle className="size-4 animate-spin text-white" /> : 'Generate'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {renderPollingStatus()}
        <h2 className="text-xl font-medium mb-4">Current Generation</h2>
        {generateState.error && <p className="text-red-500">{generateState.error}</p>}
        {generateState.imageUrl && <img src={generateState.imageUrl} alt="Current Generation" className="max-h-48 object-contain rounded" />}

        <h2 className="text-xl font-medium mb-4">Your Previous Generations</h2>
        {error && <p className="text-red-500">{error}</p>}
        {
          generations.length === 0 && (
            <p>No generations found. Start a new one!</p>
          )
        }
        // <button type="button" onClick={() => router.refresh()}>Refresh</button>
        // <button type="button" onClick={() => router.push('/dashboard')}>Push</button>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {generations.map((gen, i) => (
            <Card key={gen.id}>
              <CardHeader>
                <CardTitle>Generation #{i + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                {gen.imageUrl ? (
                  <img
                    src={gen.imageUrl}
                    alt={`Generation ${gen.id}`}
                    className="w-full aspect-square object-cover rounded"
                  />
                ) : (
                  <div className="w-full aspect-square bg-muted flex items-center justify-center rounded">
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                )}
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
                  onClick={() => gen.imageUrl && downloadImage(gen.imageUrl, `generation-${gen.id}.jpg`)}
                  disabled={!gen.imageUrl}
                >
                  View / Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section >
  );
}
