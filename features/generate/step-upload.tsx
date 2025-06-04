"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

export default function StepUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setSelectedFiles((prev) => [...prev, ...newFiles])

      // Create preview URLs
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file))
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls])
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles]
    const newPreviewUrls = [...previewUrls]

    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(newPreviewUrls[index])

    newFiles.splice(index, 1)
    newPreviewUrls.splice(index, 1)

    setSelectedFiles(newFiles)
    setPreviewUrls(newPreviewUrls)
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-6">Upload Your Photos</h2>
          <p className="text-muted-foreground mb-6">
            Upload 5-10 photos of yourself for the best results. The more variety in your photos, the better your
            headshots will turn out.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="font-medium">Photo Requirements</h3>

              <div className="flex items-start gap-3">
                <div className="size-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=64&width=64"
                    alt="Selfie example"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">Selfies</p>
                  <p className="text-xs text-muted-foreground">
                    Upload frontal selfies that are well-lit and taken at eye-level
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=64&width=64"
                    alt="Variety example"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">Variety</p>
                  <p className="text-xs text-muted-foreground">Upload photos in different outfits and backgrounds.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=64&width=64"
                    alt="Recency example"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">Recency</p>
                  <p className="text-xs text-muted-foreground">
                    Upload recent photos from the last 6 months that feature similar hairstyles and lengths.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=64&width=64"
                    alt="Clear example"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">Clear</p>
                  <p className="text-xs text-muted-foreground">
                    Upload photos taken from a good distance, ideally taken from the chest or waist up.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Photo Restrictions</h3>

              <div className="flex items-start gap-3">
                <div className="size-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=64&width=64"
                    alt="No Low-Quality Photos example"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">No Low-Quality Photos</p>
                  <p className="text-xs text-muted-foreground">
                    Don't upload photos that are blurry, cropped, or too dark / bright
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=64&width=64"
                    alt="No Revealing Clothes example"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">No Revealing Clothes</p>
                  <p className="text-xs text-muted-foreground">
                    Don't upload photos with low necklines, or in skimpy outfits
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=64&width=64"
                    alt="No Accessories example"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">No Accessories</p>
                  <p className="text-xs text-muted-foreground">
                    Avoid photos of you with hats, sunglasses, headphones, lanyards, etc.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=64&width=64"
                    alt="No Unnatural Angles example"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">No Unnatural Angles</p>
                  <p className="text-xs text-muted-foreground">
                    Avoid photos taken from the side, or where you're looking away
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                  <Image
                    src={url || "/placeholder.svg"}
                    alt={`Uploaded photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-background/80 backdrop-blur-sm rounded-full p-1"
                    onClick={() => removeFile(index)}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}

              {previewUrls.length < 10 && (
                <div className="relative aspect-square rounded-md border border-dashed flex flex-col items-center justify-center">
                  <Upload className="size-6 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{selectedFiles.length} of 10 photos uploaded</p>
              <div className="relative">
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 size-4" />
                  Add More Photos
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
