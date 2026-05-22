'use client'

import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Loader2,
  ArrowLeft,
  Plus,
  GripVertical,
  Trash2,
  Play,
  FileText,
  ChevronUp,
  ChevronDown,
  X,
  Globe,
  Tag,
  BookOpen,
  ListChecks,
  ClipboardList,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { QuizBuilder } from '@/components/dashboard/quiz-builder'
import { CourseCoverUpload } from '@/components/dashboard/course-cover-upload'
import { LessonResourceManager } from '@/components/dashboard/lesson-resource-manager'
import { formatMMK, formatMMKAmount, parseMMK } from '@/lib/format-currency'
import type { Course, Lesson, CourseLevel, Category } from '@/lib/types'

interface CourseEditorProps {
  course: Course & { lessons: Lesson[] }
  isAdmin?: boolean
}

const LANGUAGES = [
  'English',
  'Burmese',
  'Chinese',
  'Japanese',
  'Korean',
  'Spanish',
  'French',
  'German',
  'Arabic',
  'Hindi',
  'Thai',
  'Vietnamese',
]

export function CourseEditor({ course, isAdmin = false }: CourseEditorProps) {
  const [title, setTitle] = useState(course.title)
  const [description, setDescription] = useState(course.description || '')
  const [category, setCategory] = useState(course.category || '')
  const [level, setLevel] = useState<CourseLevel>(course.level)
  const [priceInCents, setPriceInCents] = useState(course.price_in_cents.toString())
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnail_url || '')
  const [language, setLanguage] = useState(course.language || 'English')
  const [isPublished, setIsPublished] = useState(course.is_published)
  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const router = useRouter()
  const supabase = createClient()

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
      setCategories(data || [])
    }
    fetchCategories()
  }, [supabase])

  // Learning outcomes & requirements
  const [objectives, setObjectives] = useState<string[]>(course.what_you_will_learn || [])
  const [newObjective, setNewObjective] = useState('')
  const [requirements, setRequirements] = useState<string[]>(course.requirements || [])
  const [newRequirement, setNewRequirement] = useState('')

  // Tags
  const [tags, setTags] = useState<string[]>(course.tags || [])
  const [newTag, setNewTag] = useState('')

  // Lessons
  const [lessons, setLessons] = useState<Lesson[]>(course.lessons)
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [openQuizLessonId, setOpenQuizLessonId] = useState<string | null>(null)

  // ---- Course save ----
  async function handleSaveCourse() {
    setIsSaving(true)
    const { error } = await supabase
      .from('courses')
      .update({
        title,
        description,
        category,
        level,
        price_in_cents: parseMMK(priceInCents),
        thumbnail_url: thumbnailUrl || null,
        is_published: isPublished,
        language,
        what_you_will_learn: objectives,
        requirements,
        tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', course.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Course saved!')
    }
    setIsSaving(false)
  }

  // ---- Delete course ----
  async function handleDeleteCourse() {
    const { error } = await supabase.from('courses').delete().eq('id', course.id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Course deleted')
      router.push('/dashboard/courses')
    }
  }

  // ---- Objectives ----
  function addObjective() {
    const trimmed = newObjective.trim()
    if (!trimmed) return
    setObjectives([...objectives, trimmed])
    setNewObjective('')
  }

  function removeObjective(index: number) {
    setObjectives(objectives.filter((_, i) => i !== index))
  }

  // ---- Requirements ----
  function addRequirement() {
    const trimmed = newRequirement.trim()
    if (!trimmed) return
    setRequirements([...requirements, trimmed])
    setNewRequirement('')
  }

  function removeRequirement(index: number) {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  // ---- Tags ----
  function addTag() {
    const trimmed = newTag.trim().toLowerCase()
    if (!trimmed || tags.includes(trimmed)) return
    setTags([...tags, trimmed])
    setNewTag('')
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag))
  }

  // ---- Lessons ----
  async function handleAddLesson(lessonData: Partial<Lesson>) {
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        course_id: course.id,
        title: lessonData.title,
        content: lessonData.content || null,
        video_url: lessonData.video_url || null,
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
    setIsLessonDialogOpen(false)
    toast.success('Lesson added!')
  }

  async function handleUpdateLesson(lessonId: string, lessonData: Partial<Lesson>) {
    const { error } = await supabase
      .from('lessons')
      .update({
        title: lessonData.title,
        content: lessonData.content || null,
        video_url: lessonData.video_url || null,
        duration_minutes: lessonData.duration_minutes || 0,
      })
      .eq('id', lessonId)

    if (error) {
      toast.error(error.message)
      return
    }

    setLessons(lessons.map(l => (l.id === lessonId ? { ...l, ...lessonData } : l)))
    setEditingLesson(null)
    setIsEditDialogOpen(false)
    toast.success('Lesson updated!')
  }

  async function handleDeleteLesson(lessonId: string) {
    const { error } = await supabase.from('lessons').delete().eq('id', lessonId)
    if (error) {
      toast.error(error.message)
      return
    }
    const updated = lessons.filter(l => l.id !== lessonId)
    // Re-index remaining lessons
    await reindexLessons(updated)
    toast.success('Lesson deleted!')
  }

  async function moveLesson(index: number, direction: 'up' | 'down') {
    const newLessons = [...lessons]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newLessons.length) return
    ;[newLessons[index], newLessons[targetIndex]] = [newLessons[targetIndex], newLessons[index]]
    await reindexLessons(newLessons)
  }

  async function reindexLessons(updatedLessons: Lesson[]) {
    const reindexed = updatedLessons.map((l, i) => ({ ...l, order_index: i }))
    setLessons(reindexed)

    // Persist order to DB
    await Promise.all(
      reindexed.map(l =>
        supabase.from('lessons').update({ order_index: l.order_index }).eq('id', l.id)
      )
    )
  }

  const totalDuration = lessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/courses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-balance">{course.title}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={isPublished ? 'default' : 'secondary'}>
                {isPublished ? 'Published' : 'Draft'}
              </Badge>
              {isAdmin && (
                <Badge variant="outline" className="text-xs">
                  Admin view
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} id="published" />
            <Label htmlFor="published" className="cursor-pointer">
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this course?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the course along with all its lessons, enrollments,
                  and progress data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCourse}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Course
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Lessons</p>
              <p className="text-xl font-bold">{lessons.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Play className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-xl font-bold">{totalDuration}m</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Language</p>
              <p className="text-xl font-bold">{language}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Tag className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-xl font-bold">
                {formatMMK(parseFloat(priceInCents || '0'))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="curriculum">
            Curriculum ({lessons.length})
          </TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          <TabsTrigger value="tags">Tags & Meta</TabsTrigger>
        </TabsList>

        {/* ---- DETAILS TAB ---- */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Complete Python Bootcamp"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Describe what students will learn..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length > 0 ? (
                        categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Programming">Programming</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Data Science">Data Science</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select value={level} onValueChange={v => setLevel(v as CourseLevel)}>
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

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (MMK)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="1000"
                    value={priceInCents}
                    onChange={e => setPriceInCents(e.target.value)}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">Set to 0 for a free course. Enter amount in Myanmar Kyat (MMK)</p>
                </div>
              </div>

              {/* Cover Photo — upload or URL */}
              <CourseCoverUpload
                value={thumbnailUrl}
                onChange={setThumbnailUrl}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- CURRICULUM TAB ---- */}
        <TabsContent value="curriculum" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>
                  {lessons.length} lessons &bull; {totalDuration} minutes total
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
                    <DialogDescription>Create a lesson with video and/or text content</DialogDescription>
                  </DialogHeader>
                  <LessonForm
                    key="add-lesson"
                    onSubmit={handleAddLesson}
                    onCancel={() => setIsLessonDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {lessons.length > 0 ? (
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="rounded-lg border bg-card"
                    >
                    <div className="flex items-center gap-3 p-4">
                      <GripVertical className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                      <div className="flex w-8 flex-shrink-0 flex-col gap-0.5">
                        <button
                          onClick={() => moveLesson(index, 'up')}
                          disabled={index === 0}
                          className="flex items-center justify-center rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          aria-label="Move lesson up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveLesson(index, 'down')}
                          disabled={index === lessons.length - 1}
                          className="flex items-center justify-center rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          aria-label="Move lesson down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{lesson.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {lesson.video_url ? (
                            <span className="flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              Video
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Text
                            </span>
                          )}
                          {(lesson.duration_minutes ?? 0) > 0 && (
                            <span>{lesson.duration_minutes} min</span>
                          )}
                        </div>
                      </div>
                      {/* Edit lesson */}
                      <Dialog
                        open={isEditDialogOpen && editingLesson?.id === lesson.id}
                        onOpenChange={open => {
                          if (!open) {
                            setIsEditDialogOpen(false)
                            setEditingLesson(null)
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingLesson(lesson)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Lesson</DialogTitle>
                            <DialogDescription>Update lesson content and settings</DialogDescription>
                          </DialogHeader>
                          {editingLesson?.id === lesson.id && (
                            <LessonForm
                              key={`edit-${lesson.id}`}
                              lesson={editingLesson}
                              onSubmit={data => handleUpdateLesson(lesson.id, data)}
                              onCancel={() => {
                                setIsEditDialogOpen(false)
                                setEditingLesson(null)
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      {/* Delete lesson */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete lesson?</AlertDialogTitle>
                            <AlertDialogDescription>
                              &ldquo;{lesson.title}&rdquo; will be permanently deleted along with
                              all student progress for this lesson.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {/* Quiz toggle */}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Manage quiz"
                        onClick={() =>
                          setOpenQuizLessonId(
                            openQuizLessonId === lesson.id ? null : lesson.id
                          )
                        }
                        className={openQuizLessonId === lesson.id ? 'text-primary' : ''}
                      >
                        <ClipboardList className="h-4 w-4" />
                      </Button>
                      {/* Resources */}
                      <LessonResourceManager lessonId={lesson.id} />
                    </div>
                    {/* Quiz panel */}
                    {openQuizLessonId === lesson.id && (
                      <div className="border-t px-4 pb-4 pt-3">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Quiz for: {lesson.title}
                        </p>
                        <QuizBuilder lessonId={lesson.id} lessonTitle={lesson.title} />
                      </div>
                    )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No lessons yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Add your first lesson to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- OUTCOMES TAB ---- */}
        <TabsContent value="outcomes" className="space-y-4">
          {/* Learning Objectives */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                What Students Will Learn
              </CardTitle>
              <CardDescription>
                List the key skills and knowledge students gain from this course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newObjective}
                  onChange={e => setNewObjective(e.target.value)}
                  placeholder="e.g. Build real-world Python applications"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                />
                <Button type="button" onClick={addObjective} variant="secondary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {objectives.length > 0 ? (
                <ul className="space-y-2">
                  {objectives.map((obj, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm"
                    >
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-medium">
                        {i + 1}
                      </span>
                      <span className="flex-1">{obj}</span>
                      <button
                        onClick={() => removeObjective(i)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remove objective"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No learning objectives added yet. Students appreciate knowing what they will gain.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements & Prerequisites</CardTitle>
              <CardDescription>
                What students should know or have before taking this course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newRequirement}
                  onChange={e => setNewRequirement(e.target.value)}
                  placeholder="e.g. Basic computer skills"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement} variant="secondary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {requirements.length > 0 ? (
                <ul className="space-y-2">
                  {requirements.map((req, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm"
                    >
                      <span className="flex-1">{req}</span>
                      <button
                        onClick={() => removeRequirement(i)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remove requirement"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No prerequisites listed. If this course requires prior knowledge, add it here.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- TAGS TAB ---- */}
        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </CardTitle>
              <CardDescription>
                Add tags to help students discover your course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder="e.g. python, beginner, web"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="secondary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1 px-3 py-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-muted-foreground hover:text-destructive"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No tags added yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Course meta info */}
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Course ID</span>
                <span className="font-mono text-xs">{course.id}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(course.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{new Date(course.updated_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={isPublished ? 'default' : 'secondary'}>
                  {isPublished ? 'Published' : 'Draft'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ---- Lesson Form ----

interface LessonFormProps {
  lesson?: Lesson
  onSubmit: (data: Partial<Lesson>) => Promise<void>
  onCancel: () => void
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null
  const match = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
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
  const [durationMinutes, setDurationMinutes] = useState(
    lesson?.duration_minutes?.toString() || ''
  )
  const [isLoading, setIsLoading] = useState(false)

  const embedUrl = getEmbedUrl(videoUrl)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setIsLoading(true)
    await onSubmit({
      title: title.trim(),
      content: content.trim() || null,
      video_url: videoUrl.trim() || null,
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
          onChange={e => setTitle(e.target.value)}
          placeholder="Introduction to the topic"
          required
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="videoUrl">YouTube / Vimeo URL</Label>
        <Input
          id="videoUrl"
          type="url"
          value={videoUrl}
          onChange={e => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        {embedUrl && (
          <div className="mt-2 aspect-video overflow-hidden rounded-lg border bg-black">
            <iframe
              src={embedUrl}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video preview"
            />
          </div>
        )}
        {videoUrl && !embedUrl && (
          <p className="text-sm text-destructive">
            Invalid URL. Please use a YouTube or Vimeo link.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lessonContent">Text Content</Label>
        <Textarea
          id="lessonContent"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={6}
          placeholder="Write lesson notes, instructions, or supplementary material..."
          className="min-h-[140px] resize-y"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          min="0"
          value={durationMinutes}
          onChange={e => setDurationMinutes(e.target.value)}
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
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
