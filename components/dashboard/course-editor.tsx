'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, ArrowLeft, Plus, GripVertical, Trash2, Play, FileText } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { Course, Lesson, CourseLevel } from '@/lib/types'

interface CourseEditorProps {
  course: Course & { lessons: Lesson[] }
}

const categories = [
  'Programming',
  'Design',
  'Business',
  'Marketing',
  'Photography',
  'Music',
  'Health',
  'Language',
  'Other',
]

export function CourseEditor({ course }: CourseEditorProps) {
  const [title, setTitle] = useState(course.title)
  const [description, setDescription] = useState(course.description || '')
  const [category, setCategory] = useState(course.category || '')
  const [level, setLevel] = useState<CourseLevel>(course.level)
  const [priceInCents, setPriceInCents] = useState((course.price_in_cents / 100).toString())
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnail_url || '')
  const [isPublished, setIsPublished] = useState(course.is_published)
  const [isSaving, setIsSaving] = useState(false)
  const [lessons, setLessons] = useState<Lesson[]>(course.lessons)
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

  const router = useRouter()
  const supabase = createClient()

  async function handleSaveCourse() {
    setIsSaving(true)

    const { error } = await supabase
      .from('courses')
      .update({
        title,
        description,
        category,
        level,
        price_in_cents: Math.round(parseFloat(priceInCents || '0') * 100),
        thumbnail_url: thumbnailUrl || null,
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq('id', course.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Course saved successfully!')
    }

    setIsSaving(false)
  }

  async function handleAddLesson(lessonData: Partial<Lesson>) {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          course_id: course.id,
          title: lessonData.title,
          content: lessonData.content,
          video_url: lessonData.video_url,
          duration_minutes: lessonData.duration_minutes || 0,
          order_index: lessons.length,
        })
        .select()
        .single()

      if (error) {
        toast.error(error.message)
        return
      }

      setLessons([...lessons, data])
      toast.success('Lesson added!')
    } catch (err) {
      console.error('lesson add error:', err)
      toast.error('Failed to add lesson')
    } finally {
      setIsLessonDialogOpen(false)
    }
  }

  async function handleUpdateLesson(lessonId: string, lessonData: Partial<Lesson>) {
    const { error } = await supabase
      .from('lessons')
      .update({
        title: lessonData.title,
        content: lessonData.content,
        video_url: lessonData.video_url,
        duration_minutes: lessonData.duration_minutes,
      })
      .eq('id', lessonId)

    if (error) {
      toast.error(error.message)
      return
    }

    setLessons(lessons.map(l => l.id === lessonId ? { ...l, ...lessonData } : l))
    setEditingLesson(null)
    toast.success('Lesson updated!')
  }

  async function handleDeleteLesson(lessonId: string) {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId)

    if (error) {
      toast.error(error.message)
      return
    }

    setLessons(lessons.filter(l => l.id !== lessonId))
    toast.success('Lesson deleted!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/courses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Course</h1>
            <p className="text-muted-foreground">{course.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={isPublished}
              onCheckedChange={setIsPublished}
              id="published"
            />
            <Label htmlFor="published">
              {isPublished ? 'Published' : 'Draft'}
            </Label>
          </div>
          <Button onClick={handleSaveCourse} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="lessons">Lessons ({lessons.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select value={level} onValueChange={(v) => setLevel(v as CourseLevel)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={priceInCents}
                  onChange={(e) => setPriceInCents(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Course Lessons</CardTitle>
                <CardDescription>
                  Add and manage lessons for your course
                </CardDescription>
              </div>
              <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Lesson
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Lesson</DialogTitle>
                    <DialogDescription>
                      Create a new lesson with video and text content
                    </DialogDescription>
                  </DialogHeader>
                  <LessonForm onSubmit={handleAddLesson} onCancel={() => setIsLessonDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {lessons.length > 0 ? (
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-4 rounded-lg border p-4"
                    >
                      <div className="cursor-move text-muted-foreground">
                        <GripVertical className="h-5 w-5" />
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{lesson.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {lesson.video_url ? (
                            <span className="flex items-center gap-1">
                              <Play className="h-3 w-3" /> Video
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" /> Text
                            </span>
                          )}
                          {lesson.duration_minutes > 0 && (
                            <span>{lesson.duration_minutes} min</span>
                          )}
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setEditingLesson(lesson)}>
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Lesson</DialogTitle>
                            <DialogDescription>
                              Update lesson content and video
                            </DialogDescription>
                          </DialogHeader>
                          <LessonForm
                            lesson={lesson}
                            onSubmit={(data) => handleUpdateLesson(lesson.id, data)}
                            onCancel={() => setEditingLesson(null)}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No lessons yet</h3>
                  <p className="text-muted-foreground">
                    Add your first lesson to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface LessonFormProps {
  lesson?: Lesson
  onSubmit: (data: Partial<Lesson>) => void
  onCancel: () => void
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  )
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

function getVimeoEmbedUrl(url: string): string | null {
  if (!url) return null
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? `https://player.vimeo.com/video/${match[1]}` : null
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null
  return getYouTubeEmbedUrl(url) || getVimeoEmbedUrl(url)
}

function LessonForm({ lesson, onSubmit, onCancel }: LessonFormProps) {
  const [title, setTitle] = useState(lesson?.title || '')
  const [content, setContent] = useState(lesson?.content || '')
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url || '')
  const [durationMinutes, setDurationMinutes] = useState(lesson?.duration_minutes?.toString() || '')
  const [isLoading, setIsLoading] = useState(false)

  const embedUrl = getEmbedUrl(videoUrl)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    await onSubmit({
      title,
      content,
      video_url: videoUrl || null,
      duration_minutes: parseInt(durationMinutes) || 0,
    })
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="lessonTitle">Lesson Title *</Label>
        <Input
          id="lessonTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Introduction to the topic"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="videoUrl">YouTube Video Link</Label>
        <Input
          id="videoUrl"
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        />
        <p className="text-xs text-muted-foreground">
          Paste a YouTube or Vimeo link to embed the video
        </p>
        
        {/* YouTube Video Preview */}
        {embedUrl && (
          <div className="mt-3 overflow-hidden rounded-lg border bg-black">
            <div className="aspect-video">
              <iframe
                src={embedUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video preview"
              />
            </div>
          </div>
        )}
        
        {videoUrl && !embedUrl && (
          <p className="mt-2 text-sm text-destructive">
            Invalid video URL. Please use a YouTube or Vimeo link.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lessonContent">Text Content</Label>
        <Textarea
          id="lessonContent"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="Write your lesson content here. You can explain concepts, provide instructions, or add supplementary material to complement the video."
          className="min-h-[150px] resize-y"
        />
        <p className="text-xs text-muted-foreground">
          Add written content to accompany the video lesson
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          min="0"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          placeholder="10"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isLoading || !title.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : lesson ? (
            'Update Lesson'
          ) : (
            'Add Lesson'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
