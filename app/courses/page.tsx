import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, ChevronRight } from 'lucide-react'

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; level?: string; q?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  // Build courses query
  let query = supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(full_name, avatar_url),
      lessons(count),
      enrollments(count)
    `)
    .eq('is_published', true)

  if (params.category) {
    query = query.eq('category', params.category)
  }

  if (params.level) {
    query = query.eq('level', params.level)
  }

  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`)
  }

  const { data: courses } = await query.order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/vitaltech_logo.png" alt="Vital Tech LearnHub" className="h-9 w-9" />
            <span className="text-xl font-bold">Vital Tech LearnHub</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/courses" className="text-sm font-medium text-foreground">
              Browse Courses
            </Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Explore Courses</h1>
          <p className="text-muted-foreground">
            Discover courses taught by expert instructors
          </p>
        </div>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Browse by Category</h2>
            <div className="flex flex-wrap gap-2">
              <Link href="/courses">
                <Badge 
                  variant={!params.category ? "default" : "outline"} 
                  className="cursor-pointer px-4 py-2 text-sm"
                >
                  All
                </Badge>
              </Link>
              {categories.map((cat) => (
                <Link key={cat.id} href={`/courses?category=${cat.name}`}>
                  <Badge
                    variant={params.category === cat.name ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2 text-sm"
                    style={params.category === cat.name ? { backgroundColor: cat.color } : {}}
                  >
                    {cat.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Level Filter */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Filter by Level</h2>
          <div className="flex flex-wrap gap-2">
            <Link href={params.category ? `/courses?category=${params.category}` : '/courses'}>
              <Badge 
                variant={!params.level ? "default" : "outline"} 
                className="cursor-pointer px-4 py-2 text-sm"
              >
                All Levels
              </Badge>
            </Link>
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <Link 
                key={level} 
                href={params.category ? `/courses?category=${params.category}&level=${level}` : `/courses?level=${level}`}
              >
                <Badge
                  variant={params.level === level ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm capitalize"
                >
                  {level}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {(params.category || params.level) && (
          <div className="mb-6 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {params.category && (
              <Badge variant="secondary">{params.category}</Badge>
            )}
            {params.level && (
              <Badge variant="secondary" className="capitalize">{params.level}</Badge>
            )}
            <Link href="/courses" className="text-sm text-primary hover:underline">
              Clear all
            </Link>
          </div>
        )}

        {/* Course Grid */}
        {courses && courses.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {courses.length} course{courses.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="aspect-video bg-muted">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                          {course.level}
                        </span>
                        {course.category && (
                          <span className="text-xs text-muted-foreground">
                            {course.category}
                          </span>
                        )}
                      </div>
                      <h3 className="mb-1 font-semibold line-clamp-2">{course.title}</h3>
                      <p className="mb-3 text-sm text-muted-foreground">
                        by {course.instructor?.full_name || 'Instructor'}
                      </p>
                      <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {course.lessons?.[0]?.count || 0} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.enrollments?.[0]?.count || 0} students
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          {course.price_in_cents === 0 ? (
                            'Free'
                          ) : (
                            `$${(course.price_in_cents / 100).toFixed(2)}`
                          )}
                        </span>
                        <Button size="sm">
                          View Course
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <Card className="py-16 text-center">
            <CardContent>
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No courses found</h3>
              <p className="text-muted-foreground">
                {params.category || params.level 
                  ? 'Try adjusting your filters or browse all courses'
                  : 'Check back later for new courses'
                }
              </p>
              {(params.category || params.level) && (
                <Link href="/courses" className="mt-4 inline-block">
                  <Button variant="outline">View All Courses</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <img src="/vitaltech_logo.png" alt="Vital Tech LearnHub" className="h-8 w-8" />
              <span className="font-semibold">Vital Tech LearnHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Vital Tech LearnHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
