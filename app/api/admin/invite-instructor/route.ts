import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    // Check caller is authenticated and is admin
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (callerProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 })
    }

    const { email, fullName } = await req.json()

    if (!email || !fullName) {
      return NextResponse.json({ error: 'email and fullName are required' }, { status: 400 })
    }

    // Use Supabase Admin client (service role) to send invite
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Check if an invite already exists for this email
    const { data: existingInvite } = await supabase
      .from('instructor_invites')
      .select('id, status, expires_at')
      .eq('email', email)
      .single()

    if (existingInvite) {
      const isExpired = new Date(existingInvite.expires_at) < new Date()
      if (existingInvite.status === 'pending' && !isExpired) {
        return NextResponse.json(
          { error: 'An active invitation already exists for this email.' },
          { status: 409 }
        )
      }
      if (existingInvite.status === 'accepted') {
        return NextResponse.json(
          { error: 'This email has already accepted an instructor invitation.' },
          { status: 409 }
        )
      }
      // If expired, delete old invite and re-invite
      await supabase.from('instructor_invites').delete().eq('id', existingInvite.id)
    }

    // Send magic-link invite email via Supabase admin API
    // The user will sign up with the instructor role via the invite link
    const redirectTo =
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
      `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback?role=instructor`

    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo,
        data: {
          full_name: fullName,
          role: 'instructor',
        },
      }
    )

    if (inviteError) {
      console.error('Supabase invite error:', inviteError)
      return NextResponse.json({ error: inviteError.message }, { status: 500 })
    }

    // Record the invite in our table
    const { error: dbError } = await supabase
      .from('instructor_invites')
      .insert({
        email,
        invited_by: user.id,
        status: 'pending',
      })

    if (dbError) {
      console.error('DB insert error:', dbError)
      // Non-fatal: invite email was sent, just log
    }

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
      userId: inviteData.user?.id,
    })
  } catch (err) {
    console.error('Invite instructor error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
