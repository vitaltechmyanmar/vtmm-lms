'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface CourseDiscussionsPageProps {
  params: Promise<{ courseId: string }>
}

export default function CourseDiscussionsPage({ params }: CourseDiscussionsPageProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const supabase = createClient()

  async function handleCreateDiscussion(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('You must be logged in')
      return
    }

    // Get the courseId from params
    const { courseId } = await params

    const { error } = await supabase.from('discussions').insert({
      course_id: courseId,
      user_id: user.id,
      title,
      content,
    })

    if (error) {
      toast.error('Failed to create discussion')
      return
    }

    toast.success('Discussion created!')
    setTitle('')
    setContent('')
    setIsCreating(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/courses" className="hover:text-muted-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold">Course Discussions</h1>
          </div>
          <p className="text-muted-foreground">
            Connect with other students and get help
          </p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? 'Cancel' : 'New Discussion'}
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Start a New Discussion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateDiscussion} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="What's your question?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Provide more details..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1"
                  rows={5}
                />
              </div>
              <Button type="submit" className="w-full">
                Post Discussion
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="py-12 text-center">
        <CardContent>
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No discussions yet</h3>
          <p className="text-muted-foreground">
            Start a discussion to connect with other students
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
