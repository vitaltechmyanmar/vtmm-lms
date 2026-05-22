import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Target, 
  Heart, 
  Lightbulb, 
  Users, 
  Globe, 
  Award, 
  BookOpen,
  ChevronRight,
  Mail,
  MapPin,
  Phone
} from 'lucide-react'
import { MobileNav } from '@/components/mobile-nav'

export default async function AboutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get some stats
  const { count: coursesCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/vitaltech_logo.png" alt="Vital Tech LearnHub" className="h-9 w-9" />
            <span className="text-xl font-bold">Vital Tech LearnHub</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/courses" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Browse Courses
            </Link>
            <Link href="/about" className="text-sm font-medium text-foreground">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="hidden md:inline-flex">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <div className="hidden items-center gap-3 md:flex">
                <Link href="/auth/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
            <MobileNav
              isLoggedIn={!!user}
              links={[
                { href: '/courses', label: 'Browse Courses' },
                { href: '/about', label: 'About' },
              ]}
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-background via-background to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              About <span className="text-primary">Vital Tech LearnHub</span>
            </h1>
            <p className="text-pretty text-lg text-muted-foreground md:text-xl">
              Empowering learners worldwide with high-quality, accessible education. 
              We believe everyone deserves the opportunity to learn, grow, and succeed.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
                  <Target className="h-7 w-7 text-primary-foreground" />
                </div>
                <h2 className="mb-4 text-2xl font-bold">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To democratize education by providing world-class learning experiences that are 
                  accessible, engaging, and practical. We strive to bridge the gap between 
                  traditional education and real-world skills, empowering individuals to achieve 
                  their full potential regardless of their background or location.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
                  <Lightbulb className="h-7 w-7 text-primary-foreground" />
                </div>
                <h2 className="mb-4 text-2xl font-bold">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To become the leading platform for transformative learning, where every person 
                  has the tools and support they need to master new skills, advance their careers, 
                  and make a positive impact in their communities. We envision a world where 
                  learning never stops and opportunities are limitless.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="border-y bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Our Core Values</h2>
            <p className="text-muted-foreground">
              These principles guide everything we do at Vital Tech LearnHub
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Excellence</h3>
              <p className="text-sm text-muted-foreground">
                We maintain the highest standards in course content and delivery
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20 dark:bg-accent/10">
                <Globe className="h-8 w-8 text-accent-foreground dark:text-accent" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Accessibility</h3>
              <p className="text-sm text-muted-foreground">
                Education should be available to everyone, everywhere
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Community</h3>
              <p className="text-sm text-muted-foreground">
                Learning is better together, with peers and mentors
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/30">
                <Heart className="h-8 w-8 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Passion</h3>
              <p className="text-sm text-muted-foreground">
                We love what we do and it shows in our work
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Our Impact</h2>
            <p className="text-muted-foreground">
              Numbers that reflect our commitment to transforming lives through education
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary md:text-5xl">{usersCount || 0}+</div>
              <div className="mt-2 text-sm text-muted-foreground">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary md:text-5xl">{coursesCount || 0}+</div>
              <div className="mt-2 text-sm text-muted-foreground">Courses Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary md:text-5xl">50+</div>
              <div className="mt-2 text-sm text-muted-foreground">Expert Instructors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary md:text-5xl">95%</div>
              <div className="mt-2 text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Why Choose Vital Tech LearnHub?</h2>
            <p className="text-muted-foreground">
              We go beyond traditional online learning to deliver exceptional experiences
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <Award className="mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Industry-Recognized Certificates</h3>
                <p className="text-muted-foreground">
                  Earn certificates that are valued by employers and demonstrate your expertise 
                  in your chosen field.
                </p>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <Users className="mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Expert Instructors</h3>
                <p className="text-muted-foreground">
                  Learn from industry professionals with years of real-world experience and 
                  passion for teaching.
                </p>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <Lightbulb className="mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Practical Learning</h3>
                <p className="text-muted-foreground">
                  Our courses focus on hands-on projects and real-world applications, not just 
                  theory.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Get in Touch</h2>
              <p className="text-muted-foreground">
                Have questions? We&apos;d love to hear from you.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">Email</h3>
                  <p className="text-sm text-muted-foreground">support@vitaltech.com</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">Phone</h3>
                  <p className="text-sm text-muted-foreground">+95 9 123 456 789</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">Address</h3>
                  <p className="text-sm text-muted-foreground">Yangon, Myanmar</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="mb-8 text-primary-foreground/80">
              Join thousands of learners and start mastering new skills today.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/sign-up">
                <Button size="lg" variant="secondary">
                  Get Started Free
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <img src="/vitaltech_logo.png" alt="Vital Tech LearnHub" className="h-8 w-8" />
              <span className="font-semibold">Vital Tech LearnHub</span>
            </div>
            <nav className="flex gap-6">
              <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground">
                Courses
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Vital Tech LearnHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
