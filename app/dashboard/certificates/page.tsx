import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Calendar } from 'lucide-react'
import { CertificateViewer } from '@/components/certificate-viewer'

export default async function CertificatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id)
    .single()

  const { data: certificates } = await supabase
    .from('certificates')
    .select(`
      *,
      course:courses(
        id,
        title,
        instructor:profiles!instructor_id(full_name)
      )
    `)
    .eq('user_id', user?.id)
    .order('issued_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Certificates</h1>
        <p className="text-muted-foreground">
          Your earned certificates of completion
        </p>
      </div>

      {certificates && certificates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.map((cert) => (
            <Card key={cert.id} className="group transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{cert.course?.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      by {cert.course?.instructor?.full_name ?? 'Instructor'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(cert.issued_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="font-mono">{cert.certificate_number}</span>
                    </div>
                  </div>
                  <CertificateViewer
                    certificate={cert}
                    recipientName={profile?.full_name ?? undefined}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center">
          <CardContent>
            <Award className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No certificates yet</h3>
            <p className="text-muted-foreground">
              Complete a course to earn your first certificate
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
