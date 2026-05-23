'use client'

const techStack = [
  {
    name: 'Linux',
    svg: (
      <svg viewBox="0 0 128 128" className="h-9 w-9">
        <circle cx="64" cy="64" r="58" fill="#f5f5f5" />
        <circle cx="64" cy="64" r="54" fill="none" stroke="#333" strokeWidth="4" />
        <path fill="#333" d="M49 44c0-8.3 6.7-15 15-15s15 6.7 15 15v24c0 8.3-6.7 15-15 15s-15-6.7-15-15V44z" />
        <circle cx="55" cy="52" r="4" fill="white" />
        <circle cx="73" cy="52" r="4" fill="white" />
        <path fill="white" d="M55 66h18c0 5-4 9-9 9s-9-4-9-9z" />
      </svg>
    ),
  },
  {
    name: 'Docker',
    svg: (
      <svg viewBox="0 0 128 128" className="h-9 w-9">
        <path fill="#2496ED" d="M124.8 52.1c-2.8-1.9-9.2-2.6-14.1-1.6-.6-4.9-3.4-9.2-8.3-13l-2.8-1.9-1.9 2.8c-2.4 3.7-3.1 9.8-2.7 14.5-2 1-4.7 2.4-7 3.1H8.7C3.9 55.9 0 59.8 0 64.7c0 16.3 6.4 31.2 17 42.1 10.8 11.1 27 17.4 45.9 17.4 43.7 0 76.7-20.2 92-57.2 5.9.3 18.6.1 25.1-12.4l1.2-2.2-2.1-1.4zm-82.1-2.8h-9.6v9.6h9.6v-9.6zm11.7 0h-9.6v9.6h9.6v-9.6zm11.7 0h-9.6v9.6h9.6v-9.6zm11.7 0h-9.6v9.6h9.6v-9.6zm-35.1-11.6h-9.6v9.6h9.6v-9.6zm11.7 0h-9.6v9.6h9.6v-9.6zm11.7 0h-9.6v9.6h9.6v-9.6zm0-11.7h-9.6v9.6h9.6V26z" />
      </svg>
    ),
  },
  {
    name: 'Kubernetes',
    svg: (
      <svg viewBox="0 0 128 128" className="h-9 w-9">
        <path fill="#326CE5" d="M64 8L16 36v56l48 28 48-28V36L64 8z" />
        <path fill="white" d="M64 20l30 17v34L64 88 34 71V37L64 20zm0 10L42 42v28l22 13 22-13V42L64 30zm-4 18h8v16h-8V48zm-12 8h8v16h-8V56zm24 0h8v16h-8V56z" />
      </svg>
    ),
  },
  {
    name: 'AWS',
    svg: (
      <svg viewBox="0 0 128 128" className="h-9 w-9">
        <path fill="#FF9900" d="M42.3 72.7c0 1.2.1 2.2.4 2.9.3.7.7 1.4 1.2 2.1.2.3.3.5.3.7 0 .3-.2.6-.6 1l-1.9 1.3c-.3.2-.5.3-.7.3-.3 0-.6-.1-.9-.4-.4-.4-.8-.9-1.1-1.4-.3-.6-.6-1.2-1-1.9-2.5 2.9-5.6 4.4-9.3 4.4-2.7 0-4.8-.8-6.3-2.3-1.5-1.5-2.3-3.5-2.3-5.9 0-2.6.9-4.7 2.8-6.3 1.9-1.6 4.4-2.4 7.5-2.4 1 0 2.1.1 3.2.2 1.1.2 2.3.4 3.5.7v-2.2c0-2.3-.5-3.9-1.4-4.8-1-.9-2.7-1.4-5.1-1.4-1.1 0-2.2.1-3.4.4-1.1.3-2.2.6-3.3 1.1-.5.2-.9.3-1.1.3-.4 0-.6-.3-.6-.9v-1.4c0-.5.1-.8.3-1.1.2-.3.5-.5 1-.7 1.1-.6 2.4-1 3.9-1.4 1.5-.4 3-.6 4.7-.6 3.6 0 6.2.8 7.9 2.4 1.6 1.6 2.4 4.1 2.4 7.4v9.7zm-12.9 4.8c1 0 2-.2 3.1-.6 1.1-.4 2.1-1.1 2.9-2 .5-.6.9-1.3 1-2 .2-.7.3-1.6.3-2.7v-1.3c-.9-.2-1.9-.4-2.8-.5-.9-.1-1.8-.2-2.7-.2-1.9 0-3.3.4-4.3 1.2-.9.8-1.4 1.9-1.4 3.3 0 1.3.3 2.3 1 3 .7.7 1.6 1.1 2.9 1.1zm23.2 3.1c-.5 0-.9-.1-1.1-.4-.2-.2-.5-.6-.7-1.2L44 49.9c-.2-.6-.3-1-.3-1.2 0-.5.2-.8.8-.8h3.1c.5 0 .9.1 1.1.4.2.2.4.6.6 1.2l5.5 21.6 5.1-21.6c.2-.6.4-1 .6-1.2.2-.2.6-.4 1.2-.4h2.5c.5 0 .9.1 1.1.4.2.2.5.6.6 1.2l5.2 21.9 5.6-21.9c.2-.6.4-1 .6-1.2.2-.2.6-.4 1.1-.4h3c.5 0 .8.3.8.8 0 .2 0 .3-.1.5l-.2.7-7.9 24.9c-.2.6-.4 1-.7 1.2-.2.2-.6.4-1.1.4h-2.7c-.5 0-.9-.1-1.1-.4-.2-.2-.4-.6-.6-1.2L63 54.2l-5 20.8c-.2.6-.4 1-.6 1.2-.2.2-.6.4-1.2.4h-2.7zm42.2.9c-1.7 0-3.3-.2-4.9-.6-1.6-.4-2.8-.8-3.6-1.4-.5-.3-.8-.7-.9-1-.1-.3-.2-.6-.2-1v-1.5c0-.6.2-.9.7-.9.2 0 .3 0 .5.1.2.1.4.2.7.3.9.4 1.9.8 3 1 1.1.2 2.2.4 3.2.4 1.7 0 3-.3 3.9-.9.9-.6 1.4-1.5 1.4-2.6 0-.8-.2-1.4-.8-1.9-.5-.5-1.5-1-2.9-1.4l-4.1-1.3c-2-.6-3.5-1.6-4.4-2.9-.9-1.2-1.4-2.5-1.4-3.9 0-1.1.2-2.2.7-3 .5-.9 1.2-1.6 2-2.2.8-.6 1.8-1 2.8-1.3 1.1-.3 2.2-.4 3.5-.4.6 0 1.2 0 1.8.1.6.1 1.2.2 1.7.3.6.1 1.1.3 1.6.4.5.2.9.3 1.2.5.4.2.7.5.8.8.2.2.2.6.2 1v1.4c0 .6-.2.9-.7.9-.2 0-.6-.1-1.2-.4-1.6-.7-3.4-1.1-5.4-1.1-1.5 0-2.7.2-3.5.8-.8.5-1.2 1.4-1.2 2.5 0 .7.3 1.4.8 1.9.6.5 1.6 1 3.1 1.5l4 1.3c2 .6 3.4 1.5 4.3 2.7.9 1.1 1.3 2.4 1.3 3.9 0 1.2-.2 2.2-.7 3.2-.5.9-1.1 1.7-2 2.4-.8.7-1.8 1.1-3 1.5-1.2.3-2.6.5-4.1.5z" />
      </svg>
    ),
  },
  {
    name: 'Terraform',
    svg: (
      <svg viewBox="0 0 128 128" className="h-9 w-9">
        <path fill="#7B42BC" d="M50.5 24.7L77.2 40.6v31.8L50.5 56.5V24.7zm0 47.1L77.2 87.7v31.8L50.5 103.6V71.8zM79.8 40.6L106.5 24.7v31.8L79.8 72.4V40.6zM23.8 40.6L50.5 56.5V88.3L23.8 72.4V40.6z" />
      </svg>
    ),
  },
  {
    name: 'Ansible',
    svg: (
      <svg viewBox="0 0 128 128" className="h-9 w-9">
        <circle cx="64" cy="64" r="56" fill="#1A1918" />
        <path fill="#fff" d="M64 16C37.5 16 16 37.5 16 64s21.5 48 48 48 48-21.5 48-48S90.5 16 64 16zm14.4 67.8L62.5 47.4l22.4 39.4h-6.5zm-4.6 2.1H46.1L62.5 47 73.8 85.9z" />
      </svg>
    ),
  },
  {
    name: 'Python',
    svg: (
      <svg viewBox="0 0 128 128" className="h-9 w-9">
        <path fill="#3776AB" d="M63.4 3.3c-28.9 0-27.1 12.5-27.1 12.5l.1 13h27.6v3.9H26.5S8 30.5 8 59.7s15.9 28.2 15.9 28.2h9.5V74.3s-.5-15.9 15.6-15.9H75s15.1.2 15.1-14.6V16.7S92.5 3.3 63.4 3.3zm-15 8.9c2.7 0 4.9 2.2 4.9 4.9S51.1 22 48.4 22s-4.9-2.2-4.9-4.9 2.2-4.9 4.9-4.9z" />
        <path fill="#FFD43B" d="M64.6 124.7c28.9 0 27.1-12.5 27.1-12.5l-.1-13H64v-3.9h37.5s18.5 2.2 18.5-27-15.9-28.2-15.9-28.2h-9.5v13.6s.5 15.9-15.6 15.9H53s-15.1-.2-15.1 14.6v30.1s-2.3 13.4 26.7 13.4zm15-8.9c-2.7 0-4.9-2.2-4.9-4.9s2.2-4.9 4.9-4.9 4.9 2.2 4.9 4.9-2.2 4.9-4.9 4.9z" />
      </svg>
    ),
  },
  {
    name: 'Nginx',
    svg: (
      <svg viewBox="0 0 128 128" className="h-9 w-9">
        <path fill="#009900" d="M64 7.4L11.3 37.2v53.6L64 120.6l52.7-29.8V37.2L64 7.4zm26.4 76.3c0 2.4-2 4-4.3 4-1.7 0-3.1-.8-4.1-2.2L58 57.6v27.6c0 2.5-1.8 4.5-4.3 4.5-2.4 0-4.3-2-4.3-4.5V44.2c0-2.4 2-4.1 4.3-4.1 1.7 0 3.1.9 4.1 2.3l24 27.8V44.4c0-2.5 1.8-4.5 4.3-4.5 2.4 0 4.3 2 4.3 4.5v39.3z" />
      </svg>
    ),
  },
  {
    name: 'Git',
    svg: (
      <svg viewBox="0 0 128 128" className="h-9 w-9">
        <path fill="#F34F29" d="M124.7 57.3L70.7 3.3a11.3 11.3 0 00-16 0L42.4 15.6l20.2 20.2a13.5 13.5 0 0117.1 17.2l19.4 19.4a13.5 13.5 0 01-4.3 22.1 13.5 13.5 0 01-14.7-2.9 13.5 13.5 0 01-2.9-14.7l-18-18V79c.9.4 1.7 1 2.4 1.7a13.5 13.5 0 01-19.1 19.1 13.5 13.5 0 010-19.1c.9-.9 1.9-1.5 3-2V58.5a13.5 13.5 0 01-3-2 13.5 13.5 0 0116.6-20.7L63.3 15.5 8.7 70.1a11.3 11.3 0 000 16l54 54a11.3 11.3 0 0016 0l46-46a11.3 11.3 0 000-16.8z" />
      </svg>
    ),
  },
  {
    name: 'Go',
    svg: (
      <svg viewBox="0 0 128 128" className="h-9 w-9">
        <rect x="8" y="48" width="112" height="32" rx="8" fill="#00ACD7" />
        <circle cx="36" cy="64" r="10" fill="white" />
        <circle cx="36" cy="64" r="5" fill="#00ACD7" />
        <rect x="52" y="56" width="6" height="18" rx="2" fill="white" />
        <path fill="white" d="M64 56h16c4 0 7 3 7 8s-3 8-7 8H64V56zm6 6v4h8c1 0 2-1 2-2s-1-2-2-2h-8z" />
      </svg>
    ),
  },
  {
    name: 'Prometheus',
    svg: (
      <svg viewBox="0 0 128 128" className="h-9 w-9">
        <circle cx="64" cy="64" r="56" fill="#E6522C" />
        <circle cx="64" cy="64" r="40" fill="none" stroke="white" strokeWidth="6" />
        <rect x="61" y="30" width="6" height="24" rx="2" fill="white" />
        <rect x="61" y="74" width="6" height="8" rx="2" fill="white" />
      </svg>
    ),
  },
  {
    name: 'Grafana',
    svg: (
      <svg viewBox="0 0 128 128" className="h-9 w-9">
        <circle cx="64" cy="64" r="56" fill="#F46800" />
        <path fill="white" d="M90 54H74v-8H54v32h20v-8h16v8h8V62h-8v-8zM38 46h10v36H38z" />
      </svg>
    ),
  },
]

export function TechStackMarquee() {
  const doubled = [...techStack, ...techStack]

  return (
    <section className="border-b bg-muted/30 py-8 overflow-hidden">
      <div className="container mx-auto px-4 mb-4 text-center">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
          Technologies you&apos;ll master
        </p>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent" />
        <div
          className="flex gap-8 w-max"
          style={{ animation: 'marquee 30s linear infinite' }}
        >
          {doubled.map((tech, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center gap-2 w-20 flex-shrink-0"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border bg-background shadow-sm hover:shadow-md transition-shadow">
                {tech.svg}
              </div>
              <span className="text-xs font-medium text-muted-foreground">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
