import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Users, TrendingUp, CheckCircle, BookOpen } from 'lucide-react'

interface PageProps {
  params: Promise<{ courseId: string }>
}

export default async function CourseEnrollmentsPage({ params }: PageProps) {
  const { courseId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, is_published, lessons(count)')
    .eq('id', courseId)
    .single()

  if (!course) notFound()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      id,
      enrolled_at,
      completed_at,
      progress_percentage,
      user:profiles!user_id(id, full_name, email, avatar_url)
    `)
    .eq('course_id', courseId)
    .order('enrolled_at', { ascending: false })

  const totalEnrollments = enrollments?.length || 0
  const completedCount = enrollments?.filter(e => e.completed_at).length || 0
  const avgProgress =
    totalEnrollments > 0
      ? Math.round(
          enrollments!.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) /
            totalEnrollments
        )
      : 0
  const completionRate =
    totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold">{course.title}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={course.is_published ? 'default' : 'secondary'}>
              {course.is_published ? 'Published' : 'Draft'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {course.lessons?.[0]?.count || 0} lessons
            </span>
          </div>
        </div>
        <Link href={`/dashboard/courses/${courseId}`}>
          <Button variant="outline" size="sm">
            Edit Course
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Enrolled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Enrollments list */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students ({totalEnrollments})</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments && enrollments.length > 0 ? (
            <div className="divide-y">
              {enrollments.map(enrollment => {
                const student = enrollment.user as any
                return (
                  <div key={enrollment.id} className="flex items-center gap-4 py-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {student?.full_name?.charAt(0) ||
                        student?.email?.charAt(0).toUpperCase() ||
                        '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{student?.full_name || 'Unknown'}</p>
                      <p className="truncate text-sm text-muted-foreground">{student?.email}</p>
                    </div>
                    <div className="hidden w-40 flex-shrink-0 sm:block">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{enrollment.progress_percentage || 0}%</span>
                      </div>
                      <Progress value={enrollment.progress_percentage || 0} className="h-1.5" />
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {enrollment.completed_at ? (
                        <Badge variant="default" className="text-xs">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          In progress
                        </Badge>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No students enrolled</h3>
              <p className="text-sm text-muted-foreground">
                Students will appear here once they enroll in this course
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
