import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Plus, MoreVertical, Eye, Edit, Trash } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default async function InstructorCoursesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Only allow instructors and admins to view this page
  if (profile?.role !== 'instructor' && profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const isAdmin = profile?.role === 'admin'

  // Admins see all courses, instructors see only their own
  const query = supabase
    .from('courses')
    .select(`
      *,
      lessons(count),
      enrollments(count)
    `)
  
  const { data: courses } = isAdmin 
    ? await query.order('created_at', { ascending: false })
    : await query.eq('instructor_id', user.id).order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isAdmin ? 'All Courses' : 'My Courses'}</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage all courses on the platform' : 'View and manage your courses'}
          </p>
        </div>
        <Link href="/dashboard/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </Link>
      </div>

      {courses && courses.length > 0 ? (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-24 w-40 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
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
                  <h3 className="text-lg font-semibold">{course.title}</h3>
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {course.description || 'No description'}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{course.lessons?.[0]?.count || 0} lessons</span>
                    <span>{course.enrollments?.[0]?.count || 0} students</span>
                    <span className="font-medium text-foreground">
                      ${(course.price_in_cents / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/courses/${course.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/courses/${course.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-16 text-center">
          <CardContent>
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
            <p className="text-muted-foreground">
              {isAdmin
                ? 'No courses have been created on the platform yet.'
                : 'You have not created any courses yet.'}
            </p>
            <Link href="/dashboard/courses/new" className="mt-4 inline-block">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Course
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
