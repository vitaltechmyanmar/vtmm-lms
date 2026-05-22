import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_TYPES = [
  // Documents
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  // Archives
  'application/zip', 'application/x-zip-compressed',
]

const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'instructor'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Supported: PDF, PPT, PPTX, DOC, DOCX, XLS, XLSX, TXT, MD, images, ZIP' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size must be under 20 MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'bin'
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filename = `lesson-resources/${user.id}-${Date.now()}-${safeName}`

    const blob = await put(filename, file, { access: 'public' })

    return NextResponse.json({
      url: blob.url,
      file_name: file.name,
      file_size: file.size,
      content_type: file.type,
    })
  } catch (error) {
    console.error('Resource upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
