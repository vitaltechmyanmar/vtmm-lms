'use client'

import TechIcon from 'tech-stack-icons'

// Non-programming tools: AI, design, productivity, cloud, databases
const techStack = [
  // DevOps
  { name: 'linux', label: 'Linux' },
  { name: 'docker', label: 'Docker' },
  { name: 'kubernetes', label: 'Kubernetes' },
  { name: 'gitlab', label: 'GitLab' },
  { name: 'rancher', label: 'Rancher' },
  { name: 'redhat', label: 'Redhat' },
  { name: 'bash', label: 'Bash' },
  { name: 'github', label: 'GitHub' },
  { name: 'git', label: 'Git' },

  // Cloud & Infrastructure
  { name: 'aws', label: 'AWS' },
  { name: 'azure', label: 'Azure' },
  { name: 'vercel', label: 'Vercel' },

  // Analytics & Monitoring
  { name: 'grafana', label: 'Grafana' },
]

export function TechStackMarquee() {
  // Duplicate for seamless infinite loop
  const doubled = [...techStack, ...techStack]

  return (
    <section className="border-b bg-muted/30 py-8 overflow-hidden">
      <div className="container mx-auto px-4 mb-4 text-center">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
          Technologies you&apos;ll master
        </p>
      </div>
      <div className="relative">
        {/* Gradient fade on edges */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent" />

        {/* Scrolling row */}
        <div
          className="flex gap-8 w-max"
          style={{ animation: 'marquee 50s linear infinite' }}
        >
          {doubled.map((tech, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center gap-2 w-20 flex-shrink-0"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border bg-background shadow-sm hover:shadow-md transition-shadow p-2">
                <TechIcon
                  name={tech.name as any}
                  style={{ width: '2.25rem', height: '2.25rem' }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground text-center leading-tight">
                {tech.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
