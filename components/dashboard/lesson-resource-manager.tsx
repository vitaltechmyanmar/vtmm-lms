'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  FileText,
  Link,
  Paperclip,
  SlidersHorizontal,
  Plus,
  Trash2,
  Download,
  Loader2,
  Upload,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import type { LessonResource, LessonResourceType } from '@/lib/types'

const RESOURCE_TYPE_CONFIG: Record<LessonResourceType, { label: string; icon: React.ElementType; color: string }> = {
  note: { label: 'Note', icon: FileText, color: 'text-blue-500' },
  slide: { label: 'Slide', icon: SlidersHorizontal, color: 'text-purple-500' },
  file: { label: 'File', icon: Paperclip, color: 'text-orange-500' },
  link: { label: 'Link', icon: Link, color: 'text-green-500' },
}

interface LessonResourceManagerProps {
  lessonId: string
}

export function LessonResourceManager({ lessonId }: LessonResourceManagerProps) {
  const [resources, setResources] = useState<LessonResource[]>([])
  const [loaded, setLoaded] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  async function loadResources() {
    if (loaded) return
    const { data } = await supabase
      .from('lesson_resources')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('order_index', { ascending: true })
    setResources(data || [])
    setLoaded(true)
  }

  function handleOpen(open: boolean) {
    setIsOpen(open)
    if (open) loadResources()
  }

  async function handleAdd(resource: Omit<LessonResource, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('lesson_resources')
      .insert({ ...resource, lesson_id: lessonId, order_index: resources.length })
      .select()
      .single()
    if (error) { toast.error(error.message); return }
    setResources([...resources, data])
    toast.success('Resource added!')
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('lesson_resources').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    setResources(resources.filter(r => r.id !== id))
    toast.success('Resource removed')
  }

  function formatFileSize(bytes: number | null) {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Paperclip className="h-4 w-4" />
          Resources {loaded && resources.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{resources.length}</Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Lesson Resources
          </DialogTitle>
        </DialogHeader>

        {/* Add resource form */}
        <AddResourceForm onAdd={handleAdd} />

        {/* Resource list */}
        <div className="mt-2 space-y-2">
          {!loaded ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : resources.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No resources yet. Add notes, slides, files, or links for students.
            </p>
          ) : (
            resources.map((resource) => {
              const config = RESOURCE_TYPE_CONFIG[resource.type]
              const Icon = config.icon
              return (
                <div
                  key={resource.id}
                  className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
                >
                  <div className={`mt-0.5 flex-shrink-0 ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{resource.title}</span>
                      <Badge variant="outline" className="text-xs">{config.label}</Badge>
                      {resource.file_size && (
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(resource.file_size)}
                        </span>
                      )}
                    </div>
                    {resource.content && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {resource.content}
                      </p>
                    )}
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        {resource.file_name || resource.url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {resource.url && (
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(resource.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---- Add Resource Form ----
interface AddResourceFormProps {
  onAdd: (resource: Omit<LessonResource, 'id' | 'created_at'>) => Promise<void>
}

function AddResourceForm({ onAdd }: AddResourceFormProps) {
  const [type, setType] = useState<LessonResourceType>('file')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [content, setContent] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ url: string; file_name: string; file_size: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload/lesson-resource', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Upload failed'); return }
      setUploadedFile({ url: data.url, file_name: data.file_name, file_size: data.file_size })
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''))
      toast.success('File uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setIsUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    if (type === 'note' && !content.trim()) { toast.error('Note content is required'); return }
    if ((type === 'link') && !url.trim()) { toast.error('URL is required for links'); return }
    if ((type === 'file' || type === 'slide') && !uploadedFile && !url.trim()) {
      toast.error('Please upload a file or enter a URL')
      return
    }

    setIsSaving(true)
    await onAdd({
      lesson_id: '',
      title: title.trim(),
      type,
      url: uploadedFile?.url || url.trim() || null,
      content: content.trim() || null,
      file_name: uploadedFile?.file_name || null,
      file_size: uploadedFile?.file_size || null,
      order_index: 0,
    })
    setTitle('')
    setUrl('')
    setContent('')
    setUploadedFile(null)
    setIsSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-muted/20 p-4 space-y-3">
      <p className="text-sm font-semibold">Add New Resource</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Type</Label>
          <Select value={type} onValueChange={(v) => { setType(v as LessonResourceType); setUploadedFile(null) }}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="file">📎 File (PDF, ZIP, etc.)</SelectItem>
              <SelectItem value="slide">📊 Slide (PPT, PDF)</SelectItem>
              <SelectItem value="note">📝 Note (Text)</SelectItem>
              <SelectItem value="link">🔗 Link (URL)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Title *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resource name"
            className="h-9"
            required
          />
        </div>
      </div>

      {/* File upload for file/slide types */}
      {(type === 'file' || type === 'slide') && (
        <div className="space-y-2">
          <Label className="text-xs">Upload File</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={isUploading}
              className="gap-2"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isUploading ? 'Uploading...' : 'Choose File'}
            </Button>
            {uploadedFile && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                ✅ {uploadedFile.file_name}
                <button type="button" onClick={() => setUploadedFile(null)} className="text-destructive ml-1">✕</button>
              </span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept={type === 'slide' ? '.ppt,.pptx,.pdf' : '*'}
            onChange={handleFileUpload}
          />
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or paste URL</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="h-9"
            disabled={!!uploadedFile}
          />
        </div>
      )}

      {/* URL for link type */}
      {type === 'link' && (
        <div className="space-y-1.5">
          <Label className="text-xs">URL *</Label>
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="h-9"
            required
          />
        </div>
      )}

      {/* Content for note type */}
      {type === 'note' && (
        <div className="space-y-1.5">
          <Label className="text-xs">Note Content *</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your notes here..."
            rows={4}
            className="resize-y"
          />
        </div>
      )}

      <Button type="submit" size="sm" disabled={isSaving || isUploading || !title.trim()} className="gap-2">
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Add Resource
      </Button>
    </form>
  )
}
