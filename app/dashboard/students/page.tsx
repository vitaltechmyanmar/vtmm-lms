import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Users, BookOpen, TrendingUp, CheckCircle } from 'lucide-react'

export default async function StudentsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get all courses by instructor with enrollments and student progress
  const { data: courses } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      is_published,
      enrollments(
        id,
        enrolled_at,
        completed_at,
        progress_percentage,
        user:profiles!user_id(id, full_name, email)
      )
    `)
    .eq('instructor_id', user.id)
    .order('created_at', { ascending: false })

  // Unique students across all courses
  const allStudents = new Map<string, { id: string; full_name: string | null; email: string }>()
  courses?.forEach(course => {
    course.enrollments?.forEach((e: any) => {
      if (e.user) allStudents.set(e.user.id, e.user)
    })
  })

  const totalEnrollments = courses?.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0) || 0
  const completedEnrollments =
    courses?.reduce(
      (sum, c) => sum + (c.enrollments?.filter((e: any) => e.completed_at).length || 0),
      0
    ) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Students</h1>
        <p className="text-muted-foreground">Students enrolled in your courses</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unique Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allStudents.size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedEnrollments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEnrollments > 0
                ? Math.round((completedEnrollments / totalEnrollments) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-course breakdown */}
      {courses && courses.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Students by Course</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-1">
              {courses.map(course => {
                const enrollments = (course.enrollments || []) as any[]
                const completed = enrollments.filter(e => e.completed_at).length
                const avgProgress =
                  enrollments.length > 0
                    ? Math.round(
                        enrollments.reduce((s: number, e: any) => s + (e.progress_percentage || 0), 0) /
                          enrollments.length
                      )
                    : 0

                return (
                  <AccordionItem key={course.id} value={course.id} className="rounded-lg border px-1">
                    <AccordionTrigger className="px-3 py-3 hover:no-underline">
                      <div className="flex flex-1 items-center justify-between pr-4">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-left">{course.title}</span>
                          <Badge
                            variant={course.is_published ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {course.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{enrollments.length} students</span>
                          <span>{completed} completed</span>
                          <span>{avgProgress}% avg</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {enrollments.length > 0 ? (
                        <div className="divide-y px-2">
                          {enrollments.map((e: any) => (
                            <div key={e.id} className="flex items-center gap-4 py-3">
                              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                {e.user?.full_name?.charAt(0) ||
                                  e.user?.email?.charAt(0).toUpperCase() ||
                                  '?'}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">
                                  {e.user?.full_name || 'Unknown'}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {e.user?.email}
                                </p>
                              </div>
                              <div className="hidden w-32 sm:block">
                                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                                  <span>Progress</span>
                                  <span>{e.progress_percentage || 0}%</span>
                                </div>
                                <Progress value={e.progress_percentage || 0} className="h-1.5" />
                              </div>
                              <div className="flex-shrink-0">
                                {e.completed_at ? (
                                  <Badge className="text-xs">Completed</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    In progress
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="px-3 pb-3 text-sm text-muted-foreground">
                          No students enrolled yet
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </CardContent>
        </Card>
      ) : (
        <Card className="py-12 text-center">
          <CardContent>
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No students yet</h3>
            <p className="text-muted-foreground">Students will appear once they enroll</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
