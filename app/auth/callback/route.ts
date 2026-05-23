import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      const userEmail = data.user.email

      // Mark instructor invite as accepted if one exists
      if (userEmail) {
        await supabase
          .from('instructor_invites')
          .update({ status: 'accepted', accepted_at: new Date().toISOString() })
          .eq('email', userEmail)
          .eq('status', 'pending')
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
