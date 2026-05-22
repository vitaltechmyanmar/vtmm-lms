import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronRight,
  Terminal,
  Shield,
  Zap,
  Award,
  Users,
  BookOpen,
  Server,
  GitBranch,
  Cloud,
  Container,
  Activity,
} from 'lucide-react'
import { getEnrollmentStats } from '@/app/actions/db'
import { MobileNav } from '@/components/mobile-nav'

// ── Tech Stack SVG icons (inline, no external deps) ──────────────────────────
const TechIcons = {
  Linux: () => (
    <svg viewBox="0 0 128 128" className="h-10 w-10">
      <path fill="#eee" d="M64 6.6c-31.7 0-57.4 25.7-57.4 57.4S32.3 121.4 64 121.4 121.4 95.7 121.4 64 95.7 6.6 64 6.6z"/>
      <path fill="#333" d="M64 10c-29.8 0-54 24.2-54 54s24.2 54 54 54 54-24.2 54-54-24.2-54-54-54zm0 4c27.6 0 50 22.4 50 50S91.6 114 64 114 14 91.6 14 64 36.4 14 64 14z"/>
      <text x="50%" y="58%" textAnchor="middle" fontSize="42" fontWeight="bold" fill="#333" dy=".3em">🐧</text>
    </svg>
  ),
  Docker: () => (
    <svg viewBox="0 0 128 128" className="h-10 w-10">
      <path fill="#2496ED" d="M124.8 52.1c-2.8-1.9-9.2-2.6-14.1-1.6-.6-4.9-3.4-9.2-8.3-13l-2.8-1.9-1.9 2.8c-2.4 3.7-3.1 9.8-2.7 14.5-2 1-4.7 2.4-7 3.1H8.7C3.9 55.9 0 59.8 0 64.7c0 16.3 6.4 31.2 17 42.1 10.8 11.1 27 17.4 45.9 17.4 43.7 0 76.7-20.2 92-57.2 5.9.3 18.6.1 25.1-12.4l1.2-2.2-2.1-1.4zm-82.1-2.8h-9.6v9.6h9.6v-9.6zm11.7 0h-9.6v9.6h9.6v-9.6zm11.7 0h-9.6v9.6h9.6v-9.6zm11.7 0h-9.6v9.6h9.6v-9.6zm-35.1-11.6h-9.6v9.6h9.6v-9.6zm11.7 0h-9.6v9.6h9.6v-9.6zm11.7 0h-9.6v9.6h9.6v-9.6zm0-11.7h-9.6v9.6h9.6V26z"/>
    </svg>
  ),
  Kubernetes: () => (
    <svg viewBox="0 0 128 128" className="h-10 w-10">
      <path fill="#326CE5" d="M64 8L16 36v56l48 28 48-28V36L64 8z"/>
      <path fill="white" d="M64 20l32 18.5v37L64 94l-32-18.5v-37L64 20zm0 8L40 42v28l24 14 24-14V42L64 28zm-4 22h8v16h-8V50zm-12 8h8v16h-8V58zm24 0h8v16h-8V58z"/>
    </svg>
  ),
  AWS: () => (
    <svg viewBox="0 0 128 128" className="h-10 w-10">
      <path fill="#FF9900" d="M40.7 65.9c0 1.5.2 2.7.5 3.5.3.8.8 1.7 1.5 2.6.3.3.4.6.4.9 0 .4-.2.8-.7 1.2l-2.3 1.5c-.3.2-.6.3-.9.3-.4 0-.7-.2-1.1-.5-.5-.5-1-1.1-1.4-1.7-.4-.7-.8-1.4-1.2-2.3-3 3.5-6.7 5.3-11.1 5.3-3.2 0-5.7-.9-7.5-2.7-1.8-1.8-2.7-4.2-2.7-7.1 0-3.1 1.1-5.7 3.3-7.5 2.2-1.9 5.2-2.8 8.9-2.8 1.2 0 2.5.1 3.9.3 1.3.2 2.7.5 4.2.9v-2.6c0-2.8-.6-4.7-1.7-5.8-1.2-1.1-3.2-1.7-6.1-1.7-1.3 0-2.7.2-4 .5-1.4.3-2.7.8-4 1.4-.6.3-1 .4-1.3.4-.5 0-.7-.4-.7-1.1v-1.7c0-.6.1-1 .3-1.3.2-.3.6-.6 1.2-.9 1.3-.7 2.9-1.2 4.6-1.7 1.8-.4 3.6-.7 5.6-.7 4.3 0 7.4 1 9.4 2.9 1.9 1.9 2.9 4.9 2.9 8.8v11.6zm-15.3 5.7c1.2 0 2.4-.2 3.7-.7 1.3-.4 2.4-1.3 3.3-2.4.6-.7 1-1.5 1.2-2.4.2-.9.3-2 .3-3.3v-1.6c-1.1-.3-2.2-.5-3.3-.6-1.1-.1-2.2-.2-3.2-.2-2.3 0-3.9.5-5.1 1.4-1.1.9-1.7 2.2-1.7 3.9 0 1.6.4 2.8 1.3 3.6.8.9 2 1.3 3.5 1.3zm27.5 3.7c-.6 0-1-.1-1.3-.4-.3-.2-.6-.7-.8-1.4L43.4 44c-.2-.7-.3-1.2-.3-1.5 0-.6.3-.9.9-.9h3.7c.6 0 1.1.1 1.3.4.3.2.5.7.7 1.4l6.5 25.5 6-25.5c.2-.7.4-1.2.7-1.4.3-.2.8-.4 1.4-.4h3c.6 0 1.1.1 1.4.4.3.2.5.7.7 1.4l6.1 25.8 6.7-25.8c.2-.7.4-1.2.7-1.4.3-.2.7-.4 1.3-.4h3.5c.6 0 .9.3.9.9 0 .2 0 .4-.1.6-.1.2-.2.5-.3.9l-9.4 29.5c-.2.7-.5 1.2-.8 1.4-.3.2-.7.4-1.3.4h-3.2c-.6 0-1.1-.1-1.4-.4-.3-.2-.5-.7-.7-1.4L65 48.3l-5.9 24.9c-.2.7-.4 1.2-.7 1.4-.3.3-.8.4-1.4.4h-3.2zm50.2 1c-2 0-3.9-.2-5.8-.7-1.9-.5-3.3-1-4.3-1.7-.6-.4-1-.8-1.1-1.2-.1-.4-.2-.8-.2-1.2v-1.8c0-.7.3-1.1.8-1.1.2 0 .4 0 .6.1.2.1.5.2.8.4 1.1.5 2.3.9 3.6 1.2 1.3.3 2.6.4 3.8.4 2 0 3.6-.4 4.7-1.1 1.1-.7 1.7-1.8 1.7-3.1 0-.9-.3-1.7-.9-2.3-.6-.6-1.7-1.2-3.4-1.7l-4.9-1.5c-2.4-.8-4.2-1.9-5.3-3.4-1.1-1.4-1.6-3-1.6-4.7 0-1.4.3-2.6.9-3.6.6-1 1.4-1.9 2.4-2.6 1-.7 2.1-1.2 3.4-1.6 1.3-.4 2.7-.5 4.1-.5.7 0 1.4 0 2.2.1.7.1 1.4.2 2.1.4.7.1 1.3.3 1.9.5.6.2 1.1.4 1.4.6.5.3.8.6 1 .9.2.3.2.7.2 1.2v1.6c0 .7-.3 1.1-.8 1.1-.3 0-.8-.2-1.4-.5-1.9-.9-4-1.3-6.4-1.3-1.8 0-3.2.3-4.2 1-.1.7-1.4 1.7-1.4 3 0 .9.3 1.7 1 2.3.7.6 1.9 1.2 3.7 1.8l4.8 1.5c2.4.8 4.1 1.8 5.2 3.2 1.1 1.4 1.6 2.9 1.6 4.7 0 1.4-.3 2.7-.8 3.8-.6 1.1-1.4 2.1-2.4 2.9-1 .8-2.2 1.4-3.6 1.8-1.5.5-3.1.7-4.8.7z"/>
    </svg>
  ),
  Terraform: () => (
    <svg viewBox="0 0 128 128" className="h-10 w-10">
      <path fill="#7B42BC" d="M50.5 24.7L77.2 40.6v31.8L50.5 56.5V24.7zm0 47.1L77.2 87.7v31.8L50.5 103.6V71.8zM79.8 40.6L106.5 24.7v31.8L79.8 72.4V40.6zM23.8 40.6L50.5 56.5V88.3L23.8 72.4V40.6z"/>
    </svg>
  ),
  Ansible: () => (
    <svg viewBox="0 0 128 128" className="h-10 w-10">
      <circle cx="64" cy="64" r="56" fill="#1A1918"/>
      <path fill="#fff" d="M64 16C37.5 16 16 37.5 16 64s21.5 48 48 48 48-21.5 48-48S90.5 16 64 16zm14.4 67.8L62.5 47.4l22.4 39.4h-6.5zm-4.6 2.1H46.1L62.5 47 73.8 85.9z"/>
    </svg>
  ),
  Python: () => (
    <svg viewBox="0 0 128 128" className="h-10 w-10">
      <path fill="#3776AB" d="M63.4 3.3c-28.9 0-27.1 12.5-27.1 12.5l.1 13h27.6v3.9H26.5S8 30.5 8 59.7s15.9 28.2 15.9 28.2h9.5V74.3s-.5-15.9 15.6-15.9H75s15.1.2 15.1-14.6V16.7S92.5 3.3 63.4 3.3zm-15 8.9c2.7 0 4.9 2.2 4.9 4.9S51.1 22 48.4 22s-4.9-2.2-4.9-4.9 2.2-4.9 4.9-4.9z"/>
      <path fill="#FFD43B" d="M64.6 124.7c28.9 0 27.1-12.5 27.1-12.5l-.1-13H64v-3.9h37.5s18.5 2.2 18.5-27-15.9-28.2-15.9-28.2h-9.5v13.6s.5 15.9-15.6 15.9H53s-15.1-.2-15.1 14.6v30.1s-2.3 13.4 26.7 13.4zm15-8.9c-2.7 0-4.9-2.2-4.9-4.9s2.2-4.9 4.9-4.9 4.9 2.2 4.9 4.9-2.2 4.9-4.9 4.9z"/>
    </svg>
  ),
  Nginx: () => (
    <svg viewBox="0 0 128 128" className="h-10 w-10">
      <path fill="#009900" d="M64 7.4L11.3 37.2v53.6L64 120.6l52.7-29.8V37.2L64 7.4zm26.4 76.3c0 2.4-2 4-4.3 4-1.7 0-3.1-.8-4.1-2.2L58 57.6v27.6c0 2.5-1.8 4.5-4.3 4.5-2.4 0-4.3-2-4.3-4.5V44.2c0-2.4 2-4.1 4.3-4.1 1.7 0 3.1.9 4.1 2.3l24 27.8V44.4c0-2.5 1.8-4.5 4.3-4.5 2.4 0 4.3 2 4.3 4.5v39.3z"/>
    </svg>
  ),
  Git: () => (
    <svg viewBox="0 0 128 128" className="h-10 w-10">
      <path fill="#F34F29" d="M124.7 57.3L70.7 3.3a11.3 11.3 0 00-16 0L42.4 15.6l20.2 20.2a13.5 13.5 0 0117.1 17.2l19.4 19.4a13.5 13.5 0 01-4.3 22.1 13.5 13.5 0 01-14.7-2.9 13.5 13.5 0 01-2.9-14.7l-18-18V79c.9.4 1.7 1 2.4 1.7a13.5 13.5 0 01-19.1 19.1 13.5 13.5 0 010-19.1c.9-.9 1.9-1.5 3-2V58.5a13.5 13.5 0 01-3-2 13.5 13.5 0 0116.6-20.7L63.3 15.5 8.7 70.1a11.3 11.3 0 000 16l54 54a11.3 11.3 0 0016 0l46-46a11.3 11.3 0 000-16.8z"/>
    </svg>
  ),
  Go: () => (
    <svg viewBox="0 0 128 128" className="h-10 w-10">
      <path fill="#00ACD7" d="M13.1 26.8h6.2l-1.4 2.4H12zM20.4 26.8h6.2l-1.4 2.4h-6.2zM6.1 31.6h107.8v64.8H6.1z"/>
      <circle cx="35" cy="64" r="8" fill="white"/>
      <circle cx="35" cy="64" r="4" fill="#00ACD7"/>
      <text x="52" y="72" fontSize="32" fontWeight="bold" fill="white">go</text>
    </svg>
  ),
  Prometheus: () => (
    <svg viewBox="0 0 128 128" className="h-10 w-10">
      <circle cx="64" cy="64" r="56" fill="#E6522C"/>
      <path fill="white" d="M64 24c-22 0-40 18-40 40s18 40 40 40 40-18 40-40-18-40-40-40zm0 68c-15.5 0-28-12.5-28-28s12.5-28 28-28 28 12.5 28 28-12.5 28-28 28zm-3-44h6v20h-6zm0 24h6v6h-6z"/>
    </svg>
  ),
  Grafana: () => (
    <svg viewBox="0 0 128 128" className="h-10 w-10">
      <circle cx="64" cy="64" r="56" fill="#F46800"/>
      <path fill="white" d="M88 56H72v-8H56v24h16v-8h16v8h8V64h-8v-8zM40 48h8v32h-8z"/>
    </svg>
  ),
}

