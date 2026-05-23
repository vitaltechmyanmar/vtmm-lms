import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  ChevronRight,
  Terminal,
  Shield,
  Zap,
  Award,
  BookOpen,
  Server,
  GitBranch,
  Cloud,
  Container,
  Activity,
} from 'lucide-react'
import { getEnrollmentStats } from '@/app/actions/db'
import { MobileNav } from '@/components/mobile-nav'
import { TechStackMarquee } from '@/components/tech-stack-marquee'

const learningPaths = [
  {
    icon: Server,
    title: 'Linux & System Admin',
    desc: 'File systems, process management, networking, shell scripting',
    tags: ['Bash', 'systemd', 'cron'],
    gradFrom: '#6b728022',
    border: 'border-gray-300 dark:border-gray-700',
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconColor: 'text-gray-700 dark:text-gray-300',
  },
  {
    icon: Container,
    title: 'Containers & Orchestration',
    desc: 'Docker, Kubernetes, Helm, container security and CI/CD pipelines',
    tags: ['Docker', 'K8s', 'Helm'],
    gradFrom: '#3b82f622',
    border: 'border-blue-200 dark:border-blue-900',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600',
  },
  {
    icon: Cloud,
    title: 'Cloud Infrastructure',
    desc: 'AWS, Terraform, Ansible — provision and manage cloud resources as code',
    tags: ['AWS', 'IaC', 'Terraform'],
    gradFrom: '#f9731622',
    border: 'border-orange-200 dark:border-orange-900',
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    iconColor: 'text-orange-600',
  },
  {
    icon: GitBranch,
    title: 'CI/CD & Automation',
    desc: 'GitHub Actions, Jenkins, GitLab CI — automate builds, tests, and deployments',
    tags: ['GitHub Actions', 'Jenkins', 'GitOps'],
    gradFrom: '#22c55e22',
    border: 'border-green-200 dark:border-green-900',
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconColor: 'text-green-600',
  },
  {
    icon: Shield,
    title: 'Security & Hardening',
    desc: 'DevSecOps practices, vulnerability scanning, secrets management',
    tags: ['Vault', 'Trivy', 'RBAC'],
    gradFrom: '#ef444422',
    border: 'border-red-200 dark:border-red-900',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    iconColor: 'text-red-600',
  },
  {
    icon: Activity,
    title: 'Monitoring & Observability',
    desc: 'Prometheus, Grafana, ELK Stack — build reliable, observable systems',
    tags: ['Prometheus', 'Grafana', 'ELK'],
    gradFrom: '#a855f722',
    border: 'border-purple-200 dark:border-purple-900',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconColor: 'text-purple-600',
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const stats = await getEnrollmentStats()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <img src="/vitaltech_logo.png" alt="Vital Tech LearnHub" className="h-9 w-9 flex-shrink-0" />
            <span className="text-lg font-bold hidden sm:block">Vital Tech LearnHub</span>
            <span className="text-lg font-bold sm:hidden">VT LearnHub</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/courses" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Browse Courses
            </Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link href="/dashboard" className="hidden md:inline-flex">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
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
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-background via-background to-primary/5 py-16 md:py-28">
        {/* Grid background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(to right,#8883 1px,transparent 1px),linear-gradient(to bottom,#8883 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge pill */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm font-medium shadow-sm">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              DevOps &amp; Cloud Engineering Courses
            </div>

            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Master{' '}
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                DevOps
              </span>
              {' '}from the ground up
            </h1>

            <p className="mb-8 text-base text-muted-foreground md:text-xl">
              Learn Linux, Docker, Kubernetes, AWS, CI/CD and more — taught by a working
              System &amp; DevOps Engineer. Build real skills for real-world infrastructure.
            </p>

            {/* Terminal preview */}
            <div className="mx-auto mb-8 max-w-lg rounded-xl border bg-zinc-950 text-left shadow-2xl overflow-hidden">
              <div className="flex items-center gap-1.5 border-b border-zinc-800 px-4 py-2.5">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-zinc-500 select-none">devops@vtmm ~ </span>
              </div>
              <div className="p-4 font-mono text-sm space-y-1.5">
                <p className="text-zinc-400"><span className="text-zinc-600">$</span> kubectl get pods -n production</p>
                <p className="text-xs text-zinc-500">NAME &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; READY &nbsp; STATUS &nbsp; RESTARTS</p>
                <p className="text-xs text-green-400">api-7d4f9b8c4-xk2p9 &nbsp; 1/1 &nbsp;&nbsp;&nbsp; Running &nbsp; 0</p>
                <p className="text-xs text-green-400">web-6c8d7f9b4-mn3q8 &nbsp; 1/1 &nbsp;&nbsp;&nbsp; Running &nbsp; 0</p>
                <p className="text-zinc-400"><span className="text-zinc-600">$</span> <span className="animate-pulse text-green-400">▌</span></p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/auth/sign-up">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Learning Free
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Marquee (client component) */}
      <TechStackMarquee />

      {/* Stats */}
      <section className="border-b py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {([
              { value: stats.users.toLocaleString(), label: 'Registered Members' },
              { value: stats.courses.toLocaleString(), label: 'Courses Available' },
              { value: stats.enrollments.toLocaleString(), label: 'Total Enrollments' },
              { value: '100%', label: 'Practical Content' },
            ] as const).map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="mb-3 inline-block rounded-full border bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground uppercase tracking-widest">
              Learning Paths
            </span>
            <h2 className="mb-4 text-3xl font-bold">Build real DevOps skills</h2>
            <p className="text-muted-foreground">
              Structured courses covering every layer of modern infrastructure —
              from the OS up to cloud-native deployments.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {learningPaths.map(path => {
              const Icon = path.icon
              return (
                <div
                  key={path.title}
                  className={`rounded-xl border p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 ${path.border}`}
                  style={{ background: `linear-gradient(135deg,${path.gradFrom},transparent)` }}
                >
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg ${path.iconBg}`}>
                    <Icon className={`h-6 w-6 ${path.iconColor}`} />
                  </div>
                  <h3 className="mb-2 font-semibold text-lg">{path.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{path.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {path.tags.map(tag => (
                      <span key={tag} className="rounded-full border bg-background/80 px-2.5 py-0.5 text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why VT LearnHub */}
      <section className="border-t border-b bg-muted/20 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Why learn with us?</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                Icon: Terminal,
                title: 'Hands-on Labs',
                desc: 'Every course includes real-world exercises. No theoretical fluff — just commands that work in production.',
              },
              {
                Icon: Zap,
                title: 'Always Up-to-date',
                desc: 'Content is kept current with the latest versions. AWS, K8s, Terraform — what you learn is what you use.',
              },
              {
                Icon: Award,
                title: 'Certificate of Completion',
                desc: 'Earn a verified certificate for every course you finish to prove your skills to employers.',
              },
            ].map(feat => (
              <div key={feat.title} className="rounded-xl border bg-card p-8 transition-shadow hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feat.Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feat.title}</h3>
                <p className="text-muted-foreground text-sm">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-blue-500/10 p-10 text-center shadow-lg">
            <h2 className="mb-4 text-3xl font-bold">Ready to level up?</h2>
            <p className="mb-8 text-muted-foreground">
              Join engineers learning Linux, containers, CI/CD and cloud infrastructure
              with Vital Tech LearnHub.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/auth/sign-up">
                <Button size="lg" className="w-full sm:w-auto">
                  Create Free Account
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Explore Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <img src="/vitaltech_logo.png" alt="Vital Tech LearnHub" className="h-8 w-8" />
              <span className="font-semibold">Vital Tech LearnHub</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link href="/courses" className="hover:text-foreground transition-colors">Courses</Link>
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link href="/auth/login" className="hover:text-foreground transition-colors">Sign In</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Vital Tech Myanmar
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
