import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, TrendingUp, Banknote, ChevronRight, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatMMKAmount } from '@/lib/format-currency'

interface AdminDashboardProps {
  userId: string
}

export async function AdminDashboard({ userId }: AdminDashboardProps) {
  const supabase = await createClient()

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: totalCourses } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })

  const { count: publishedCourses } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const { data: payments } = await supabase
    .from('payments')
    .select('amount_in_cents')
    .eq('status', 'completed')

  const { count: pendingPayments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const totalRevenue = payments?.reduce((sum, p) => sum + p.amount_in_cents, 0) || 0

  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6)

  const stats = [
    {
      label: 'Total Users',
      value: totalUsers || 0,
      icon: Users,
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
      gradFrom: '#3b82f611',
      border: 'border-blue-200 dark:border-blue-900',
      href: '/dashboard/admin/users',
    },
    {
      label: 'Total Courses',
      value: totalCourses || 0,
      sub: `${publishedCourses || 0} published`,
      icon: BookOpen,
      iconBg: 'bg-green-100 dark:bg-green-900/40',
      iconColor: 'text-green-600 dark:text-green-400',
      gradFrom: '#22c55e11',
      border: 'border-green-200 dark:border-green-900',
      href: '/dashboard/admin/courses',
    },
    {
      label: 'Total Revenue',
      value: formatMMKAmount(totalRevenue),
      icon: Banknote,
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
      iconColor: 'text-yellow-600 dark:text-yellow-500',
      gradFrom: '#f59e0b11',
      border: 'border-yellow-200 dark:border-yellow-900',
      href: '/dashboard/admin/payments',
    },
    {
      label: 'Pending Payments',
      value: pendingPayments || 0,
      icon: TrendingUp,
      iconBg: 'bg-orange-100 dark:bg-orange-900/40',
      iconColor: 'text-orange-600 dark:text-orange-400',
      gradFrom: '#f9731611',
      border: 'border-orange-200 dark:border-orange-900',
      href: '/dashboard/admin/payments',
      highlight: (pendingPayments || 0) > 0,
    },
  ]

  const roleColors: Record<string, string> = {
    admin: 'bg-red-500',
    instructor: 'bg-blue-500',
    student: 'bg-green-500',
  }
  const roleBadge: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    instructor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    student: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  }

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
            Admin Portal
          </div>
          <h1 className="text-3xl font-bold">Platform Overview</h1>
          <p className="mt-1 text-muted-foreground">Manage users, courses, and payments from one place.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <div
                className={`group relative overflow-hidden rounded-xl border p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${stat.border} ${stat.highlight ? 'ring-2 ring-orange-400/40' : ''}`}
                style={{ background: `linear-gradient(135deg,${stat.gradFrom},transparent)` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg}`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="mt-1 text-xs text-muted-foreground font-medium">{stat.label}</div>
                {stat.sub && <div className="text-xs text-muted-foreground mt-0.5">{stat.sub}</div>}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent Users */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4">
          <div>
            <CardTitle className="text-base">Recent Users</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Latest platform registrations</p>
          </div>
          <Link href="/dashboard/admin/users">
            <Button variant="ghost" size="sm" className="gap-1.5">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {recentUsers?.map((user) => (
              <div key={user.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${roleColors[user.role] || 'bg-muted-foreground'}`}
                >
                  {(user.full_name?.charAt(0) || user.email.charAt(0)).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleBadge[user.role] || 'bg-muted'}`}>
                    {user.role}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
