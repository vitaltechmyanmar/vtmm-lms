'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { Discussion, DiscussionReply } from '@/lib/types'

interface DiscussionThreadProps {
  discussion: Discussion & {
    user?: { full_name: string | null; email: string; role?: string } | null
    replies?: (DiscussionReply & {
      user?: { full_name: string | null; email: string; role?: string } | null
    })[]
  }
  currentUserId: string
  currentUserRole?: string
}

function getInitials(name: string | null | undefined, email: string) {
  if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return email.slice(0, 2).toUpperCase()
}

function TimeAgo({ dateStr }: { dateStr: string }) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return <>{days}d ago</>
  if (hours > 0) return <>{hours}h ago</>
  if (mins > 0) return <>{mins}m ago</>
  return <>Just now</>
}

export function DiscussionThread({ discussion, currentUserId, currentUserRole }: DiscussionThreadProps) {
  const [replies, setReplies] = useState(discussion.replies || [])
  const [isExpanded, setIsExpanded] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const supabase = createClient()

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyContent.trim()) return
    setIsSending(true)

    const { data, error } = await supabase
      .from('discussion_replies')
      .insert({ discussion_id: discussion.id, user_id: currentUserId, content: replyContent })
      .select('*, user:profiles(full_name, email, role)')
      .single()

    if (error) {
      toast.error('Failed to post reply')
    } else {
      setReplies([...replies, data])
      setReplyContent('')
      setShowReplyForm(false)
      setIsExpanded(true)
      toast.success('Reply posted!')
    }
    setIsSending(false)
  }

  async function deleteReply(replyId: string) {
    const { error } = await supabase.from('discussion_replies').delete().eq('id', replyId)
    if (error) { toast.error('Failed to delete reply'); return }
    setReplies(replies.filter(r => r.id !== replyId))
    toast.success('Reply deleted')
  }

  const canModerate = currentUserRole === 'admin' || currentUserRole === 'instructor'

  return (
    <div className="space-y-3">
      {/* Main post */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(discussion.user?.full_name, discussion.user?.email ?? '')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-sm">
                {discussion.user?.full_name ?? discussion.user?.email ?? 'User'}
              </span>
              {discussion.user?.role === 'instructor' && (
                <Badge variant="secondary" className="text-xs py-0">Instructor</Badge>
              )}
              {discussion.user?.role === 'admin' && (
                <Badge className="text-xs py-0">Admin</Badge>
              )}
              <span className="text-xs text-muted-foreground">
                <TimeAgo dateStr={discussion.created_at} />
              </span>
            </div>
            <h4 className="mt-0.5 font-semibold">{discussion.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {discussion.content}
            </p>

            {/* Actions */}
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Reply
              </button>
              {replies.length > 0 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <form onSubmit={handleReply} className="mt-3 flex gap-2">
            <Textarea
              placeholder="Write your reply..."
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              rows={2}
              className="flex-1 resize-none text-sm"
            />
            <div className="flex flex-col gap-1">
              <Button type="submit" size="sm" disabled={isSending || !replyContent.trim()}>
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => { setShowReplyForm(false); setReplyContent('') }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Replies */}
      {isExpanded && replies.length > 0 && (
        <div className="ml-6 space-y-2 border-l-2 border-muted pl-4">
          {replies.map(reply => (
            <div key={reply.id} className="rounded-lg border bg-muted/30 p-3">
              <div className="flex gap-3">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="bg-accent/20 text-accent-foreground text-xs">
                    {getInitials(reply.user?.full_name, reply.user?.email ?? '')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                      {reply.user?.full_name ?? reply.user?.email ?? 'User'}
                    </span>
                    {reply.user?.role === 'instructor' && (
                      <Badge variant="secondary" className="text-xs py-0">Instructor</Badge>
                    )}
                    {reply.user?.role === 'admin' && (
                      <Badge className="text-xs py-0">Admin</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      <TimeAgo dateStr={reply.created_at} />
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {reply.content}
                  </p>
                </div>
                {(reply.user_id === currentUserId || canModerate) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete reply?</AlertDialogTitle>
                        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteReply(reply.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
