import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, Banknote, TrendingUp, BarChart3, GraduationCap, UserCheck } from 'lucide-react'
import { formatMMKAmount } from '@/lib/format-currency'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

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

  const { count: pendingPayments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount_in_cents || 0), 0) || 0

  const { data: profiles } = await supabase.from('profiles').select('role')

  const studentCount = profiles?.filter(p => p.role === 'student').length || 0
  const instructorCount = profiles?.filter(p => p.role === 'instructor').length || 0

  const completedCount = enrollments?.filter(e => e.completed_at).length || 0
  const completionRate = totalEnrollments ? Math.round((completedCount / totalEnrollments) * 100) : 0

  const mainStats = [
    {
      label: 'Total Users',
      value: totalUsers || 0,
      icon: Users,
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
      gradFrom: '#3b82f611',
      border: 'border-blue-200 dark:border-blue-900',
    },
    {
      label: 'Total Courses',
      value: totalCourses || 0,
      icon: BookOpen,
      iconBg: 'bg-green-100 dark:bg-green-900/40',
      iconColor: 'text-green-600 dark:text-green-400',
      gradFrom: '#22c55e11',
      border: 'border-green-200 dark:border-green-900',
    },
    {
      label: 'Total Revenue',
      value: formatMMKAmount(totalRevenue),
      icon: Banknote,
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
      iconColor: 'text-yellow-600 dark:text-yellow-500',
      gradFrom: '#f59e0b11',
      border: 'border-yellow-200 dark:border-yellow-900',
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      icon: TrendingUp,
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
      iconColor: 'text-purple-600 dark:text-purple-400',
      gradFrom: '#a855f711',
      border: 'border-purple-200 dark:border-purple-900',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-blue-500/5 p-6 shadow-sm">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'linear-gradient(to right,#8882 1px,transparent 1px),linear-gradient(to bottom,#8882 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium shadow-sm">
            <BarChart3 className="h-3 w-3 text-primary" />
            Analytics
          </div>
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <p className="mt-1 text-muted-foreground">Overall platform metrics and statistics.</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mainStats.map(stat => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={`rounded-xl border p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${stat.border}`}
              style={{ background: `linear-gradient(135deg,${stat.gradFrom},transparent)` }}
            >
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg}`}>
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="mt-1 text-xs text-muted-foreground font-medium">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Detailed Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Breakdown */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30 px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              User Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <span className="text-sm font-medium">Students</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {totalUsers ? Math.round((studentCount / totalUsers) * 100) : 0}%
                  </span>
                  <span className="font-bold w-8 text-right">{studentCount}</span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${totalUsers ? (studentCount / totalUsers) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">Instructors</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {totalUsers ? Math.round((instructorCount / totalUsers) * 100) : 0}%
                  </span>
                  <span className="font-bold w-8 text-right">{instructorCount}</span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${totalUsers ? (instructorCount / totalUsers) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/40 p-3 text-center">
                <div className="text-xl font-bold">{totalUsers || 0}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 text-center">
                <div className="text-xl font-bold text-primary">{pendingPayments || 0}</div>
                <div className="text-xs text-muted-foreground">Pending Payments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Metrics */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30 px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
                <GraduationCap className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              Enrollment Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {[
              { label: 'Total Enrollments', value: totalEnrollments || 0, color: 'text-foreground' },
              { label: 'Completed Courses', value: completedCount, color: 'text-green-600' },
              { label: 'In Progress', value: (totalEnrollments || 0) - completedCount, color: 'text-blue-600' },
            ].map(m => (
              <div key={m.label} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm text-muted-foreground">{m.label}</span>
                <span className={`text-xl font-bold ${m.color}`}>{m.value}</span>
              </div>
            ))}

            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-xl font-bold text-purple-600">{completionRate}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-primary transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
