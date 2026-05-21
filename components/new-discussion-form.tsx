'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface NewDiscussionFormProps {
  courseId: string
}

export function NewDiscussionForm({ courseId }: NewDiscussionFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in title and description')
      return
    }
    setIsSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('You must be logged in'); setIsSaving(false); return }

    const { error } = await supabase.from('discussions').insert({
      course_id: courseId,
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
    })

    if (error) {
      toast.error('Failed to post discussion')
    } else {
      toast.success('Discussion posted!')
      setTitle('')
      setContent('')
      setIsOpen(false)
      router.refresh()
    }
    setIsSaving(false)
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Start Discussion
      </Button>
    )
  }

  return (
    <Card className="border-primary/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
        <CardTitle className="text-base">New Discussion</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Discussion title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <Textarea
            placeholder="Describe your question or topic in detail..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            required
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Discussion
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
