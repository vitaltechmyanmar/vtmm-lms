import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, Banknote, TrendingUp } from 'lucide-react'
import { formatMMKAmount } from '@/lib/format-currency'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  // Get totals
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: totalCourses } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })

  const { data: enrollments, count: totalEnrollments } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact' })

  const { data: payments } = await supabase
    .from('payments')
    .select('amount_in_cents, status')
    .eq('status', 'completed')

  const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount_in_cents || 0), 0) || 0

  // Get user breakdown
  const { data: profiles } = await supabase
    .from('profiles')
    .select('role')

  const studentCount = profiles?.filter(p => p.role === 'student').length || 0
  const instructorCount = profiles?.filter(p => p.role === 'instructor').length || 0

  const completedCount = enrollments?.filter(e => e.completed_at).length || 0
  const completionRate = totalEnrollments ? Math.round((completedCount / totalEnrollments) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground">
          Overall platform metrics and statistics
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMMKAmount(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Students</span>
                <span className="font-bold">{studentCount}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${totalUsers ? (studentCount / totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Instructors</span>
                <span className="font-bold">{instructorCount}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${totalUsers ? (instructorCount / totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Enrollments</span>
                <span className="font-bold">{totalEnrollments || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Completed Courses</span>
                <span className="font-bold">{completedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">In Progress</span>
                <span className="font-bold">{(totalEnrollments || 0) - completedCount}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <span className="font-bold">{completionRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
