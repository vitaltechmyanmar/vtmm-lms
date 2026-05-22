'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BookOpen,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  MoreVertical,
  Plus,
  Search,
  Users,
  Play,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatMMK } from '@/lib/format-currency'

interface CourseRow {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  category: string | null
  level: string
  price_in_cents: number
  is_published: boolean
  created_at: string
  instructor: { id: string; full_name: string | null; email: string } | null
  enrollments: { count: number }[]
  lessons: { count: number }[]
}

interface AdminCoursesClientProps {
  initialCourses: CourseRow[]
}

export function AdminCoursesClient({ initialCourses }: AdminCoursesClientProps) {
  const [courses, setCourses] = useState<CourseRow[]>(initialCourses)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const publishedCount = courses.filter(c => c.is_published).length
  const draftCount = courses.filter(c => !c.is_published).length
  const totalStudents = courses.reduce((sum, c) => sum + (c.enrollments?.[0]?.count || 0), 0)

  const categories = Array.from(new Set(courses.map(c => c.category).filter(Boolean))) as string[]

  const filtered = courses.filter(c => {
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor?.email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && c.is_published) ||
      (statusFilter === 'draft' && !c.is_published)
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  async function togglePublish(courseId: string, current: boolean) {
    const { error } = await supabase
      .from('courses')
      .update({ is_published: !current, updated_at: new Date().toISOString() })
      .eq('id', courseId)

    if (error) {
      toast.error(error.message)
      return
    }

    setCourses(courses.map(c => (c.id === courseId ? { ...c, is_published: !current } : c)))
    toast.success(current ? 'Course unpublished' : 'Course published')
  }

  async function deleteCourse(courseId: string) {
    const { error } = await supabase.from('courses').delete().eq('id', courseId)
    if (error) {
      toast.error(error.message)
      return
    }
    setCourses(courses.filter(c => c.id !== courseId))
    setDeletingId(null)
    toast.success('Course deleted')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground">Manage all courses on the platform</p>
        </div>
        <Link href="/dashboard/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
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
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
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
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title or instructor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as 'all' | 'published' | 'draft')}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat} className="capitalize">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Courses list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="py-16">
            <CardContent className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No courses found</h3>
              <p className="text-sm text-muted-foreground">
                {search || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No courses have been created yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map(course => (
            <Card key={course.id} className="overflow-hidden">
              <CardContent className="flex items-center gap-4 p-4">
                {/* Thumbnail */}
                <div className="h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Play className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge
                      variant={course.is_published ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {course.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    <span className="text-xs capitalize text-muted-foreground">{course.level}</span>
                    {course.category && (
                      <span className="text-xs capitalize text-muted-foreground">
                        &bull; {course.category}
                      </span>
                    )}
                  </div>
                  <h3 className="truncate font-semibold">{course.title}</h3>
                  <p className="truncate text-sm text-muted-foreground">
                    {course.instructor?.full_name || course.instructor?.email || 'No instructor'}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span>{course.lessons?.[0]?.count || 0} lessons</span>
                    <span>{course.enrollments?.[0]?.count || 0} students</span>
                    <span className="font-medium text-foreground">
                      {formatMMK(course.price_in_cents)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href={`/courses/${course.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/courses/${course.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Course
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/admin/courses/${course.id}/enrollments`}>
                        <Users className="mr-2 h-4 w-4" />
                        View Enrollments
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => togglePublish(course.id, course.is_published)}
                    >
                      {course.is_published ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Publish
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeletingId(course.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Showing {filtered.length} of {courses.length} courses
        </p>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={open => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this course?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the course and all associated lessons, enrollments, and
              progress data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteCourse(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
