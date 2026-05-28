import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import {
  sendEnrollmentConfirmation,
  sendAdminEnrollmentNotification,
} from '@/lib/email'
import { formatMMKAmount } from '@/lib/format-currency'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      userId,
      courseId,
      type,
    }: { userId?: string; courseId: string; type: 'free' | 'paid' } = body

    // The student is either the current user (free) or specified by admin (paid approval)
    const studentId = userId ?? user.id

    // Use admin client to bypass RLS for reading profile
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Fetch student profile
    const { data: profile } = await adminClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', studentId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    // Fetch course
    const { data: course } = await supabase
      .from('courses')
      .select('title, price_in_cents')
      .eq('id', courseId)
      .single()

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const studentName = profile.full_name || profile.email
    const studentEmail = profile.email

    // Send student confirmation
    await sendEnrollmentConfirmation({
      studentEmail,
      studentName,
      courseName: course.title,
      courseId,
      type,
    })

    // Send admin notification
    await sendAdminEnrollmentNotification({
      studentName,
      studentEmail,
      courseName: course.title,
      amount: type === 'paid' ? formatMMKAmount(course.price_in_cents) : undefined,
      type,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[send-enrollment-email] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