const techStack = [
  { name: 'Linux', Icon: TechIcons.Linux, color: 'text-gray-700 dark:text-gray-300' },
  { name: 'Docker', Icon: TechIcons.Docker, color: 'text-blue-500' },
  { name: 'Kubernetes', Icon: TechIcons.Kubernetes, color: 'text-blue-600' },
  { name: 'AWS', Icon: TechIcons.AWS, color: 'text-orange-500' },
  { name: 'Terraform', Icon: TechIcons.Terraform, color: 'text-purple-600' },
  { name: 'Ansible', Icon: TechIcons.Ansible, color: 'text-red-600' },
  { name: 'Python', Icon: TechIcons.Python, color: 'text-yellow-500' },
  { name: 'Nginx', Icon: TechIcons.Nginx, color: 'text-green-600' },
  { name: 'Git', Icon: TechIcons.Git, color: 'text-orange-600' },
  { name: 'Go', Icon: TechIcons.Go, color: 'text-cyan-500' },
  { name: 'Prometheus', Icon: TechIcons.Prometheus, color: 'text-orange-500' },
  { name: 'Grafana', Icon: TechIcons.Grafana, color: 'text-orange-400' },
]

const learningPaths = [
  {
    icon: Server,
    title: 'Linux & System Admin',
    desc: 'File systems, process management, networking, shell scripting',
    tags: ['Bash', 'systemd', 'cron'],
    color: 'from-gray-500/20 to-gray-600/5',
    iconColor: 'bg-gray-500/10 text-gray-700 dark:text-gray-300',
  },
  {
    icon: Container,
    title: 'Containers & Orchestration',
    desc: 'Docker, Kubernetes, Helm, container security and CI/CD pipelines',
    tags: ['Docker', 'K8s', 'Helm'],
    color: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'bg-blue-500/10 text-blue-600',
  },
  {
    icon: Cloud,
    title: 'Cloud Infrastructure',
    desc: 'AWS, Terraform, Ansible — provision and manage cloud resources as code',
    tags: ['AWS', 'IaC', 'Terraform'],
    color: 'from-orange-500/20 to-orange-600/5',
    iconColor: 'bg-orange-500/10 text-orange-600',
  },
  {
    icon: GitBranch,
    title: 'CI/CD & Automation',
    desc: 'GitHub Actions, Jenkins, GitLab CI — automate builds, tests, and deployments',
    tags: ['GitHub Actions', 'Jenkins', 'GitOps'],
    color: 'from-green-500/20 to-green-600/5',
    iconColor: 'bg-green-500/10 text-green-600',
  },
  {
    icon: Shield,
    title: 'Security & Hardening',
    desc: 'DevSecOps practices, vulnerability scanning, secrets management',
    tags: ['Vault', 'Trivy', 'RBAC'],
    color: 'from-red-500/20 to-red-600/5',
    iconColor: 'bg-red-500/10 text-red-600',
  },
  {
    icon: Activity,
    title: 'Monitoring & Observability',
    desc: 'Prometheus, Grafana, ELK Stack — build reliable, observable systems',
    tags: ['Prometheus', 'Grafana', 'ELK'],
    color: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'bg-purple-500/10 text-purple-600',
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
        {/* Background grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 gap-1.5 py-1.5 px-3" variant="outline">
              <Terminal className="h-3.5 w-3.5" />
              DevOps & Cloud Engineering Courses
            </Badge>

            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Master{' '}
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                DevOps
              </span>
              {' '}from the ground up
            </h1>

            <p className="mb-8 text-pretty text-base text-muted-foreground md:text-xl">
              Learn Linux, Docker, Kubernetes, AWS, CI/CD and more — taught by a working
              System & DevOps Engineer. Build real skills for real-world infrastructure.
            </p>

            {/* Terminal preview */}
            <div className="mx-auto mb-8 max-w-lg rounded-xl border bg-zinc-950 text-left shadow-2xl overflow-hidden">
              <div className="flex items-center gap-1.5 border-b border-zinc-800 px-4 py-2.5">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-zinc-500">devops@vtmm ~ </span>
              </div>
              <div className="p-4 font-mono text-sm space-y-1.5 text-green-400">
                <div><span className="text-zinc-500">$</span> kubectl get pods -n production</div>
                <div className="text-xs text-zinc-400">NAME &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; READY &nbsp; STATUS &nbsp; RESTARTS</div>
                <div className="text-xs"><span className="text-green-400">api-7d4f9b8c4-xk2p9 &nbsp; 1/1 &nbsp;&nbsp;&nbsp; Running &nbsp; 0</span></div>
                <div className="text-xs"><span className="text-green-400">web-6c8d7f9b4-mn3q8 &nbsp; 1/1 &nbsp;&nbsp;&nbsp; Running &nbsp; 0</span></div>
                <div><span className="text-zinc-500">$</span> <span className="animate-pulse">▌</span></div>
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

      {/* Tech Stack Marquee */}
      <section className="border-b bg-muted/30 py-8 overflow-hidden">
        <div className="container mx-auto px-4 mb-4 text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
            Technologies you'll master
          </p>
        </div>
        <div className="relative">
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent" />

          <div className="flex animate-[marquee_30s_linear_infinite] gap-8 w-max">
            {[...techStack, ...techStack].map((tech, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-2 w-20 flex-shrink-0"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border bg-background shadow-sm hover:shadow-md transition-shadow">
                  <tech.Icon />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: stats.users.toLocaleString(), label: 'Registered Members' },
              { value: stats.courses.toLocaleString(), label: 'Courses Available' },
              { value: stats.enrollments.toLocaleString(), label: 'Total Enrollments' },
              { value: '100%', label: 'Practical Content' },
            ].map(stat => (
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
            <Badge className="mb-3" variant="secondary">Learning Paths</Badge>
            <h2 className="mb-4 text-3xl font-bold">Build real DevOps skills</h2>
            <p className="text-muted-foreground">
              Structured courses covering every layer of modern infrastructure —
              from the OS up to cloud-native deployments.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {learningPaths.map(path => (
              <div
                key={path.title}
                className={`rounded-xl border bg-gradient-to-br p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 ${path.color}`}
              >
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg ${path.iconColor}`}>
                  <path.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-lg">{path.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{path.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {path.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs py-0.5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
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
                icon: Terminal,
                title: 'Hands-on Labs',
                desc: 'Every course includes real-world exercises. No theoretical fluff — just commands that work in production.',
              },
              {
                icon: Zap,
                title: 'Always Up-to-date',
                desc: 'Content is kept current with the latest versions. AWS, K8s, Terraform — what you learn is what you use.',
              },
              {
                icon: Award,
                title: 'Certificate of Completion',
                desc: 'Earn a verified certificate for every course you finish to prove your skills to employers.',
              },
            ].map(feat => (
              <div key={feat.title} className="rounded-xl border bg-card p-8 transition-shadow hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feat.icon className="h-6 w-6 text-primary" />
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
