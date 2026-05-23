'use client'

import TechIcon from 'tech-stack-icons'

// Non-programming tools: AI, design, productivity, cloud, databases
const techStack = [
  // AI & ML Tools
  { name: 'openai',      label: 'OpenAI' },
  { name: 'anthropic',   label: 'Anthropic' },
  { name: 'gemini',      label: 'Gemini' },
  { name: 'claude',      label: 'Claude' },
  { name: 'deepseek',    label: 'DeepSeek' },
  { name: 'huggingface', label: 'Hugging Face' },
  { name: 'mistral',     label: 'Mistral' },
  { name: 'perplexity',  label: 'Perplexity' },
  { name: 'copilotms',   label: 'Copilot' },
  { name: 'meta',        label: 'Meta AI' },

  // Design Tools
  { name: 'figma',       label: 'Figma' },
  { name: 'canva',       label: 'Canva' },
  { name: 'photoshop',   label: 'Photoshop' },
  { name: 'framer',      label: 'Framer' },
  { name: 'sketch',      label: 'Sketch' },
  { name: 'invision',    label: 'InVision' },
  { name: 'xd',          label: 'Adobe XD' },
  { name: 'adobe',       label: 'Adobe' },
  { name: 'affinity',    label: 'Affinity' },
  { name: 'miro',        label: 'Miro' },

  // Productivity & Collaboration
  { name: 'notion',      label: 'Notion' },
  { name: 'slack',       label: 'Slack' },
  { name: 'trello',      label: 'Trello' },
  { name: 'airtable',    label: 'Airtable' },
  { name: 'asana',       label: 'Asana' },
  { name: 'jira',        label: 'Jira' },
  { name: 'linear',      label: 'Linear' },
  { name: 'clickup',     label: 'ClickUp' },
  { name: 'zapier',      label: 'Zapier' },
  { name: 'atlassian',   label: 'Atlassian' },

  // Cloud & Infrastructure
  { name: 'aws',         label: 'AWS' },
  { name: 'azure',       label: 'Azure' },
  { name: 'gcloud',      label: 'Google Cloud' },
  { name: 'vercel',      label: 'Vercel' },
  { name: 'netlify',     label: 'Netlify' },
  { name: 'digitalocean',label: 'DigitalOcean' },
  { name: 'cloudflare',  label: 'Cloudflare' },
  { name: 'supabase',    label: 'Supabase' },
  { name: 'firebase',    label: 'Firebase' },
  { name: 'stripe',      label: 'Stripe' },

  // Databases & Storage
  { name: 'postgresql',  label: 'PostgreSQL' },
  { name: 'mongodb',     label: 'MongoDB' },
  { name: 'mysql',       label: 'MySQL' },
  { name: 'redis',       label: 'Redis' },
  { name: 'snowflake',   label: 'Snowflake' },

  // Analytics & Monitoring
  { name: 'analytics',   label: 'Analytics' },
  { name: 'datadog',     label: 'Datadog' },
  { name: 'amplitude',   label: 'Amplitude' },
  { name: 'sentry',      label: 'Sentry' },
  { name: 'grafana',     label: 'Grafana' },
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
