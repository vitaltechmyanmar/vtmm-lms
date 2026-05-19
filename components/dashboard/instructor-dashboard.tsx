import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, DollarSign, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface InstructorDashboardProps {
  userId: string
}

export async function InstructorDashboard({ userId }: InstructorDashboardProps) {
  const supabase = await createClient()

  // Get instructor's courses
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('instructor_id', userId)
    .order('created_at', { ascending: false })

  // Get total students enrolled in instructor's courses
  const courseIds = courses?.map(c => c.id) || []
  let totalStudents = 0
  let totalRevenue = 0

  if (courseIds.length > 0) {
    const { count: studentsCount } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .in('course_id', courseIds)

    totalStudents = studentsCount || 0

    // Get total revenue
    const { data: payments } = await supabase
      .from('payments')
      .select('amount_in_cents')
      .in('course_id', courseIds)
      .eq('status', 'completed')

    totalRevenue = payments?.reduce((sum, p) => sum + p.amount_in_cents, 0) || 0
  }

  const publishedCourses = courses?.filter(c => c.is_published) || []
  const draftCourses = courses?.filter(c => !c.is_published) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your courses and track your performance
          </p>
        </div>
        <Link href="/dashboard/courses/new">
          <Button>Create New Course</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {publishedCourses.length} published, {draftCourses.length} drafts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalRevenue / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">Based on reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Courses</h2>
          <Link href="/dashboard/courses">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </div>
        {courses && courses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <div className="aspect-video bg-muted">
                  {course.thumbnail_url ? (
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
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        course.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {course.is_published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {course.level}
                    </span>
                  </div>
                  <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                  <p className="mb-3 text-sm font-medium text-primary">
                    ${(course.price_in_cents / 100).toFixed(2)}
                  </p>
                  <Link href={`/dashboard/courses/${course.id}`}>
                    <Button variant="outline" className="w-full" size="sm">
                      Manage Course
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
                Create your first course and start teaching
              </p>
              <Link href="/dashboard/courses/new">
                <Button>Create Course</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
