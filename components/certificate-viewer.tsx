'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Download, Award, Eye } from 'lucide-react'
import type { Certificate } from '@/lib/types'

interface CertificateViewerProps {
  certificate: Certificate & {
    course?: { title: string; instructor?: { full_name: string | null } | null }
    user?: { full_name: string | null; email: string } | null
  }
  recipientName?: string
}

function CertificateCard({
  certificate,
  recipientName,
}: CertificateViewerProps) {
  const issuedDate = new Date(certificate.issued_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div
      id={`cert-${certificate.id}`}
      className="relative w-full overflow-hidden rounded-xl border-4 border-primary/30 bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-8 sm:px-10 sm:py-10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
    >
      {/* Decorative corner marks */}
      <div className="absolute left-4 top-4 h-7 w-7 rounded-tl border-l-4 border-t-4 border-primary/50" />
      <div className="absolute right-4 top-4 h-7 w-7 rounded-tr border-r-4 border-t-4 border-primary/50" />
      <div className="absolute bottom-4 left-4 h-7 w-7 rounded-bl border-b-4 border-l-4 border-primary/50" />
      <div className="absolute bottom-4 right-4 h-7 w-7 rounded-br border-b-4 border-r-4 border-primary/50" />

      <div className="flex flex-col items-center gap-6 text-center">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <span className="text-base font-bold tracking-widest text-primary uppercase sm:text-lg">
              Vital Tech LearnHub
            </span>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Certificate of Completion
          </p>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-primary/20" />

        {/* Body */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">This is to certify that</p>
          <p className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'Georgia, serif' }}>
            {recipientName || certificate.user?.full_name || certificate.user?.email || 'Student'}
          </p>
          <p className="text-sm text-muted-foreground">has successfully completed</p>
          <p className="text-lg font-semibold text-primary sm:text-xl">
            {certificate.course?.title}
          </p>
          {certificate.course?.instructor?.full_name && (
            <p className="text-xs text-muted-foreground">
              Instructed by {certificate.course.instructor.full_name}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-primary/20" />

        {/* Footer */}
        <div className="flex w-full items-start justify-between gap-2">
          <div className="flex-1 text-left">
            <p className="text-xs text-muted-foreground">Date Issued</p>
            <p className="text-sm font-medium">{issuedDate}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-[10px] text-muted-foreground">Certificate ID</p>
            <p className="font-mono text-xs font-medium break-all">{certificate.certificate_number}</p>
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs text-muted-foreground">Authorized by</p>
            <p className="text-sm font-medium">Vital Tech Myanmar</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CertificateViewer({ certificate, recipientName }: CertificateViewerProps) {
  function handlePrint(certId: string) {
    const el = document.getElementById(`cert-print-${certId}`)
    if (!el) return

    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return

    win.document.write(`
      <html>
        <head>
          <title>Certificate - ${certificate.course?.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Geist&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            .cert-wrap { width: 800px; }
          </style>
        </head>
        <body>
          <div class="cert-wrap">${el.innerHTML}</div>
          <script>window.onload = function() { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="mr-1 h-4 w-4" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl overflow-y-auto p-4 sm:p-6">
        <div className="space-y-4">
          {/* Hidden full-color cert for print */}
          <div id={`cert-print-${certificate.id}`} className="hidden">
            <CertificateCard certificate={certificate} recipientName={recipientName} />
          </div>

          <CertificateCard certificate={certificate} recipientName={recipientName} />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handlePrint(certificate.id)}>
              <Download className="mr-2 h-4 w-4" />
              Print / Save as PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
