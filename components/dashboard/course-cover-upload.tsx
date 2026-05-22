'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ImagePlus, Loader2, X, Upload, Link } from 'lucide-react'
import { toast } from 'sonner'

interface CourseCoverUploadProps {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function CourseCoverUpload({ value, onChange, disabled }: CourseCoverUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [urlInput, setUrlInput] = useState(value && !value.startsWith('blob:') ? value : '')
  const [urlError, setUrlError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5 MB')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload/course-cover', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Upload failed')
        return
      }

      onChange(data.url)
      setUrlInput(data.url)
      toast.success('Cover image uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleUrlApply() {
    const trimmed = urlInput.trim()
    if (!trimmed) {
      setUrlError('Please enter a URL')
      return
    }
    try {
      new URL(trimmed)
    } catch {
      setUrlError('Invalid URL format')
      return
    }
    setUrlError('')
    onChange(trimmed)
    toast.success('Cover image URL applied')
  }

  return (
    <div className="space-y-3">
      <Label>Course Cover Photo</Label>

      {/* Preview */}
      {value && (
        <div className="relative overflow-hidden rounded-lg border">
          <img
            src={value}
            alt="Course cover"
            className="aspect-video w-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity hover:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading || disabled}
            >
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Change
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => { onChange(''); setUrlInput('') }}
              disabled={isUploading || disabled}
            >
              <X className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Input tabs — only shown when no image or uploading */}
      {(!value || isUploading) && (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="upload" className="flex-1">
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="url" className="flex-1">
              <Link className="mr-2 h-4 w-4" />
              Paste URL
            </TabsTrigger>
          </TabsList>

          {/* Upload tab */}
          <TabsContent value="upload" className="mt-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading || disabled}
              className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </>
              ) : (
                <>
                  <ImagePlus className="h-10 w-10" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload cover photo</p>
                    <p className="text-xs">PNG, JPG, WEBP up to 5 MB</p>
                  </div>
                </>
              )}
            </button>
          </TabsContent>

          {/* URL tab */}
          <TabsContent value="url" className="mt-3 space-y-2">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/cover-image.jpg"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setUrlError('') }}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlApply())}
                disabled={disabled}
              />
              <Button type="button" onClick={handleUrlApply} disabled={disabled || !urlInput.trim()}>
                Apply
              </Button>
            </div>
            {urlError && <p className="text-xs text-destructive">{urlError}</p>}
            <p className="text-xs text-muted-foreground">
              Paste a direct image URL (Imgur, Cloudinary, etc.)
            </p>
          </TabsContent>
        </Tabs>
      )}

      {/* Change option below preview */}
      {value && !isUploading && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload new file
          </Button>
          <div className="flex flex-1 gap-2">
            <Input
              type="url"
              placeholder="Or paste a new URL..."
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setUrlError('') }}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlApply())}
              disabled={disabled}
              className="h-8 text-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleUrlApply}
              disabled={disabled || !urlInput.trim()}
            >
              Set
            </Button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading || disabled}
      />
    </div>
  )
}
