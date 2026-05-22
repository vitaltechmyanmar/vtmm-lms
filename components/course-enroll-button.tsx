'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MyanmarPaymentCheckout } from '@/components/checkout'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface CourseEnrollButtonProps {
  courseId: string
  courseName: string
  priceInCents: number
  isEnrolled: boolean
  isLoggedIn: boolean
}

export function CourseEnrollButton({
  courseId,
  courseName,
  priceInCents,
  isEnrolled,
  isLoggedIn,
}: CourseEnrollButtonProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleFreeEnroll() {
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/courses/${courseId}`)
      return
    }

    setIsEnrolling(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please log in to enroll')
      setIsEnrolling(false)
      return
    }

    const { error } = await supabase.from('enrollments').insert({
      user_id: user.id,
      course_id: courseId,
    })

    if (error) {
      if (error.code === '23505') {
        toast.error('You are already enrolled in this course')
      } else {
        toast.error('Failed to enroll. Please try again.')
      }
      setIsEnrolling(false)
      return
    }

    toast.success('Successfully enrolled!')
    router.push(`/courses/${courseId}/learn`)
    router.refresh()
  }

  // Already enrolled
  if (isEnrolled) {
    return (
      <Link href={`/courses/${courseId}/learn`}>
        <Button className="w-full" size="lg">
          Continue Learning
        </Button>
      </Link>
    )
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <Link href={`/auth/login?redirect=/courses/${courseId}`}>
        <Button className="w-full" size="lg">
          Sign in to Enroll
        </Button>
      </Link>
    )
  }

  // Free course — direct enroll
  if (priceInCents === 0) {
    return (
      <Button
        className="w-full"
        size="lg"
        onClick={handleFreeEnroll}
        disabled={isEnrolling}
      >
        {isEnrolling ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enrolling...
          </>
        ) : (
          'Enroll for Free'
        )}
      </Button>
    )
  }

  // Paid course — Myanmar payment dialog
  return (
    <>
      <Button
        className="w-full"
        size="lg"
        onClick={() => setIsCheckoutOpen(true)}
      >
        Enroll Now — Pay via KBZ / Wave
      </Button>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="sr-only">Payment</DialogTitle>
          </DialogHeader>
          <MyanmarPaymentCheckout
            courseId={courseId}
            courseName={courseName}
            priceInKyats={priceInCents}
            onCancel={() => setIsCheckoutOpen(false)}
            onSuccess={() => {
              setIsCheckoutOpen(false)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
