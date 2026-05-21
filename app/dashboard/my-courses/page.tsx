import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default async function MyCoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
    .eq('user_id', user?.id)
    .order('enrolled_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">
          All your enrolled courses
        </p>
      </div>

      {enrollments && enrollments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
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
                <h3 className="font-semibold line-clamp-2">{enrollment.course?.title}</h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  by {enrollment.course?.instructor?.full_name || 'Instructor'}
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{enrollment.progress_percentage}%</span>
                  </div>
                  <Progress value={enrollment.progress_percentage} />
                </div>
                <Link href={`/courses/${enrollment.course?.id}/learn`}>
                  <Button className="w-full" size="sm">
                    Continue Learning
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
            <h3 className="mt-4 text-lg font-semibold">No courses enrolled</h3>
            <p className="mb-4 text-muted-foreground">
              Start learning by enrolling in a course
            </p>
            <Link href="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
