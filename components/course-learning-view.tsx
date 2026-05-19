'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Play,
  FileText,
  Menu,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Course, Lesson, Enrollment, LessonProgress } from '@/lib/types'

interface CourseLearningViewProps {
  course: Course & { lessons: Lesson[] }
  enrollment: Enrollment
  lessonProgress: LessonProgress[]
  userId: string
}

export function CourseLearningView({
  course,
  enrollment,
  lessonProgress,
  userId,
}: CourseLearningViewProps) {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(lessonProgress.filter(lp => lp.completed).map(lp => lp.lesson_id))
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const currentLesson = course.lessons[currentLessonIndex]
  const progressPercentage = Math.round(
    (completedLessons.size / course.lessons.length) * 100
  )

  useEffect(() => {
    // Find first incomplete lesson
    const firstIncomplete = course.lessons.findIndex(
      lesson => !completedLessons.has(lesson.id)
    )
    if (firstIncomplete !== -1) {
      setCurrentLessonIndex(firstIncomplete)
    }
  }, [])

  async function markLessonComplete(lessonId: string) {
    if (completedLessons.has(lessonId)) return

    const { error } = await supabase.from('lesson_progress').upsert({
      user_id: userId,
      lesson_id: lessonId,
      course_id: course.id,
      completed: true,
      completed_at: new Date().toISOString(),
    })

    if (error) {
      toast.error('Failed to save progress')
      return
    }

    const newCompleted = new Set(completedLessons)
    newCompleted.add(lessonId)
    setCompletedLessons(newCompleted)

    // Update enrollment progress
    const newProgress = Math.round((newCompleted.size / course.lessons.length) * 100)
    await supabase
      .from('enrollments')
      .update({ progress_percentage: newProgress })
      .eq('id', enrollment.id)

    toast.success('Lesson completed!')

    // Check if course is complete
    if (newCompleted.size === course.lessons.length) {
      toast.success('Congratulations! You completed the course!')
      // Could trigger certificate generation here
    }
  }

  function goToNextLesson() {
    if (currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1)
    }
  }

  function goToPreviousLesson() {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1)
    }
  }

  function getYouTubeEmbedUrl(url: string): string | null {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    )
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }

  function getVimeoEmbedUrl(url: string): string | null {
    const match = url.match(/vimeo\.com\/(\d+)/)
    return match ? `https://player.vimeo.com/video/${match[1]}` : null
  }

  function getEmbedUrl(url: string): string | null {
    return getYouTubeEmbedUrl(url) || getVimeoEmbedUrl(url)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="hidden font-semibold sm:inline">LearnHub</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            <Progress value={progressPercentage} className="w-32" />
            <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
          </div>
          <Link href={`/courses/${course.id}`}>
            <Button variant="outline" size="sm">
              Exit Course
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-14 left-0 z-40 w-80 transform border-r bg-background transition-transform lg:static lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <h2 className="font-semibold line-clamp-2">{course.title}</h2>
              <p className="text-sm text-muted-foreground">
                {completedLessons.size} of {course.lessons.length} lessons completed
              </p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2">
                {course.lessons.map((lesson, index) => {
                  const isCompleted = completedLessons.has(lesson.id)
                  const isCurrent = index === currentLessonIndex
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setCurrentLessonIndex(index)
                        setIsSidebarOpen(false)
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle className={`h-5 w-5 ${isCurrent ? 'text-primary-foreground' : 'text-primary'}`} />
                        ) : (
                          <Circle className={`h-5 w-5 ${isCurrent ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {index + 1}. {lesson.title}
                        </p>
                        {lesson.duration_minutes > 0 && (
                          <p className={`text-xs ${isCurrent ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {lesson.duration_minutes} min
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {currentLesson ? (
            <div className="mx-auto max-w-4xl p-6">
              {/* Video Player */}
              {currentLesson.video_url && (
                <div className="mb-6 aspect-video overflow-hidden rounded-lg bg-black">
                  {getEmbedUrl(currentLesson.video_url) ? (
                    <iframe
                      src={getEmbedUrl(currentLesson.video_url)!}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white">
                      <Play className="h-16 w-16" />
                    </div>
                  )}
                </div>
              )}

              {/* Lesson Title */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
                <p className="text-muted-foreground">
                  Lesson {currentLessonIndex + 1} of {course.lessons.length}
                </p>
              </div>

              {/* Lesson Content */}
              {currentLesson.content && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Lesson Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <p className="whitespace-pre-wrap">{currentLesson.content}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={goToPreviousLesson}
                  disabled={currentLessonIndex === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={() => {
                    markLessonComplete(currentLesson.id)
                    goToNextLesson()
                  }}
                  disabled={completedLessons.has(currentLesson.id) && currentLessonIndex === course.lessons.length - 1}
                >
                  {completedLessons.has(currentLesson.id) ? (
                    currentLessonIndex < course.lessons.length - 1 ? (
                      <>
                        Next Lesson
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      'Course Complete!'
                    )
                  ) : (
                    <>
                      Mark Complete & Continue
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No lessons available</p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}
