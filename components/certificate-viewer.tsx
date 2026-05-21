'use client'

import { useRef } from 'react'
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
      className="relative w-full overflow-hidden rounded-xl border-4 border-primary/30 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
      style={{ aspectRatio: '1.414/1', minWidth: 540 }}
    >
      {/* Decorative corner marks */}
      <div className="absolute left-4 top-4 h-8 w-8 rounded-tl border-l-4 border-t-4 border-primary/50" />
      <div className="absolute right-4 top-4 h-8 w-8 rounded-tr border-r-4 border-t-4 border-primary/50" />
      <div className="absolute bottom-4 left-4 h-8 w-8 rounded-bl border-b-4 border-l-4 border-primary/50" />
      <div className="absolute bottom-4 right-4 h-8 w-8 rounded-br border-b-4 border-r-4 border-primary/50" />

      <div className="flex h-full flex-col items-center justify-between text-center">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-widest text-primary uppercase">
              Vital Tech LearnHub
            </span>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Certificate of Completion
          </p>
        </div>

        {/* Body */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">This is to certify that</p>
          <p className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Georgia, serif' }}>
            {recipientName || certificate.user?.full_name || certificate.user?.email || 'Student'}
          </p>
          <p className="text-sm text-muted-foreground">has successfully completed</p>
          <p className="text-xl font-semibold text-primary">
            {certificate.course?.title}
          </p>
          {certificate.course?.instructor?.full_name && (
            <p className="text-xs text-muted-foreground">
              Instructed by {certificate.course.instructor.full_name}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex w-full items-end justify-between">
          <div className="text-left">
            <div className="mb-1 h-px w-36 bg-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">Date Issued</p>
            <p className="text-sm font-medium">{issuedDate}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Certificate ID</p>
            <p className="font-mono text-xs font-medium">{certificate.certificate_number}</p>
          </div>
          <div className="text-right">
            <div className="mb-1 ml-auto h-px w-36 bg-muted-foreground/40" />
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
      <DialogContent className="max-w-3xl">
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
