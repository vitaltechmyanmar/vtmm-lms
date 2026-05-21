import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, Download, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function CertificatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
            <Card key={cert.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{cert.course?.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      by {cert.course?.instructor?.full_name}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(cert.issued_at).toLocaleDateString()}
                      </span>
                      <span>ID: {cert.certificate_number}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
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
              Complete courses to earn certificates
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
