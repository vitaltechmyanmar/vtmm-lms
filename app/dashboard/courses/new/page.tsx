'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { CourseLevel } from '@/lib/types'

const CATEGORIES = [
  'Programming',
  'Design',
  'Business',
  'Marketing',
  'Photography',
  'Music',
  'Health',
  'Language',
  'Data Science',
  'DevOps',
  'Mobile Development',
  'Cybersecurity',
  'Other',
]

export default function NewCoursePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState<CourseLevel>('beginner')
  const [priceInCents, setPriceInCents] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin' && profile?.role !== 'instructor') {
        toast.error('Only instructors and administrators can create courses')
        router.push('/dashboard')
        return
      }

      setIsAuthorized(true)
      setCheckingAuth(false)
    }

    checkAuth()
  }, [supabase, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('You must be logged in')
      setIsLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'instructor') {
      toast.error('Only instructors and administrators can create courses')
      setIsLoading(false)
      router.push('/dashboard')
      return
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        title,
        description,
        category: category || null,
        level,
        price_in_cents: Math.round(parseFloat(priceInCents || '0') * 100),
        thumbnail_url: thumbnailUrl || null,
        instructor_id: user.id,
        is_published: false,
        what_you_will_learn: [],
        requirements: [],
        tags: [],
        language: 'English',
      })
      .select('id')
      .single()

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    toast.success('Course created!')
    router.push(`/dashboard/courses/${data.id}`)
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthorized) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Course</h1>
          <p className="text-muted-foreground">Fill in the basic details to get started</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            You can add more content, lessons, and settings after creating the course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Complete Web Development Bootcamp"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What will students learn in this course?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat.toLowerCase()}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select value={level} onValueChange={v => setLevel(v as CourseLevel)} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={priceInCents}
                  onChange={e => setPriceInCents(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">Leave empty for a free course</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={thumbnailUrl}
                  onChange={e => setThumbnailUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isLoading || !title.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Course'
                )}
              </Button>
              <Link href="/dashboard/courses">
                <Button variant="outline" type="button" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
