import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { NewDiscussionForm } from '@/components/new-discussion-form'
import { DiscussionThread } from '@/components/discussion-thread'

interface CourseDiscussionsPageProps {
  params: Promise<{ courseId: string }>
}

export default async function CourseDiscussionsPage({ params }: CourseDiscussionsPageProps) {
  const { courseId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data: course } = await supabase
    .from('courses')
    .select('id, title')
    .eq('id', courseId)
    .single()

  const { data: discussions } = await supabase
    .from('discussions')
    .select(`
      *,
      user:profiles!user_id(full_name, email, role),
      replies:discussion_replies(
        *,
        user:profiles!user_id(full_name, email, role)
      )
    `)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-3">
        <Link href={`/courses/${courseId}`} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Discussions</h1>
          {course && (
            <p className="text-sm text-muted-foreground">{course.title}</p>
          )}
        </div>
      </div>

      <NewDiscussionForm courseId={courseId} />

      {discussions && discussions.length > 0 ? (
        <div className="space-y-4">
          {discussions.map(discussion => (
            <DiscussionThread
              key={discussion.id}
              discussion={discussion}
              currentUserId={user.id}
              currentUserRole={profile?.role}
            />
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center">
          <CardContent>
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No discussions yet</h3>
            <p className="text-muted-foreground">
              Be the first to start a conversation!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
