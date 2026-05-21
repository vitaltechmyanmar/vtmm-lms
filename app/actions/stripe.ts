'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function createCourseCheckoutSession(courseId: string) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'You must be logged in to purchase a course' }
  }

  // Get course details
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*, instructor:profiles!instructor_id(full_name)')
    .eq('id', courseId)
    .eq('is_published', true)
    .single()

  if (courseError || !course) {
    return { error: 'Course not found' }
  }

  // Check if already enrolled
  const { data: existingEnrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single()

  if (existingEnrollment) {
    return { error: 'You are already enrolled in this course' }
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email, full_name')
    .eq('id', user.id)
    .single()

  let stripeCustomerId = profile?.stripe_customer_id

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: profile?.email || user.email,
      name: profile?.full_name || undefined,
      metadata: {
        supabase_user_id: user.id,
      },
    })
    stripeCustomerId = customer.id

    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', user.id)
  }

  const headersList = await headers()
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.title,
            description: course.description || `Course by ${course.instructor?.full_name || 'LearnHub'}`,
          },
          unit_amount: course.price_in_cents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    ui_mode: 'embedded',
    return_url: `${origin}/courses/${courseId}/success?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      course_id: courseId,
      user_id: user.id,
    },
  })

  // Create pending payment record
  await supabase.from('payments').insert({
    user_id: user.id,
    course_id: courseId,
    stripe_checkout_session_id: session.id,
    amount_in_cents: course.price_in_cents,
    status: 'pending',
  })

  return { clientSecret: session.client_secret, sessionId: session.id }
}
