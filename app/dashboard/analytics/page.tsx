import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, BookOpen, Users, Banknote, CheckCircle } from 'lucide-react'
import { formatMMKAmount } from '@/lib/format-currency'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get instructor courses with enrollment and payment data
  const { data: courses } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      price_in_cents,
      is_published,
      level,
      category,
      enrollments(
        id,
        enrolled_at,
        completed_at,
        progress_percentage
      )
    `)
    .eq('instructor_id', user.id)
    .order('created_at', { ascending: false })

  const courseIds = courses?.map(c => c.id) || []

  // Get payments for instructor courses
  const { data: payments } = await supabase
    .from('payments')
    .select('amount_in_cents, status, created_at')
    .in('course_id', courseIds.length > 0 ? courseIds : [''])
    .eq('status', 'completed')

  const totalRevenue = payments?.reduce((sum, p) => sum + p.amount_in_cents, 0) || 0
  const totalEnrollments = courses?.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0) || 0
  const completedEnrollments =
    courses?.reduce(
      (sum, c) => sum + (c.enrollments?.filter((e: any) => e.completed_at).length || 0),
      0
    ) || 0
  const completionRate =
    totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0
  const avgProgress =
    totalEnrollments > 0
      ? Math.round(
          (courses || [])
            .flatMap(c => c.enrollments || [])
            .reduce((sum: number, e: any) => sum + (e.progress_percentage || 0), 0) /
            totalEnrollments
        )
      : 0

  // Sort courses by enrollment count for the leaderboard
  const coursesByEnrollment = [...(courses || [])].sort(
    (a, b) => (b.enrollments?.length || 0) - (a.enrollments?.length || 0)
  )

  const maxEnrollments = coursesByEnrollment[0]?.enrollments?.length || 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Performance overview for your courses</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {courses?.filter(c => c.is_published).length || 0} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">{completedEnrollments} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMMKAmount(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">{payments?.length || 0} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
            <Progress value={avgProgress} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg per Course</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses?.length ? Math.round(totalEnrollments / courses.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">students per course</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-course performance */}
      {coursesByEnrollment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Course Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {coursesByEnrollment.map(course => {
              const enrollCount = course.enrollments?.length || 0
              const completed = (course.enrollments || []).filter((e: any) => e.completed_at).length
              const courseAvgProgress =
                enrollCount > 0
                  ? Math.round(
                      (course.enrollments || []).reduce(
                        (s: number, e: any) => s + (e.progress_percentage || 0),
                        0
                      ) / enrollCount
                    )
                  : 0
              const barWidth = maxEnrollments > 0 ? (enrollCount / maxEnrollments) * 100 : 0

              return (
                <div key={course.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{course.title}</span>
                      <Badge
                        variant={course.is_published ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {course.is_published ? 'Live' : 'Draft'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{enrollCount} enrolled</span>
                      <span>{completed} done</span>
                      <span>{courseAvgProgress}% avg</span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {courses?.length === 0 && (
        <Card className="py-12 text-center">
          <CardContent>
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No data yet</h3>
            <p className="text-muted-foreground">Create and publish courses to see analytics</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
