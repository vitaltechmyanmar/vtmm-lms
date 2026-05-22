'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Paperclip,
  Download,
  ExternalLink,
  SlidersHorizontal,
  Link as LinkIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { QuizPlayer } from '@/components/quiz-player'
import type { Course, Lesson, Enrollment, Quiz, QuizQuestion, QuizAttempt } from '@/lib/types'

interface CourseLearningViewProps {
  course: Course & { lessons: Lesson[] }
  enrollment: Enrollment
  completedLessonIds: string[]
  userId: string
}

export function CourseLearningView({
  course,
  enrollment,
  completedLessonIds,
  userId,
}: CourseLearningViewProps) {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(completedLessonIds)
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [quizData, setQuizData] = useState<Record<string, (Quiz & { questions: QuizQuestion[] }) | null>>({})
  const [quizAttempts, setQuizAttempts] = useState<Record<string, QuizAttempt | null>>({})
  const [lessonResources, setLessonResources] = useState<Record<string, any[]>>({})
  const router = useRouter()
  const supabase = createClient()

  const currentLesson = course.lessons[currentLessonIndex]
  const progressPercentage = course.lessons.length > 0
    ? Math.round((completedLessons.size / course.lessons.length) * 100)
    : 0

  useEffect(() => {
    // Start from first incomplete lesson
    const firstIncomplete = course.lessons.findIndex(l => !completedLessons.has(l.id))
    if (firstIncomplete !== -1) setCurrentLessonIndex(firstIncomplete)
  }, [])

  useEffect(() => {
    async function fetchLessonData() {
      const lesson = course.lessons[currentLessonIndex]
      if (!lesson) return

      // Fetch quiz
      if (quizData[lesson.id] === undefined) {
        const { data: quiz } = await supabase
          .from('quizzes')
          .select('*, questions:quiz_questions(*)')
          .eq('lesson_id', lesson.id)
          .single()

        if (quiz) {
          const sorted = {
            ...quiz,
            questions: (quiz.questions || []).sort((a: QuizQuestion, b: QuizQuestion) => a.order_index - b.order_index),
          }
          setQuizData(prev => ({ ...prev, [lesson.id]: sorted }))

          const { data: attempt } = await supabase
            .from('quiz_attempts')
            .select('*')
            .eq('user_id', userId)
            .eq('quiz_id', quiz.id)
            .order('attempted_at', { ascending: false })
            .limit(1)
            .single()

          setQuizAttempts(prev => ({ ...prev, [lesson.id]: attempt || null }))
        } else {
          setQuizData(prev => ({ ...prev, [lesson.id]: null }))
        }
      }

      // Fetch resources
      if (lessonResources[lesson.id] === undefined) {
        const { data: resources } = await supabase
          .from('lesson_resources')
          .select('*')
          .eq('lesson_id', lesson.id)
          .order('order_index', { ascending: true })
        setLessonResources(prev => ({ ...prev, [lesson.id]: resources || [] }))
      }
    }
    fetchLessonData()
  }, [currentLessonIndex])

  async function markLessonComplete(lessonId: string) {
    if (completedLessons.has(lessonId)) return

    const { error } = await supabase.from('lesson_completions').upsert({
      user_id: userId,
      lesson_id: lessonId,
      course_id: course.id,
    }, { onConflict: 'user_id,lesson_id', ignoreDuplicates: true })

    if (error) {
      toast.error('Failed to save progress')
      return
    }

    const newCompleted = new Set(completedLessons)
    newCompleted.add(lessonId)
    setCompletedLessons(newCompleted)

    const newProgress = Math.round((newCompleted.size / course.lessons.length) * 100)
    await supabase
      .from('enrollments')
      .update({ progress_percentage: newProgress, ...(newProgress === 100 ? { completed_at: new Date().toISOString() } : {}) })
      .eq('id', enrollment.id)

    toast.success('✅ Lesson completed!')

    if (newCompleted.size === course.lessons.length) {
      toast.success('🎉 Course complete! Certificate is being generated...')
      const certNumber = `VT-${Date.now().toString(36).toUpperCase()}`
      await supabase.from('certificates').upsert(
        { user_id: userId, course_id: course.id, certificate_number: certNumber },
        { onConflict: 'user_id,course_id', ignoreDuplicates: true }
      )
      setTimeout(() => router.push('/dashboard/certificates'), 2000)
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

              {/* Lesson Resources */}
              {lessonResources[currentLesson.id]?.length > 0 && (
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Paperclip className="h-4 w-4" />
                      Resources ({lessonResources[currentLesson.id].length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {lessonResources[currentLesson.id].map((resource: any) => {
                      const icons: Record<string, React.ElementType> = {
                        note: FileText,
                        slide: SlidersHorizontal,
                        file: Download,
                        link: LinkIcon,
                      }
                      const Icon = icons[resource.type] || Paperclip
                      return (
                        <div key={resource.id} className="flex items-start gap-3 rounded-lg border p-3">
                          <Icon className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm">{resource.title}</p>
                            {resource.type === 'note' && resource.content && (
                              <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-3">
                                {resource.content}
                              </p>
                            )}
                            {resource.file_name && (
                              <p className="text-xs text-muted-foreground">{resource.file_name}</p>
                            )}
                          </div>
                          {resource.url && (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0"
                            >
                              <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
                                {resource.type === 'link' ? (
                                  <><ExternalLink className="h-3 w-3" /> Open</>
                                ) : (
                                  <><Download className="h-3 w-3" /> Download</>
                                )}
                              </Button>
                            </a>
                          )}
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Quiz */}
              {quizData[currentLesson.id] && (
                <div className="mb-6">
                  <QuizPlayer
                    quiz={quizData[currentLesson.id]!}
                    userId={userId}
                    previousAttempt={quizAttempts[currentLesson.id]}
                  />
                </div>
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
