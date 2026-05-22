'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Loader2, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface CourseReviewsProps {
  courseId: string
  isEnrolled: boolean
  userId?: string
}

interface Review {
  id: string
  user_id: string
  rating: number
  review: string | null
  created_at: string
  updated_at: string
  user: { full_name: string | null; avatar_url: string | null; email: string } | null
}

function StarRating({
  value,
  onChange,
  size = 'md',
}: {
  value: number
  onChange?: (v: number) => void
  size?: 'sm' | 'md' | 'lg'
}) {
  const [hovered, setHovered] = useState(0)
  const sizeClass = size === 'lg' ? 'h-8 w-8' : size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            className={`${sizeClass} transition-colors ${
              star <= (hovered || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-muted text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export function CourseReviews({ courseId, isEnrolled, userId }: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [myRating, setMyRating] = useState(0)
  const [myReviewText, setMyReviewText] = useState('')
  const [myExistingReview, setMyExistingReview] = useState<Review | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  async function fetchReviews() {
    setLoading(true)
    const { data } = await supabase
      .from('course_reviews')
      .select('*, user:profiles(full_name, avatar_url, email)')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })

    const all = (data || []) as Review[]
    setReviews(all)

    if (userId) {
      const mine = all.find(r => r.user_id === userId)
      if (mine) {
        setMyExistingReview(mine)
        setMyRating(mine.rating)
        setMyReviewText(mine.review || '')
      }
    }
    setLoading(false)
  }

  useEffect(() => { fetchReviews() }, [courseId])

  async function handleSubmitReview() {
    if (myRating === 0) {
      toast.error('Please select a star rating')
      return
    }
    setSubmitting(true)

    const payload = {
      user_id: userId!,
      course_id: courseId,
      rating: myRating,
      review: myReviewText.trim() || null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('course_reviews')
      .upsert(payload, { onConflict: 'user_id,course_id' })

    if (error) {
      toast.error('Failed to submit review')
    } else {
      toast.success(myExistingReview ? 'Review updated!' : 'Review submitted!')
      setIsEditing(false)
      fetchReviews()
    }
    setSubmitting(false)
  }

  async function handleDeleteReview() {
    if (!myExistingReview) return
    if (!confirm('Delete your review?')) return

    const { error } = await supabase
      .from('course_reviews')
      .delete()
      .eq('id', myExistingReview.id)

    if (error) {
      toast.error('Failed to delete review')
    } else {
      toast.success('Review deleted')
      setMyExistingReview(null)
      setMyRating(0)
      setMyReviewText('')
      fetchReviews()
    }
  }

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
  }))

  return (
    <div className="space-y-6">
      {/* Aggregate Stats */}
      {reviews.length > 0 && (
        <div className="flex flex-wrap gap-6 items-center">
          <div className="text-center">
            <p className="text-5xl font-bold">{avgRating.toFixed(1)}</p>
            <StarRating value={Math.round(avgRating)} size="sm" />
            <p className="text-xs text-muted-foreground mt-1">{reviews.length} reviews</p>
          </div>
          <div className="flex-1 space-y-1 min-w-[140px]">
            {ratingCounts.map(({ stars, count }) => (
              <div key={stars} className="flex items-center gap-2 text-xs">
                <span className="w-4 text-right text-muted-foreground">{stars}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-yellow-400"
                    style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-4 text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write a review — only enrolled users */}
      {isEnrolled && userId && (
        <div className="rounded-lg border p-4 space-y-3">
          {myExistingReview && !isEditing ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">Your Review</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={handleDeleteReview}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <StarRating value={myExistingReview.rating} size="sm" />
              {myExistingReview.review && (
                <p className="text-sm text-muted-foreground mt-1">{myExistingReview.review}</p>
              )}
            </div>
          ) : (
            <>
              <p className="font-medium text-sm">
                {myExistingReview ? 'Edit Your Review' : 'Rate this course'}
              </p>
              <StarRating value={myRating} onChange={setMyRating} size="lg" />
              <Textarea
                placeholder="Share your experience (optional)..."
                value={myReviewText}
                onChange={e => setMyReviewText(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmitReview}
                  disabled={submitting || myRating === 0}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {myExistingReview ? 'Update Review' : 'Submit Review'}
                </Button>
                {myExistingReview && (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No reviews yet. {isEnrolled ? 'Be the first to review!' : ''}
        </p>
      ) : (
        <div className="space-y-4">
          {reviews
            .filter(r => r.user_id !== userId || !isEditing)
            .map(review => (
              <div key={review.id} className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={review.user?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {review.user?.full_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm">{review.user?.full_name || 'Anonymous'}</span>
                    <StarRating value={review.rating} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {review.review && (
                    <p className="text-sm text-muted-foreground">{review.review}</p>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
