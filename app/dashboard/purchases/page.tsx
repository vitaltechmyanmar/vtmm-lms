import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Calendar, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function PurchasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: payments } = await supabase
    .from('payments')
    .select(`
      *,
      course:courses(
        id,
        title,
        thumbnail_url
      )
    `)
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Purchase History</h1>
        <p className="text-muted-foreground">
          All your course purchases
        </p>
      </div>

      {payments && payments.length > 0 ? (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                      {payment.course?.thumbnail_url ? (
                        <img
                          src={payment.course.thumbnail_url}
                          alt={payment.course.title}
                          className="h-full w-full object-cover rounded"
                        />
                      ) : (
                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{payment.course?.title}</h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(payment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-lg font-semibold">
                        {(payment.amount_in_cents / 100).toFixed(2)}
                      </span>
                    </div>
                    <Badge variant={getStatusColor(payment.status)}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center">
          <CardContent>
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No purchases yet</h3>
            <p className="text-muted-foreground">
              Your purchases will appear here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
