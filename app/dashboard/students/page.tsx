import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default async function StudentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get all courses by instructor with enrolled students
  const { data: courses } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      enrollments(
        id,
        user:profiles(id, full_name, email)
      )
    `)
    .eq('instructor_id', user?.id)

  const allStudents = new Map()
  courses?.forEach((course) => {
    course.enrollments?.forEach((enrollment: any) => {
      if (enrollment.user) {
        allStudents.set(enrollment.user.id, enrollment.user)
      }
    })
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Students</h1>
        <p className="text-muted-foreground">
          Students enrolled in your courses
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allStudents.size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      {allStudents.size > 0 ? (
        <div className="grid gap-4">
          {Array.from(allStudents.values()).map((student: any) => (
            <Card key={student.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                    {student.full_name?.charAt(0) || student.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{student.full_name || 'User'}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center">
          <CardContent>
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No students yet</h3>
            <p className="text-muted-foreground">
              Students will appear here once they enroll
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
