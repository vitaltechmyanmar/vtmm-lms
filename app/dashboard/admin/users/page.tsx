import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, Shield, Mail, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { InviteInstructorDialog } from './invite-instructor-dialog'
import { UserEnrollments } from './user-enrollments'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: pendingInvites } = await supabase
    .from('instructor_invites')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const studentCount = profiles?.filter(p => p.role === 'student').length || 0
  const instructorCount = profiles?.filter(p => p.role === 'instructor').length || 0
  const adminCount = profiles?.filter(p => p.role === 'admin').length || 0
  const totalCount = profiles?.length || 0

  const roleBadgeClass: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    instructor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    student: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  }
  const roleAvatar: Record<string, string> = {
    admin: 'bg-red-500',
    instructor: 'bg-blue-500',
    student: 'bg-primary',
  }

  const stats = [
    { label: 'Total Users', value: totalCount, icon: Users, iconBg: 'bg-blue-100 dark:bg-blue-900/40', iconColor: 'text-blue-600', gradFrom: '#3b82f611', border: 'border-blue-200 dark:border-blue-900' },
    { label: 'Students', value: studentCount, icon: UserCheck, iconBg: 'bg-green-100 dark:bg-green-900/40', iconColor: 'text-green-600', gradFrom: '#22c55e11', border: 'border-green-200 dark:border-green-900' },
    { label: 'Instructors', value: instructorCount, icon: UserPlus, iconBg: 'bg-purple-100 dark:bg-purple-900/40', iconColor: 'text-purple-600', gradFrom: '#a855f711', border: 'border-purple-200 dark:border-purple-900' },
    { label: 'Admins', value: adminCount, icon: Shield, iconBg: 'bg-red-100 dark:bg-red-900/40', iconColor: 'text-red-600', gradFrom: '#ef444411', border: 'border-red-200 dark:border-red-900' },
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
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium shadow-sm">
              <Users className="h-3 w-3 text-primary" />
              User Management
            </div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="mt-1 text-muted-foreground">Manage all platform members and send instructor invitations.</p>
          </div>
          <InviteInstructorDialog />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => {
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

      {/* Pending Instructor Invites */}
      {pendingInvites && pendingInvites.length > 0 && (
        <Card className="overflow-hidden border-purple-200 dark:border-purple-900">
          <CardHeader className="border-b bg-purple-50/50 dark:bg-purple-900/10 px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
                <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              Pending Instructor Invitations
              <Badge className="ml-auto bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 border-0">
                {pendingInvites.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">Invited</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInvites.map((invite) => {
                    const isExpired = new Date(invite.expires_at) < new Date()
                    return (
                      <tr key={invite.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-6 font-medium">{invite.email}</td>
                        <td className="py-3 px-6">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isExpired
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                          }`}>
                            {isExpired ? 'Expired' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-muted-foreground">
                          {new Date(invite.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-6 text-muted-foreground">
                          {new Date(invite.expires_at).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30 px-6 py-4">
          <CardTitle className="text-base">All Users</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">{totalCount} total members</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="text-left py-3 px-6 font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-6 font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-6 font-medium text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-6 font-medium text-muted-foreground">Joined</th>
                </tr>
              </thead>
              <tbody>
                {profiles?.map((profile) => (
                  <tr key={profile.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${roleAvatar[profile.role] || 'bg-muted-foreground'}`}>
                          {(profile.full_name?.charAt(0) || profile.email.charAt(0)).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium">{profile.full_name || 'User'}</span>
                          <div className="mt-1">
                            <UserEnrollments userId={profile.id} userName={profile.full_name || profile.email} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-muted-foreground">{profile.email}</td>
                    <td className="py-3 px-6">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleBadgeClass[profile.role] || 'bg-muted'}`}>
                        {profile.role}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString()}
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
