import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default async function DiscussionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get courses by instructor
  const { data: courses } = await supabase
    .from('courses')
    .select('id')
    .eq('instructor_id', user?.id)

  const courseIds = courses?.map(c => c.id) || []

  // Get discussions for these courses
  const { data: discussions } = await supabase
    .from('discussions')
    .select(`
      *,
      user:profiles(full_name, email),
      course:courses(id, title),
      discussion_replies(count)
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
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <Card key={discussion.id}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{discussion.title}</h3>
                      <p className="text-sm text-muted-foreground">{discussion.content}</p>
                    </div>
                    <Link href={`/courses/${discussion.course?.id}`}>
                      <span className="text-xs font-medium text-primary hover:underline">
                        {discussion.course?.title}
                      </span>
                    </Link>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>by {discussion.user?.full_name || 'User'}</span>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      {discussion.discussion_replies?.[0]?.count || 0} replies
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
