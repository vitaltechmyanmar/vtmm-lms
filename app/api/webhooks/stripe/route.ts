import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Use admin client to bypass RLS for webhook operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const courseId = session.metadata?.course_id
    const userId = session.metadata?.user_id

    if (!courseId || !userId) {
      console.error('Missing metadata in checkout session')
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    try {
      // Update payment status
      const { data: payment } = await supabaseAdmin
        .from('payments')
        .update({
          status: 'completed',
          stripe_payment_intent_id: session.payment_intent as string,
          completed_at: new Date().toISOString(),
        })
        .eq('stripe_checkout_session_id', session.id)
        .select('id')
        .single()

      // Create enrollment
      const { error: enrollmentError } = await supabaseAdmin
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
          payment_id: payment?.id,
        })

      if (enrollmentError) {
        // Handle duplicate enrollment gracefully
        if (enrollmentError.code !== '23505') {
          console.error('Error creating enrollment:', enrollmentError)
        }
      }

      console.log(`Successfully enrolled user ${userId} in course ${courseId}`)
    } catch (error) {
      console.error('Error processing checkout completion:', error)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session

    // Update payment status to failed
    await supabaseAdmin
      .from('payments')
      .update({ status: 'failed' })
      .eq('stripe_checkout_session_id', session.id)
  }

  return NextResponse.json({ received: true })
}
