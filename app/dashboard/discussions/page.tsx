import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'
import { DiscussionThread } from '@/components/discussion-thread'

export default async function DiscussionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  // For instructors: get their course IDs; for admins: get all
  let courseIds: string[] = []
  if (profile?.role === 'admin') {
    const { data: allCourses } = await supabase.from('courses').select('id')
    courseIds = allCourses?.map(c => c.id) || []
  } else {
    const { data: courses } = await supabase
      .from('courses')
      .select('id')
      .eq('instructor_id', user?.id)
    courseIds = courses?.map(c => c.id) || []
  }

  const { data: discussions } = await supabase
    .from('discussions')
    .select(`
      *,
      user:profiles!user_id(full_name, email, role),
      course:courses(id, title),
      replies:discussion_replies(
        *,
        user:profiles!user_id(full_name, email, role)
      )
    `)
    .in('course_id', courseIds.length > 0 ? courseIds : [''])
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Discussions</h1>
        <p className="text-muted-foreground">
          Student discussions in your courses
        </p>
      </div>

      {discussions && discussions.length > 0 ? (
        <div className="space-y-6">
          {/* Group by course */}
          {Object.entries(
            discussions.reduce<Record<string, typeof discussions>>((acc, d) => {
              const key = d.course?.title ?? 'Unknown Course'
              if (!acc[key]) acc[key] = []
              acc[key].push(d)
              return acc
            }, {})
          ).map(([courseTitle, courseDiscussions]) => (
            <div key={courseTitle}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {courseTitle}
              </h2>
              <div className="space-y-3">
                {courseDiscussions.map(discussion => (
                  <DiscussionThread
                    key={discussion.id}
                    discussion={discussion}
                    currentUserId={user?.id ?? ''}
                    currentUserRole={profile?.role}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center">
          <CardContent>
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No discussions yet</h3>
            <p className="text-muted-foreground">
              Student discussions will appear here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
