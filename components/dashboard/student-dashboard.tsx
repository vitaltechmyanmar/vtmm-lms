import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Clock, Award, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface StudentDashboardProps {
  userId: string
}

export async function StudentDashboard({ userId }: StudentDashboardProps) {
  const supabase = await createClient()

  // Get enrollments with course details
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      *,
      course:courses(
        id,
        title,
        thumbnail_url,
        instructor:profiles!instructor_id(full_name)
      )
    `)
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })

  // Get certificates count
  const { count: certificatesCount } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const inProgressCourses = enrollments?.filter(e => !e.completed_at) || []
  const completedCourses = enrollments?.filter(e => e.completed_at) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">
          Continue your learning journey
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCourses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCourses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificatesCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Continue Learning</h2>
          <Link href="/dashboard/my-courses">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </div>
        {inProgressCourses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inProgressCourses.slice(0, 3).map((enrollment) => (
              <Card key={enrollment.id} className="overflow-hidden">
                <div className="aspect-video bg-muted">
                  {enrollment.course?.thumbnail_url ? (
                    <img
                      src={enrollment.course.thumbnail_url}
                      alt={enrollment.course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-1">{enrollment.course?.title}</h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    by {enrollment.course?.instructor?.full_name || 'Instructor'}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{enrollment.progress_percentage}%</span>
                    </div>
                    <Progress value={enrollment.progress_percentage} />
                  </div>
                  <Link href={`/courses/${enrollment.course?.id}/learn`}>
                    <Button className="mt-4 w-full" size="sm">
                      Continue
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-12 text-center">
            <CardContent>
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
              <p className="mb-4 text-muted-foreground">
                Start your learning journey by enrolling in a course
              </p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
