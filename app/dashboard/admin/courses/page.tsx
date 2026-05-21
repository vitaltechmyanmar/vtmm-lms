import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function AdminCoursesPage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(full_name),
      enrollments(count),
      lessons(count)
    `)
    .order('created_at', { ascending: false })

  const publishedCount = courses?.filter(c => c.is_published).length || 0
  const draftCount = courses?.filter(c => !c.is_published).length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Courses Management</h1>
        <p className="text-muted-foreground">
          Overview of all platform courses
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Course</th>
                  <th className="text-left py-2 px-4">Instructor</th>
                  <th className="text-left py-2 px-4">Students</th>
                  <th className="text-left py-2 px-4">Lessons</th>
                  <th className="text-left py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {courses?.map((course) => (
                  <tr key={course.id} className="border-b hover:bg-muted">
                    <td className="py-2 px-4 font-medium">{course.title}</td>
                    <td className="py-2 px-4 text-muted-foreground">{course.instructor?.full_name}</td>
                    <td className="py-2 px-4">{course.enrollments?.[0]?.count || 0}</td>
                    <td className="py-2 px-4">{course.lessons?.[0]?.count || 0}</td>
                    <td className="py-2 px-4">
                      <Badge variant={course.is_published ? 'default' : 'secondary'}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
