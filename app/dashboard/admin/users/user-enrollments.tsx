'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  BookOpen,
  ChevronDown,
  Loader2,
  UserMinus,
  GraduationCap,
} from 'lucide-react'
import { toast } from 'sonner'
import { useEffect } from 'react'

interface Enrollment {
  id: string
  course_id: string
  enrolled_at: string
  progress_percentage: number
  course: { title: string; thumbnail_url: string | null } | null
}

interface UserEnrollmentsProps {
  userId: string
  userName: string
}

export function UserEnrollments({ userId, userName }: UserEnrollmentsProps) {
  const [open, setOpen] = useState(false)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [unenrolling, setUnenrolling] = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<Enrollment | null>(null)
  const supabase = createClient()

  async function fetchEnrollments() {
    if (loaded) return
    setLoading(true)
    const { data, error } = await supabase
      .from('enrollments')
      .select('id, course_id, enrolled_at, progress_percentage, course:courses(title, thumbnail_url)')
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false })

    if (error) {
      toast.error('Failed to load enrollments')
    } else {
      setEnrollments((data || []) as Enrollment[])
    }
    setLoading(false)
    setLoaded(true)
  }

  async function handleUnenroll(enrollment: Enrollment) {
    setUnenrolling(enrollment.id)
    setConfirmTarget(null)

    try {
      const res = await fetch('/api/admin/unenroll', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, courseId: enrollment.course_id }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to unenroll')
      } else {
        toast.success(`${userName} unenrolled from "${enrollment.course?.title}"`)
        setEnrollments(prev => prev.filter(e => e.id !== enrollment.id))
      }
    } catch {
      toast.error('Network error')
    } finally {
      setUnenrolling(null)
    }
  }

  function handleOpenChange(val: boolean) {
    setOpen(val)
    if (val && !loaded) fetchEnrollments()
  }

  return (
    <>
      <Collapsible open={open} onOpenChange={handleOpenChange}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
            <GraduationCap className="h-3.5 w-3.5" />
            Enrollments
            <ChevronDown
              className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 space-y-2 rounded-lg border bg-muted/20 p-3">
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading enrollments...
              </div>
            ) : enrollments.length === 0 ? (
              <p className="text-xs text-muted-foreground py-1 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                No enrollments yet
              </p>
            ) : (
              <div className="space-y-2">
                {enrollments.map(enrollment => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {enrollment.course?.title || 'Unknown Course'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 px-1.5"
                        >
                          {enrollment.progress_percentage ?? 0}% done
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setConfirmTarget(enrollment)}
                      disabled={unenrolling === enrollment.id}
                    >
                      {unenrolling === enrollment.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <UserMinus className="h-3 w-3 mr-1" />
                          <span className="text-xs">Unenroll</span>
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Confirm dialog */}
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={open => !open && setConfirmTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unenroll Student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{userName}</strong> from{' '}
              <strong>&quot;{confirmTarget?.course?.title}&quot;</strong>. Their
              progress will be lost and they will lose access to the course.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmTarget && handleUnenroll(confirmTarget)}
            >
              Yes, Unenroll
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
