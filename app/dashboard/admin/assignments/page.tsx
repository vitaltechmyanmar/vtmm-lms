'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, MoreVertical, Trash2, UserPlus, Loader2, Search, BookOpen, Users } from 'lucide-react'
import { toast } from 'sonner'
import type { Profile, Course, UserCourseAssignment } from '@/lib/types'

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<UserCourseAssignment[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCourse, setFilterCourse] = useState<string>('all')
  const [formData, setFormData] = useState({
    user_id: '',
    course_id: '',
    notes: '',
    expires_at: '',
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    // Fetch assignments with related data
    const { data: assignmentsData } = await supabase
      .from('user_course_assignments')
      .select('*')
      .order('assigned_at', { ascending: false })

    // Fetch users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true })

    // Fetch courses
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*')
      .order('title', { ascending: true })

    // Map related data
    const enrichedAssignments = assignmentsData?.map(a => ({
      ...a,
      user: usersData?.find(u => u.id === a.user_id),
      course: coursesData?.find(c => c.id === a.course_id),
      assigned_by_user: usersData?.find(u => u.id === a.assigned_by),
    })) || []

    setAssignments(enrichedAssignments)
    setUsers(usersData || [])
    setCourses(coursesData || [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()

    // Check if assignment already exists
    const existing = assignments.find(
      a => a.user_id === formData.user_id && a.course_id === formData.course_id
    )

    if (existing) {
      toast.error('This user is already assigned to this course')
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('user_course_assignments')
      .insert({
        user_id: formData.user_id,
        course_id: formData.course_id,
        assigned_by: user?.id,
        notes: formData.notes || null,
        expires_at: formData.expires_at || null,
      })

    if (error) {
      toast.error(error.message)
      setSaving(false)
      return
    }

    // Also create an enrollment for the user
    await supabase.from('enrollments').upsert({
      user_id: formData.user_id,
      course_id: formData.course_id,
      progress_percentage: 0,
    }, { onConflict: 'user_id,course_id' })

    toast.success('User assigned to course successfully')
    setSaving(false)
    setIsDialogOpen(false)
    setFormData({ user_id: '', course_id: '', notes: '', expires_at: '' })
    fetchData()
  }

  async function handleDelete(assignment: UserCourseAssignment) {
    if (!confirm('Remove this assignment? The user will lose access to this course.')) return

    const { error } = await supabase
      .from('user_course_assignments')
      .delete()
      .eq('id', assignment.id)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Assignment removed')
    fetchData()
  }

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = searchTerm === '' ||
      a.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCourse = filterCourse === 'all' || a.course_id === filterCourse

    return matchesSearch && matchesCourse
  })

  // Group assignments by course for stats
  const assignmentsByCourse = assignments.reduce((acc, a) => {
    acc[a.course_id] = (acc[a.course_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Assignments</h1>
          <p className="text-muted-foreground">Manually assign users to courses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Assign User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign User to Course</DialogTitle>
              <DialogDescription>
                Grant a user access to a specific course
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user">User *</Label>
                <Select
                  value={formData.user_id}
                  onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <Select
                  value={formData.course_id}
                  onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_at">Expires At (Optional)</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Reason for assignment, special instructions, etc."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saving || !formData.user_id || !formData.course_id}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Assign
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Users with Assignments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(assignments.map(a => a.user_id)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses with Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(assignmentsByCourse).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by user or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
          <CardDescription>
            {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {assignments.length === 0 
                ? 'No assignments yet. Assign your first user to a course.'
                : 'No assignments match your search criteria.'
              }
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Course</th>
                    <th className="text-left py-3 px-4">Assigned</th>
                    <th className="text-left py-3 px-4">Expires</th>
                    <th className="text-left py-3 px-4">Notes</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{assignment.user?.full_name || 'Unknown'}</div>
                          <div className="text-muted-foreground text-xs">{assignment.user?.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{assignment.course?.title || 'Unknown'}</div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(assignment.assigned_at).toLocaleDateString()}
                        {assignment.assigned_by_user && (
                          <div className="text-xs">by {assignment.assigned_by_user.full_name}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {assignment.expires_at ? (
                          <Badge variant={new Date(assignment.expires_at) < new Date() ? 'destructive' : 'secondary'}>
                            {new Date(assignment.expires_at).toLocaleDateString()}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-[200px] truncate text-muted-foreground">
                        {assignment.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDelete(assignment)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
