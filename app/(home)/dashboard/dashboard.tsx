'use client';

import { Button } from '@/components/ui/button';
import { downloadImage } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CircleCheck, AlertTriangle, Info } from 'lucide-react';
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
import { revalidate } from '@/lib/ai/actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { retryGeneration } from '@/lib/ai/actions';

// Background options with thumbnail URLs
const backgroundOptions = [
  { id: 'white', label: 'White', thumbnail: '/images/bg-white.jpg' },
  { id: 'black', label: 'Black', thumbnail: '/images/bg-black.jpg' },
  { id: 'gray', label: 'Gray', thumbnail: '/images/bg-gray.jpg' },
  { id: 'office', label: 'Office', thumbnail: '/images/bg-office.jpg' },
];

const defaultGender = 'male';
const defaultBackground = 'white';

type GenerationState = ActionState & {
  imageUrl?: string;
}

export function Dashboard({ generations, pendingGeneration }: { generations: Generation[]; pendingGeneration: Generation | null }): ReactElement {
  // const [generations, setGenerations] = useState<Generation[]>(initialGenerations);
  const completedGenerations = generations.filter(g => g.status === 'COMPLETED');
  const failedGenerations = generations.filter(g => g.status === 'FAILED');
  const [error, setError] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [formOpen, setFormOpen] = useState(generations.length === 0 ? "1" : "");
  const [selectedBackground, setSelectedBackground] = useState(defaultBackground);

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

  const { pollingStatus } = useGenerationPolling(pendingGeneration);

  const [retryError, setRetryError] = useState<Record<number, string>>({});

  async function handleRetry(formData: FormData): Promise<void> {
    const result = await retryGeneration(formData);
    const generationId = Number(formData.get('generationId'));

    if (result.error) {
      setRetryError(prev => ({ ...prev, [generationId]: result.error }));
    } else {
      setRetryError(prev => {
        const newErrors = { ...prev };
        delete newErrors[generationId];
        return newErrors;
      });
    }
  }

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

      // Do NOT send folder from the client. The server signer enforces a per-user folder.
      const options = { eager: 'c_fit,h_1920,w_1920' }
      const signData = await signUploadForm(options)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', signData.apiKey)
      formData.append('timestamp', signData.timestamp)
      formData.append('signature', signData.signature)
      // Folder must match what the server signed
      if (signData.folder) {
        formData.append('folder', signData.folder)
      }
      // biome-ignore lint/complexity/noForEach: Cleaner
      Object.entries(options).forEach(([key, value]) => formData.append(key, value))

      const res = await fetch(IMG_UPLOAD_URL, { method: 'POST', body: formData })
      if (!res.ok) {
        throw new Error('Cloudinary upload failed')
      }
      const data = await res.json()

      const secureUrl = typeof data.secure_url === 'string' ? data.secure_url : ''
      if (!secureUrl) {
        throw new Error('Cloudinary did not return a secure_url')
      }

      setImageUrl(secureUrl)
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
      // Keep hidden input controlled
      setImageUrl('')
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
        <Accordion type="single" collapsible value={formOpen} onValueChange={setFormOpen}>
          <AccordionItem value="1">
            <CardHeader className="px-6 py-0">
              <AccordionTrigger className="cursor-pointer hover:no-underline items-center">
                <CardTitle className="text-xl font-medium">Create Your Professional Headshot</CardTitle>
              </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <form action={generateAction} className="space-y-6 lg:col-span-2">
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
                              {image && !uploading ? <CircleCheck className="h-5 w-5 text-primary" /> : uploading ? 'Analyzing...' : 'JPG or PNG, max 10MB'}
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
                          value={selectedBackground}
                          onValueChange={setSelectedBackground}
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
                                className="flex flex-col items-center justify-between rounded-lg border border-muted bg-muted/30 p-2 hover:bg-black/25 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer w-full"
                              >
                                <div className="w-full aspect-square rounded-lg overflow-hidden">
                                  {option.thumbnail ? (
                                    <img
                                      src={option.thumbnail}
                                      alt={`${option.label} background`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center text-xs text-muted-foreground">
                                      {option.label}
                                    </div>
                                  )}
                                </div>
                                <span className="text-sm font-medium pt-1">{option.label}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        <Input type="hidden" name="background" value={selectedBackground} />
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

                  {/* Tips Aside */}
                  <aside className="rounded-lg border bg-muted/30 p-4 lg:p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="size-4 text-primary" aria-hidden="true" />
                      <h3 className="text-sm font-medium">Upload tips</h3>
                    </div>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                      <li>Well-lit selfies from chest/waist up taken at eye-level, work best.</li>
                      <li>Avoid low-quality or AI-generated images, revealing clothes, accessories, or unnatural angles.</li>
                      <li>Use recent photos (within the last 6 months) with a hairstyle and length similar to what you want in your headshot.</li>
                    </ul>
                  </aside>
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>


      <div className="space-y-4">
        {renderPollingStatus()}
        {generateState.error && <p className="text-red-500">{generateState.error}</p>}
        {generateState.imageUrl && (
          <img
            src={generateState.imageUrl}
            alt="Current Generation"
            className="max-h-48 object-contain rounded"
          />
        )}

        <h2 className="text-xl font-medium mb-4">Your Generations</h2>
        {error && <p className="text-red-500">{error}</p>}
        {/* <div className="flex gap-2">
          <button type="button" onClick={() => router.refresh()}>Refresh</button>
          <button type="button" onClick={() => router.push('/dashboard')}>Push</button>
          <button type="button" onClick={() => revalidate()}>Revalidate</button>
          <button type="button" onClick={() => setFormOpen('')}>Collapse</button>
        </div> */}

        {generations.length === 0 ? (
          <div className="w-full text-center text-muted-foreground">
            No generations yet. Upload a photo to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completedGenerations.map((gen, i) => (
              <Card key={gen.id}>
                <CardHeader>
                  {/* <CardTitle>Generation #{generations.length - i}</CardTitle> */}
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
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {failedGenerations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Failed generations</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {failedGenerations.map((gen) => (
                <Card key={`failed-${gen.id}`} className="border-destructive/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-destructive">
                      <AlertTriangle className="size-4" />
                      Generation failed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="w-full aspect-square bg-muted flex items-center justify-center rounded">
                      <p className="text-muted-foreground text-sm">No image generated</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Something went wrong while generating your headshot. You can retry now, or contact support and we'll help you out.
                    </p>
                    {retryError[gen.id] && (
                      <p className="text-sm text-destructive font-medium">
                        {retryError[gen.id]}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <form action={handleRetry} className="flex-1">
                        <input type="hidden" name="generationId" value={gen.id} />
                        <Button type="submit" className="w-full">Retry</Button>
                      </form>
                      <Button asChild variant="outline">
                        <a href="mailto:support@bizportraits.com?subject=Headshot%20generation%20failed&body=Generation%20ID%3A%20" aria-label="Contact support">
                          Contact support
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
