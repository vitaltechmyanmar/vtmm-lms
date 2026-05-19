import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, CheckCircle, BookOpen, ArrowRight } from 'lucide-react'

interface SuccessPageProps {
  params: Promise<{ courseId: string }>
  searchParams: Promise<{ session_id?: string }>
}

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
  const { courseId } = await params
  const { session_id } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get course details
  const { data: course } = await supabase
    .from('courses')
    .select('title, thumbnail_url')
    .eq('id', courseId)
    .single()

  // Check enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single()

  if (!enrollment) {
    redirect(`/courses/${courseId}`)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            {"You've successfully enrolled in"}
          </p>
          <div className="rounded-lg border p-4">
            <div className="mb-3 aspect-video w-full overflow-hidden rounded-md bg-muted">
              {course?.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <h3 className="font-semibold">{course?.title || 'Course'}</h3>
          </div>
          <div className="space-y-3">
            <Link href={`/courses/${courseId}/learn`}>
              <Button className="w-full" size="lg">
                Start Learning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      <div className="mt-8 flex items-center gap-2 text-muted-foreground">
        <GraduationCap className="h-5 w-5" />
        <span className="text-sm">LearnHub</span>
      </div>
    </div>
  )
}
