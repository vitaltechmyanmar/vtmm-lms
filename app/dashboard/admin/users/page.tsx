import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, UserX, BarChart3, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { InviteInstructorDialog } from './invite-instructor-dialog'

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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'instructor':
        return 'default'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">
            Manage all platform users
          </p>
        </div>
        <InviteInstructorDialog />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Instructors</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instructorCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Instructor Invites */}
      {pendingInvites && pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              Pending Instructor Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Email</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Invited At</th>
                    <th className="text-left py-2 px-4">Expires At</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInvites.map((invite) => {
                    const isExpired = new Date(invite.expires_at) < new Date()
                    return (
                      <tr key={invite.id} className="border-b hover:bg-muted">
                        <td className="py-2 px-4 font-medium">{invite.email}</td>
                        <td className="py-2 px-4">
                          <Badge variant={isExpired ? 'destructive' : 'outline'}>
                            {isExpired ? 'Expired' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="py-2 px-4 text-muted-foreground">
                          {new Date(invite.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4 text-muted-foreground">
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
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Name</th>
                  <th className="text-left py-2 px-4">Email</th>
                  <th className="text-left py-2 px-4">Role</th>
                  <th className="text-left py-2 px-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {profiles?.map((profile) => (
                  <tr key={profile.id} className="border-b hover:bg-muted">
                    <td className="py-2 px-4 font-medium">{profile.full_name || 'User'}</td>
                    <td className="py-2 px-4 text-muted-foreground">{profile.email}</td>
                    <td className="py-2 px-4">
                      <Badge variant={getRoleBadgeVariant(profile.role)}>
                        {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-2 px-4 text-muted-foreground">
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
